-- Migration: 20261021000001_atomic_surgery_scheduling.sql
-- Description: Add created_by to surgeries, enforce strict permission matrix, and create atomic RPC procedures

-- 1. Add created_by to surgeries if not exists (nullable for backwards-compatibility)
ALTER TABLE public.surgeries 
ADD COLUMN IF NOT EXISTS created_by TEXT;

-- 2. Update get_current_user_role to handle all JWT claim variations
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text AS $$
BEGIN
  RETURN COALESCE(
    NULLIF(current_setting('request.jwt.claims', true)::json->'app_metadata'->>'role', ''),
    NULLIF(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'role', ''),
    NULLIF(current_setting('request.jwt.claims', true)::json->>'role', ''),
    NULLIF(current_setting('request.jwt.claim.role', true), ''),
    'biomedical_engineer'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'biomedical_engineer';
END;
$$ LANGUAGE plpgsql;

-- 3. Restore Strict Permission Matrix for readiness_assessments:
-- The intended matrix specifies readiness_assessments as READ ONLY for hospital_admin, ot_admin, and biomedical_engineer.
DROP POLICY IF EXISTS "readiness_assessments_insert_policy" ON public.readiness_assessments;
DROP POLICY IF EXISTS "readiness_assessments_update_policy" ON public.readiness_assessments;
DROP POLICY IF EXISTS "readiness_assessments_delete_policy" ON public.readiness_assessments;

-- Ensure SELECT policy exists for readiness_assessments
DROP POLICY IF EXISTS "readiness_assessments_select_policy" ON public.readiness_assessments;
CREATE POLICY "readiness_assessments_select_policy" ON public.readiness_assessments
    FOR SELECT TO public
    USING (true);

-- 4. Atomic Surgery Scheduling Function (Single Transaction, SECURITY INVOKER)
CREATE OR REPLACE FUNCTION public.schedule_surgery_with_required_assets(
    p_surgery_code TEXT,
    p_patient_id TEXT,
    p_procedure_name TEXT,
    p_surgery_type TEXT,
    p_operating_room TEXT,
    p_scheduled_start_time TIMESTAMPTZ,
    p_scheduled_end_time TIMESTAMPTZ,
    p_surgeon_name TEXT,
    p_status TEXT DEFAULT 'SCHEDULED',
    p_notes TEXT DEFAULT '',
    p_created_by TEXT DEFAULT NULL,
    p_required_assets JSONB DEFAULT '[]'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_caller_role TEXT;
    v_surgery_id UUID;
    v_code TEXT;
    v_patient TEXT;
    v_type TEXT;
    v_room TEXT;
    v_surgeon TEXT;
    v_status TEXT;
    v_item JSONB;
    v_req_category TEXT;
    v_quantity INT;
    v_criticality TEXT;
    v_assigned_id UUID;
    v_result JSONB;
    v_template_row RECORD;
    v_matching_asset_id UUID;
BEGIN
    -- Enforce RLS Caller Permissions
    v_caller_role := public.get_current_user_role();
    IF v_caller_role NOT IN ('ot_admin', 'hospital_admin') THEN
        RAISE EXCEPTION 'FORBIDDEN: Role ''%'' is not authorized to schedule surgeries.', v_caller_role
            USING ERRCODE = '42501';
    END IF;

    -- Validate required input parameters
    IF p_procedure_name IS NULL OR trim(p_procedure_name) = '' THEN
        RAISE EXCEPTION 'Missing required field: procedure_name' USING ERRCODE = '23502';
    END IF;
    IF p_operating_room IS NULL OR trim(p_operating_room) = '' THEN
        RAISE EXCEPTION 'Missing required field: operating_room' USING ERRCODE = '23502';
    END IF;
    IF p_scheduled_start_time IS NULL THEN
        RAISE EXCEPTION 'Missing required field: scheduled_start_time' USING ERRCODE = '23502';
    END IF;
    IF p_scheduled_end_time IS NULL THEN
        RAISE EXCEPTION 'Missing required field: scheduled_end_time' USING ERRCODE = '23502';
    END IF;
    IF p_scheduled_start_time >= p_scheduled_end_time THEN
        RAISE EXCEPTION 'Invalid schedule: scheduled_start_time must be earlier than scheduled_end_time' USING ERRCODE = '22000';
    END IF;

    -- Normalize values
    v_room := trim(p_operating_room);
    v_status := COALESCE(NULLIF(trim(p_status), ''), 'SCHEDULED');
    v_type := COALESCE(NULLIF(trim(p_surgery_type), ''), 'GENERAL_SURGERY');
    v_surgeon := COALESCE(NULLIF(trim(p_surgeon_name), ''), 'Dr. On-Call Surgeon');
    v_patient := COALESCE(NULLIF(trim(p_patient_id), ''), 'PAT-' || floor(random() * 9000 + 1000)::text);
    v_code := COALESCE(NULLIF(trim(p_surgery_code), ''), 'SURG-2026-' || floor(random() * 900 + 100)::text);

    -- Check OT Double Booking Exclusivity
    IF v_status IN ('SCHEDULED', 'IN_PROGRESS') THEN
        IF EXISTS (
            SELECT 1 FROM public.surgeries
            WHERE operating_room = v_room
              AND status IN ('SCHEDULED', 'IN_PROGRESS')
              AND (scheduled_start_time < p_scheduled_end_time AND scheduled_end_time > p_scheduled_start_time)
        ) THEN
            RAISE EXCEPTION 'Double-booking rejected: Operating Room % is already booked for another active surgery during the requested window.', v_room
                USING ERRCODE = '23505';
        END IF;
    END IF;

    -- Insert into surgeries table
    INSERT INTO public.surgeries (
        surgery_code,
        patient_id,
        procedure_name,
        surgery_type,
        operating_room,
        scheduled_start_time,
        scheduled_end_time,
        surgeon_name,
        status,
        notes,
        created_by,
        created_at,
        updated_at
    ) VALUES (
        v_code,
        v_patient,
        trim(p_procedure_name),
        v_type,
        v_room,
        p_scheduled_start_time,
        p_scheduled_end_time,
        v_surgeon,
        v_status,
        COALESCE(p_notes, ''),
        p_created_by,
        now(),
        now()
    ) RETURNING id INTO v_surgery_id;

    -- Insert Required Assets (either provided or from template)
    IF p_required_assets IS NOT NULL AND jsonb_typeof(p_required_assets) = 'array' AND jsonb_array_length(p_required_assets) > 0 THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(p_required_assets)
        LOOP
            v_req_category := v_item->>'required_category';
            v_quantity := COALESCE((v_item->>'quantity')::int, 1);
            v_criticality := COALESCE(v_item->>'criticality', 'STANDARD');
            v_assigned_id := NULL;
            IF v_item->>'assigned_asset_id' IS NOT NULL AND (v_item->>'assigned_asset_id') != '' THEN
                v_assigned_id := (v_item->>'assigned_asset_id')::uuid;
            END IF;

            IF v_req_category IS NOT NULL AND trim(v_req_category) != '' THEN
                INSERT INTO public.surgery_required_assets (
                    surgery_id,
                    required_category,
                    assigned_asset_id,
                    criticality,
                    quantity,
                    is_manual_override,
                    created_at
                ) VALUES (
                    v_surgery_id,
                    trim(v_req_category),
                    v_assigned_id,
                    v_criticality,
                    v_quantity,
                    true,
                    now()
                )
                ON CONFLICT (surgery_id, required_category) DO UPDATE SET
                    assigned_asset_id = EXCLUDED.assigned_asset_id,
                    criticality = EXCLUDED.criticality,
                    quantity = EXCLUDED.quantity,
                    is_manual_override = true;
            END IF;
        END LOOP;
    ELSE
        -- Apply default equipment template for procedure type
        FOR v_template_row IN
            SELECT required_category, quantity, criticality 
            FROM public.surgery_templates
            WHERE procedure_type = v_type
        LOOP
            -- Auto-find first available asset of this category
            SELECT id INTO v_matching_asset_id
            FROM public.assets
            WHERE category = v_template_row.required_category
              AND status = 'AVAILABLE'
            LIMIT 1;

            INSERT INTO public.surgery_required_assets (
                surgery_id,
                required_category,
                assigned_asset_id,
                criticality,
                quantity,
                is_manual_override,
                created_at
            ) VALUES (
                v_surgery_id,
                v_template_row.required_category,
                v_matching_asset_id,
                v_template_row.criticality,
                v_template_row.quantity,
                false,
                now()
            )
            ON CONFLICT (surgery_id, required_category) DO NOTHING;
        END LOOP;
    END IF;

    -- Return the newly created surgery formatted with its equipment rows
    SELECT jsonb_build_object(
        'id', s.id,
        'surgery_code', s.surgery_code,
        'patient_id', s.patient_id,
        'procedure_name', s.procedure_name,
        'surgery_type', s.surgery_type,
        'operating_room', s.operating_room,
        'scheduled_start_time', s.scheduled_start_time,
        'scheduled_end_time', s.scheduled_end_time,
        'surgeon_name', s.surgeon_name,
        'status', s.status,
        'notes', s.notes,
        'created_by', s.created_by,
        'created_at', s.created_at,
        'updated_at', s.updated_at,
        'required_assets', COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', sra.id,
                        'surgery_id', sra.surgery_id,
                        'required_category', sra.required_category,
                        'assigned_asset_id', sra.assigned_asset_id,
                        'criticality', sra.criticality,
                        'quantity', sra.quantity,
                        'is_manual_override', sra.is_manual_override,
                        'assigned_asset', CASE WHEN a.id IS NOT NULL THEN
                            jsonb_build_object(
                                'id', a.id,
                                'asset_tag', a.asset_tag,
                                'name', a.name,
                                'category', a.category,
                                'status', a.status,
                                'operating_room', a.operating_room
                            )
                        ELSE NULL END
                    )
                )
                FROM public.surgery_required_assets sra
                LEFT JOIN public.assets a ON sra.assigned_asset_id = a.id
                WHERE sra.surgery_id = s.id
            ),
            '[]'::jsonb
        )
    ) INTO v_result
    FROM public.surgeries s
    WHERE s.id = v_surgery_id;

    RETURN v_result;
END;
$$;

-- 5. Atomic Surgery Update Function
CREATE OR REPLACE FUNCTION public.update_surgery_atomic(
    p_id UUID,
    p_updates JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_caller_role TEXT;
    v_existing RECORD;
    v_new_room TEXT;
    v_new_start TIMESTAMPTZ;
    v_new_end TIMESTAMPTZ;
    v_new_status TEXT;
    v_result JSONB;
BEGIN
    v_caller_role := public.get_current_user_role();
    IF v_caller_role NOT IN ('ot_admin', 'hospital_admin') THEN
        RAISE EXCEPTION 'FORBIDDEN: Role ''%'' is not authorized to edit surgeries.', v_caller_role
            USING ERRCODE = '42501';
    END IF;

    SELECT * INTO v_existing FROM public.surgeries WHERE id = p_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Surgery not found: %', p_id USING ERRCODE = 'P0002';
    END IF;

    v_new_room := COALESCE(p_updates->>'operating_room', v_existing.operating_room);
    v_new_start := CASE WHEN p_updates ? 'scheduled_start_time' THEN (p_updates->>'scheduled_start_time')::timestamptz ELSE v_existing.scheduled_start_time END;
    v_new_end := CASE WHEN p_updates ? 'scheduled_end_time' THEN (p_updates->>'scheduled_end_time')::timestamptz ELSE v_existing.scheduled_end_time END;
    v_new_status := COALESCE(p_updates->>'status', v_existing.status);

    -- Double booking check on update if room or time changed
    IF v_new_status IN ('SCHEDULED', 'IN_PROGRESS') THEN
        IF EXISTS (
            SELECT 1 FROM public.surgeries
            WHERE operating_room = v_new_room
              AND status IN ('SCHEDULED', 'IN_PROGRESS')
              AND id != p_id
              AND (scheduled_start_time < v_new_end AND scheduled_end_time > v_new_start)
        ) THEN
            RAISE EXCEPTION 'Double-booking rejected: Operating Room % is already booked for another active surgery during the requested window.', v_new_room
                USING ERRCODE = '23505';
        END IF;
    END IF;

    UPDATE public.surgeries
    SET
        procedure_name = COALESCE(p_updates->>'procedure_name', procedure_name),
        surgery_type = COALESCE(p_updates->>'surgery_type', surgery_type),
        operating_room = v_new_room,
        scheduled_start_time = v_new_start,
        scheduled_end_time = v_new_end,
        surgeon_name = COALESCE(p_updates->>'surgeon_name', surgeon_name),
        status = v_new_status,
        notes = COALESCE(p_updates->>'notes', notes),
        updated_at = now()
    WHERE id = p_id;

    SELECT jsonb_build_object(
        'id', s.id,
        'surgery_code', s.surgery_code,
        'patient_id', s.patient_id,
        'procedure_name', s.procedure_name,
        'surgery_type', s.surgery_type,
        'operating_room', s.operating_room,
        'scheduled_start_time', s.scheduled_start_time,
        'scheduled_end_time', s.scheduled_end_time,
        'surgeon_name', s.surgeon_name,
        'status', s.status,
        'notes', s.notes,
        'created_by', s.created_by,
        'created_at', s.created_at,
        'updated_at', s.updated_at
    ) INTO v_result
    FROM public.surgeries s
    WHERE s.id = p_id;

    RETURN v_result;
END;
$$;

-- 6. Atomic Surgery Cancel Function
CREATE OR REPLACE FUNCTION public.cancel_surgery_atomic(
    p_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_caller_role TEXT;
    v_result JSONB;
BEGIN
    v_caller_role := public.get_current_user_role();
    IF v_caller_role NOT IN ('ot_admin', 'hospital_admin') THEN
        RAISE EXCEPTION 'FORBIDDEN: Role ''%'' is not authorized to cancel surgeries.', v_caller_role
            USING ERRCODE = '42501';
    END IF;

    UPDATE public.surgeries
    SET status = 'CANCELLED', updated_at = now()
    WHERE id = p_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Surgery not found: %', p_id USING ERRCODE = 'P0002';
    END IF;

    SELECT jsonb_build_object(
        'id', s.id,
        'surgery_code', s.surgery_code,
        'status', s.status,
        'updated_at', s.updated_at
    ) INTO v_result
    FROM public.surgeries s
    WHERE s.id = p_id;

    RETURN v_result;
END;
$$;

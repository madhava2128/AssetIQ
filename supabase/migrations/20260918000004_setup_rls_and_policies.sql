-- Migration: 20260918000004_setup_rls_and_policies.sql
-- Description: Enable RLS on all tables and create role-based access control policies

-- Helper function to extract current user role from JWT claims or user_metadata
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text AS $$
BEGIN
  RETURN COALESCE(
    NULLIF(current_setting('request.jwt.claims', true)::json->'app_metadata'->>'role', ''),
    NULLIF(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'role', ''),
    'biomedical_engineer'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'biomedical_engineer';
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on all 8 tables
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE surgeries ENABLE ROW LEVEL SECURITY;
ALTER TABLE surgery_required_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE breakdown_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_utilization ENABLE ROW LEVEL SECURITY;
ALTER TABLE readiness_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE readiness_assessments ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------
-- 1. ASSETS POLICIES
-- Read: All authenticated users/viewers
-- Write: biomedical_engineer, hospital_admin
-- ----------------------------------------------------
CREATE POLICY "assets_select_policy" ON assets
    FOR SELECT TO public
    USING (true);

CREATE POLICY "assets_insert_policy" ON assets
    FOR INSERT TO public
    WITH CHECK (public.get_current_user_role() IN ('biomedical_engineer', 'hospital_admin'));

CREATE POLICY "assets_update_policy" ON assets
    FOR UPDATE TO public
    USING (public.get_current_user_role() IN ('biomedical_engineer', 'hospital_admin'))
    WITH CHECK (public.get_current_user_role() IN ('biomedical_engineer', 'hospital_admin'));

CREATE POLICY "assets_delete_policy" ON assets
    FOR DELETE TO public
    USING (public.get_current_user_role() IN ('biomedical_engineer', 'hospital_admin'));

-- ----------------------------------------------------
-- 2. MAINTENANCE_RECORDS POLICIES
-- Read: All authenticated users/viewers
-- Write: biomedical_engineer, hospital_admin
-- ----------------------------------------------------
CREATE POLICY "maintenance_records_select_policy" ON maintenance_records
    FOR SELECT TO public
    USING (true);

CREATE POLICY "maintenance_records_insert_policy" ON maintenance_records
    FOR INSERT TO public
    WITH CHECK (public.get_current_user_role() IN ('biomedical_engineer', 'hospital_admin'));

CREATE POLICY "maintenance_records_update_policy" ON maintenance_records
    FOR UPDATE TO public
    USING (public.get_current_user_role() IN ('biomedical_engineer', 'hospital_admin'))
    WITH CHECK (public.get_current_user_role() IN ('biomedical_engineer', 'hospital_admin'));

CREATE POLICY "maintenance_records_delete_policy" ON maintenance_records
    FOR DELETE TO public
    USING (public.get_current_user_role() IN ('biomedical_engineer', 'hospital_admin'));

-- ----------------------------------------------------
-- 3. SURGERIES POLICIES
-- Read: All authenticated users/viewers
-- Write: ot_admin, hospital_admin
-- ----------------------------------------------------
CREATE POLICY "surgeries_select_policy" ON surgeries
    FOR SELECT TO public
    USING (true);

CREATE POLICY "surgeries_insert_policy" ON surgeries
    FOR INSERT TO public
    WITH CHECK (public.get_current_user_role() IN ('ot_admin', 'hospital_admin'));

CREATE POLICY "surgeries_update_policy" ON surgeries
    FOR UPDATE TO public
    USING (public.get_current_user_role() IN ('ot_admin', 'hospital_admin'))
    WITH CHECK (public.get_current_user_role() IN ('ot_admin', 'hospital_admin'));

CREATE POLICY "surgeries_delete_policy" ON surgeries
    FOR DELETE TO public
    USING (public.get_current_user_role() IN ('ot_admin', 'hospital_admin'));

-- ----------------------------------------------------
-- 4. SURGERY_REQUIRED_ASSETS POLICIES
-- Read: All authenticated users/viewers
-- Write: ot_admin, hospital_admin
-- ----------------------------------------------------
CREATE POLICY "surgery_required_assets_select_policy" ON surgery_required_assets
    FOR SELECT TO public
    USING (true);

CREATE POLICY "surgery_required_assets_insert_policy" ON surgery_required_assets
    FOR INSERT TO public
    WITH CHECK (public.get_current_user_role() IN ('ot_admin', 'hospital_admin'));

CREATE POLICY "surgery_required_assets_update_policy" ON surgery_required_assets
    FOR UPDATE TO public
    USING (public.get_current_user_role() IN ('ot_admin', 'hospital_admin'))
    WITH CHECK (public.get_current_user_role() IN ('ot_admin', 'hospital_admin'));

CREATE POLICY "surgery_required_assets_delete_policy" ON surgery_required_assets
    FOR DELETE TO public
    USING (public.get_current_user_role() IN ('ot_admin', 'hospital_admin'));

-- ----------------------------------------------------
-- 5. BREAKDOWN_INCIDENTS POLICIES
-- Read: All authenticated users/viewers
-- Write: biomedical_engineer, hospital_admin
-- ----------------------------------------------------
CREATE POLICY "breakdown_incidents_select_policy" ON breakdown_incidents
    FOR SELECT TO public
    USING (true);

CREATE POLICY "breakdown_incidents_insert_policy" ON breakdown_incidents
    FOR INSERT TO public
    WITH CHECK (public.get_current_user_role() IN ('biomedical_engineer', 'hospital_admin'));

CREATE POLICY "breakdown_incidents_update_policy" ON breakdown_incidents
    FOR UPDATE TO public
    USING (public.get_current_user_role() IN ('biomedical_engineer', 'hospital_admin'))
    WITH CHECK (public.get_current_user_role() IN ('biomedical_engineer', 'hospital_admin'));

CREATE POLICY "breakdown_incidents_delete_policy" ON breakdown_incidents
    FOR DELETE TO public
    USING (public.get_current_user_role() IN ('biomedical_engineer', 'hospital_admin'));

-- ----------------------------------------------------
-- 6. ASSET_UTILIZATION POLICIES
-- Read: All authenticated users/viewers
-- Write: biomedical_engineer, hospital_admin
-- ----------------------------------------------------
CREATE POLICY "asset_utilization_select_policy" ON asset_utilization
    FOR SELECT TO public
    USING (true);

CREATE POLICY "asset_utilization_insert_policy" ON asset_utilization
    FOR INSERT TO public
    WITH CHECK (public.get_current_user_role() IN ('biomedical_engineer', 'hospital_admin'));

CREATE POLICY "asset_utilization_update_policy" ON asset_utilization
    FOR UPDATE TO public
    USING (public.get_current_user_role() IN ('biomedical_engineer', 'hospital_admin'))
    WITH CHECK (public.get_current_user_role() IN ('biomedical_engineer', 'hospital_admin'));

CREATE POLICY "asset_utilization_delete_policy" ON asset_utilization
    FOR DELETE TO public
    USING (public.get_current_user_role() IN ('biomedical_engineer', 'hospital_admin'));

-- ----------------------------------------------------
-- 7. READINESS_CONFIG POLICIES
-- Read: All authenticated users/viewers
-- Write: hospital_admin
-- ----------------------------------------------------
CREATE POLICY "readiness_config_select_policy" ON readiness_config
    FOR SELECT TO public
    USING (true);

CREATE POLICY "readiness_config_insert_policy" ON readiness_config
    FOR INSERT TO public
    WITH CHECK (public.get_current_user_role() = 'hospital_admin');

CREATE POLICY "readiness_config_update_policy" ON readiness_config
    FOR UPDATE TO public
    USING (public.get_current_user_role() = 'hospital_admin')
    WITH CHECK (public.get_current_user_role() = 'hospital_admin');

-- ----------------------------------------------------
-- 8. READINESS_ASSESSMENTS POLICIES
-- Read: All authenticated users/viewers
-- Write: ot_admin, biomedical_engineer, hospital_admin
-- ----------------------------------------------------
CREATE POLICY "readiness_assessments_select_policy" ON readiness_assessments
    FOR SELECT TO public
    USING (true);

CREATE POLICY "readiness_assessments_insert_policy" ON readiness_assessments
    FOR INSERT TO public
    WITH CHECK (public.get_current_user_role() IN ('ot_admin', 'biomedical_engineer', 'hospital_admin'));

CREATE POLICY "readiness_assessments_update_policy" ON readiness_assessments
    FOR UPDATE TO public
    USING (public.get_current_user_role() IN ('ot_admin', 'biomedical_engineer', 'hospital_admin'))
    WITH CHECK (public.get_current_user_role() IN ('ot_admin', 'biomedical_engineer', 'hospital_admin'));

-- Migration: 20260918000006_stage3_surgery_templates_and_criticality.sql
-- Description: Add surgery templates, equipment criticality levels, and OT double-booking prevention trigger

-- 1. Extend surgeries table
ALTER TABLE surgeries ADD COLUMN IF NOT EXISTS surgery_type TEXT DEFAULT 'GENERAL_SURGERY';
ALTER TABLE surgeries ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Extend surgery_required_assets table
ALTER TABLE surgery_required_assets ADD COLUMN IF NOT EXISTS criticality TEXT NOT NULL DEFAULT 'STANDARD';
ALTER TABLE surgery_required_assets ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1;
ALTER TABLE surgery_required_assets ADD COLUMN IF NOT EXISTS is_manual_override BOOLEAN NOT NULL DEFAULT false;

-- 3. Create surgery_templates table
CREATE TABLE IF NOT EXISTS surgery_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    procedure_type TEXT NOT NULL,
    required_category TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    criticality TEXT NOT NULL DEFAULT 'STANDARD',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_template_type_category UNIQUE (procedure_type, required_category)
);

-- Seed default surgery templates
INSERT INTO surgery_templates (id, procedure_type, required_category, quantity, criticality)
VALUES
-- LAPAROSCOPIC TEMPLATE
('f0000000-0000-0000-0000-000000000001', 'LAPAROSCOPIC', 'ANESTHESIA_MACHINE', 1, 'CRITICAL'),
('f0000000-0000-0000-0000-000000000002', 'LAPAROSCOPIC', 'LAPAROSCOPIC_TOWER', 1, 'CRITICAL'),
('f0000000-0000-0000-0000-000000000003', 'LAPAROSCOPIC', 'ELECTROSURGICAL_UNIT', 1, 'IMPORTANT'),
('f0000000-0000-0000-0000-000000000004', 'LAPAROSCOPIC', 'SURGICAL_MONITOR', 1, 'CRITICAL'),

-- CARDIAC TEMPLATE
('f0000000-0000-0000-0000-000000000005', 'CARDIAC', 'ANESTHESIA_MACHINE', 1, 'CRITICAL'),
('f0000000-0000-0000-0000-000000000006', 'CARDIAC', 'CARM_FLUOROSCOPY', 1, 'IMPORTANT'),
('f0000000-0000-0000-0000-000000000007', 'CARDIAC', 'ELECTROSURGICAL_UNIT', 1, 'CRITICAL'),
('f0000000-0000-0000-0000-000000000008', 'CARDIAC', 'SURGICAL_MONITOR', 2, 'CRITICAL'),

-- ORTHOPEDIC TEMPLATE
('f0000000-0000-0000-0000-000000000009', 'ORTHOPEDIC', 'ANESTHESIA_MACHINE', 1, 'CRITICAL'),
('f0000000-0000-0000-0000-000000000010', 'ORTHOPEDIC', 'CARM_FLUOROSCOPY', 1, 'CRITICAL'),
('f0000000-0000-0000-0000-000000000011', 'ORTHOPEDIC', 'ELECTROSURGICAL_UNIT', 1, 'IMPORTANT'),
('f0000000-0000-0000-0000-000000000012', 'ORTHOPEDIC', 'SURGICAL_MONITOR', 1, 'STANDARD'),

-- NEUROSURGERY TEMPLATE
('f0000000-0000-0000-0000-000000000013', 'NEUROSURGERY', 'ANESTHESIA_MACHINE', 1, 'CRITICAL'),
('f0000000-0000-0000-0000-000000000014', 'NEUROSURGERY', 'CARM_FLUOROSCOPY', 1, 'IMPORTANT'),
('f0000000-0000-0000-0000-000000000015', 'NEUROSURGERY', 'ELECTROSURGICAL_UNIT', 1, 'CRITICAL'),
('f0000000-0000-0000-0000-000000000016', 'NEUROSURGERY', 'SURGICAL_MONITOR', 2, 'CRITICAL'),

-- GENERAL_SURGERY TEMPLATE
('f0000000-0000-0000-0000-000000000017', 'GENERAL_SURGERY', 'ANESTHESIA_MACHINE', 1, 'CRITICAL'),
('f0000000-0000-0000-0000-000000000018', 'GENERAL_SURGERY', 'ELECTROSURGICAL_UNIT', 1, 'IMPORTANT'),
('f0000000-0000-0000-0000-000000000019', 'GENERAL_SURGERY', 'SURGICAL_MONITOR', 1, 'CRITICAL')
ON CONFLICT (procedure_type, required_category) DO UPDATE SET
    quantity = EXCLUDED.quantity,
    criticality = EXCLUDED.criticality;

-- 4. Trigger Function: Prevent double-booking the same OT at overlapping times
CREATE OR REPLACE FUNCTION check_ot_double_booking()
RETURNS TRIGGER AS $$
BEGIN
    -- Only active scheduled/in-progress surgeries can conflict
    IF NEW.status IN ('SCHEDULED', 'IN_PROGRESS') THEN
        IF EXISTS (
            SELECT 1 FROM surgeries
            WHERE operating_room = NEW.operating_room
              AND status IN ('SCHEDULED', 'IN_PROGRESS')
              AND id != NEW.id
              AND (scheduled_start_time < NEW.scheduled_end_time AND scheduled_end_time > NEW.scheduled_start_time)
        ) THEN
            RAISE EXCEPTION 'Double-booking rejected: Operating Room % is already booked for another active surgery during the requested window (% to %)',
                NEW.operating_room, NEW.scheduled_start_time, NEW.scheduled_end_time;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_ot_double_booking ON surgeries;
CREATE TRIGGER trg_prevent_ot_double_booking
    BEFORE INSERT OR UPDATE ON surgeries
    FOR EACH ROW
    EXECUTE PROCEDURE check_ot_double_booking();

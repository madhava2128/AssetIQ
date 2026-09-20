-- Migration: 20260918000005_stage2_asset_fields_and_constraints.sql
-- Description: Add Stage 2 fields (warranty, department, location, failure_type) and database-level safety triggers

-- Add location, department, warranty, and contract columns to assets
ALTER TABLE assets ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Main Hospital Building';
ALTER TABLE assets ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'Biomedical Engineering';
ALTER TABLE assets ADD COLUMN IF NOT EXISTS warranty_expiration_date TIMESTAMPTZ;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS contract_vendor TEXT;

-- Add failure_type column to breakdown_incidents
ALTER TABLE breakdown_incidents ADD COLUMN IF NOT EXISTS failure_type TEXT;

-- Trigger Function: Prevent marking an asset AVAILABLE if it has an unresolved breakdown incident
CREATE OR REPLACE FUNCTION check_asset_status_against_breakdowns()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'AVAILABLE' THEN
        IF EXISTS (
            SELECT 1 FROM breakdown_incidents
            WHERE asset_id = NEW.id AND resolved_at IS NULL
        ) THEN
            RAISE EXCEPTION 'Cannot mark asset AVAILABLE while an unresolved breakdown incident exists (Asset ID: %)', NEW.id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_available_with_open_breakdown ON assets;
CREATE TRIGGER trg_prevent_available_with_open_breakdown
    BEFORE INSERT OR UPDATE ON assets
    FOR EACH ROW
    EXECUTE PROCEDURE check_asset_status_against_breakdowns();

-- Trigger Function: Require severity and failure_type before resolving a breakdown incident
CREATE OR REPLACE FUNCTION validate_breakdown_resolution()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.resolved_at IS NOT NULL THEN
        IF NEW.severity IS NULL OR NEW.severity = '' THEN
            RAISE EXCEPTION 'Severity must be specified before resolving a breakdown incident.';
        END IF;
        IF NEW.failure_type IS NULL OR NEW.failure_type = '' THEN
            RAISE EXCEPTION 'Failure type must be specified before resolving a breakdown incident.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_breakdown_resolution ON breakdown_incidents;
CREATE TRIGGER trg_validate_breakdown_resolution
    BEFORE INSERT OR UPDATE ON breakdown_incidents
    FOR EACH ROW
    EXECUTE PROCEDURE validate_breakdown_resolution();

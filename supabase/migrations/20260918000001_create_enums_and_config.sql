-- Migration: 20260918000001_create_enums_and_config.sql
-- Description: Create readiness_config table and role helper functions for AssetIQ

-- Readiness Configuration Table (Thresholds - do not hardcode anywhere in app)
CREATE TABLE IF NOT EXISTS readiness_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    at_risk_threshold NUMERIC NOT NULL DEFAULT 0.35,
    not_ready_threshold NUMERIC NOT NULL DEFAULT 0.70,
    pm_overdue_grace_days INTEGER NOT NULL DEFAULT 7,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure single row or default values in readiness_config
INSERT INTO readiness_config (id, at_risk_threshold, not_ready_threshold, pm_overdue_grace_days)
VALUES ('00000000-0000-0000-0000-000000000001', 0.35, 0.70, 7)
ON CONFLICT (id) DO NOTHING;

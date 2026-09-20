-- Migration: 20260918000003_create_history_and_assessment_tables.sql
-- Description: Create maintenance_records, breakdown_incidents, asset_utilization, and readiness_assessments tables

-- Maintenance Records Table
CREATE TABLE IF NOT EXISTS maintenance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    maintenance_type TEXT NOT NULL,
    performed_by TEXT NOT NULL,
    performed_at TIMESTAMPTZ NOT NULL,
    details TEXT,
    parts_replaced TEXT[],
    cost NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Breakdown Incidents Table
CREATE TABLE IF NOT EXISTS breakdown_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    reported_at TIMESTAMPTZ NOT NULL,
    resolved_at TIMESTAMPTZ,
    severity TEXT NOT NULL,
    failure_type TEXT,
    description TEXT NOT NULL,
    resolution_notes TEXT,
    downtime_hours NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Asset Utilization Table
CREATE TABLE IF NOT EXISTS asset_utilization (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    recorded_date DATE NOT NULL,
    daily_operating_hours NUMERIC NOT NULL DEFAULT 0,
    procedure_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_asset_recorded_date UNIQUE (asset_id, recorded_date)
);

-- Readiness Assessments Table (Historical assessment persistence)
CREATE TABLE IF NOT EXISTS readiness_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    surgery_id UUID NOT NULL REFERENCES surgeries(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    rule_result JSONB NOT NULL DEFAULT '{}'::jsonb,
    ml_risk_score NUMERIC NOT NULL DEFAULT 0,
    final_status TEXT NOT NULL DEFAULT 'UNKNOWN',
    explanation_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Migration: 20260918000002_create_core_tables.sql
-- Description: Create assets, surgeries, and surgery_required_assets tables for AssetIQ

-- Assets Table
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_tag TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    model TEXT NOT NULL,
    serial_number TEXT UNIQUE NOT NULL,
    operating_room TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'UNDER_REPAIR', -- Conservative safety default
    last_pm_date TIMESTAMPTZ NOT NULL,
    next_pm_due_date TIMESTAMPTZ NOT NULL,
    total_operating_hours NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Surgeries Table
CREATE TABLE IF NOT EXISTS surgeries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    surgery_code TEXT UNIQUE NOT NULL,
    patient_id TEXT NOT NULL,
    procedure_name TEXT NOT NULL,
    operating_room TEXT NOT NULL,
    scheduled_start_time TIMESTAMPTZ NOT NULL,
    scheduled_end_time TIMESTAMPTZ NOT NULL,
    surgeon_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'SCHEDULED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Surgery Required Assets Junction Table
CREATE TABLE IF NOT EXISTS surgery_required_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    surgery_id UUID NOT NULL REFERENCES surgeries(id) ON DELETE CASCADE,
    required_category TEXT NOT NULL,
    assigned_asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_surgery_category UNIQUE (surgery_id, required_category)
);

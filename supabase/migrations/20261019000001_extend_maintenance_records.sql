-- Migration: 20261019000001_extend_maintenance_records.sql
-- Description: Add status/outcome, next_due_date, time_taken_hours, and action_needed to maintenance_records

ALTER TABLE maintenance_records ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'COMPLETED';
ALTER TABLE maintenance_records ADD COLUMN IF NOT EXISTS next_due_date TIMESTAMPTZ;
ALTER TABLE maintenance_records ADD COLUMN IF NOT EXISTS time_taken_hours NUMERIC;
ALTER TABLE maintenance_records ADD COLUMN IF NOT EXISTS action_needed TEXT;

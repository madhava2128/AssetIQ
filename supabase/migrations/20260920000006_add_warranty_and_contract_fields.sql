-- Migration: 20260920000006_add_warranty_and_contract_fields.sql
-- Description: Add warranty vendor, contract reference number, warranty end date, and contract status fields to assets table

ALTER TABLE assets ADD COLUMN IF NOT EXISTS warranty_vendor TEXT DEFAULT 'Philips Healthcare';
ALTER TABLE assets ADD COLUMN IF NOT EXISTS warranty_contract_number TEXT DEFAULT 'PHS-2024-0101';
ALTER TABLE assets ADD COLUMN IF NOT EXISTS warranty_end_date TIMESTAMPTZ;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS contract_status TEXT DEFAULT 'Active';

-- Copy values from warranty_expiration_date to warranty_end_date if warranty_expiration_date was populated
UPDATE assets 
SET warranty_end_date = warranty_expiration_date 
WHERE warranty_end_date IS NULL AND warranty_expiration_date IS NOT NULL;

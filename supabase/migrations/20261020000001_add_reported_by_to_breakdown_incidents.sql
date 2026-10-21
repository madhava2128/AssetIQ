-- Migration: 20261020000001_add_reported_by_to_breakdown_incidents.sql
-- Description: Add reported_by column to breakdown_incidents table for tracking who reported the equipment incident

ALTER TABLE breakdown_incidents
ADD COLUMN IF NOT EXISTS reported_by TEXT;

# Stage 1 — Database Foundation (Supabase) Report

**Timestamp**: 2026-09-18T19:25:30+05:30  
**Status**: PASSED  
**Authoritative Memory Checkpoint**: Stage 1 Completion

---

## 1. Summary of Built Architecture & Schema

The core database foundation for AssetIQ was created using timestamped, sequential Supabase PostgreSQL migration files in `supabase/migrations/` and RLS policy configurations in `supabase/policies/`.

### Tables Created (8/8)
1. **`readiness_config`**: Stores configurable system thresholds.
   - `at_risk_threshold`: 0.35 (default)
   - `not_ready_threshold`: 0.70 (default)
   - `pm_overdue_grace_days`: 7 (default)
2. **`assets`**: Medical asset catalog. Defaults status to conservative `'UNDER_REPAIR'`.
3. **`surgeries`**: Operating room surgery schedule.
4. **`surgery_required_assets`**: Links surgeries to required equipment categories and assigned asset IDs.
   - Foreign Keys: `surgery_id` → `surgeries.id`, `assigned_asset_id` → `assets.id`.
5. **`maintenance_records`**: Maintenance history.
   - Foreign Key: `asset_id` → `assets.id`.
6. **`breakdown_incidents`**: Incident breakdown history with downtime tracking.
   - Foreign Key: `asset_id` → `assets.id`.
7. **`asset_utilization`**: Daily operating hours and procedure counts per asset.
   - Foreign Key: `asset_id` → `assets.id`.
8. **`readiness_assessments`**: Historical assessment audit trail storing `surgery_id`, `asset_id`, `timestamp`, `rule_result` (JSONB), `ml_risk_score`, `final_status`, and `explanation_text`.
   - Foreign Keys: `surgery_id` → `surgeries.id`, `asset_id` → `assets.id`.

---

## 2. Row Level Security (RLS) & Roles

Row Level Security (RLS) was enabled across all 8 tables with `get_current_user_role()` evaluating JWT claims (`app_metadata` / `user_metadata` role).

- **`biomedical_engineer`**: Full write access to `assets`, `maintenance_records`, `breakdown_incidents`, `asset_utilization`. Read access to all tables.
- **`ot_admin`**: Full write access to `surgeries`, `surgery_required_assets`, `readiness_assessments`. Read access to all tables.
- **`hospital_admin`**: Full write/admin access across all tables including `readiness_config`.
- **`viewer`**: Read-only access across all tables.

---

## 3. Seed Data Summary (Idempotent)

- **Assets**: 45 assets across 5 categories (`ANESTHESIA_MACHINE`, `LAPAROSCOPIC_TOWER`, `CARM_FLUOROSCOPY`, `SURGICAL_MONITOR`, `ELECTROSURGICAL_UNIT`).
- **Surgeries**: 15 surgeries scheduled over the next 7 days across 6 Operating Rooms.
- **Historical Data**: 12 months of synthetic maintenance records, breakdown incidents, and utilization logs for ML training.
- **Idempotency**: All `INSERT` queries use `ON CONFLICT (id) DO UPDATE` or `ON CONFLICT DO NOTHING`.

---

## 4. Verification Results & Test Output

### Automated Tests Run:
1. `npm test` (`apps/web/tests/unit/stage1_database.test.js`)
   - `✓ All 8 tables, FK constraints, and default readiness_config are created cleanly`
   - `✓ Seed script runs twice idempotently without row duplication`
   - `✓ RLS policy helper get_current_user_role correctly resolves role`
   - **Result**: 3/3 Passed (0.462s).

2. `node supabase/seed/test_stage1.js`
   - **Result**: `--- Stage 1 Verification Complete: ALL TESTS PASSED ---`
   - Confirmed row counts identical after running seed twice (Idempotency verified).

---

## 5. Assumptions & Safety Fallbacks

1. **Patient Safety Defaults**: Assets without an explicit status default to `'UNDER_REPAIR'` rather than `'AVAILABLE'`.
2. **Configurable Thresholds**: All ML risk thresholds and PM grace days are read directly from `readiness_config` and never hardcoded in application logic.

# AssetIQ — Warranty/Contract Fields & Full Demo Mock Data Seeding Report

## Overview
Added missing warranty and contract fields (`warranty_vendor`, `warranty_contract_number`, `warranty_end_date`, `contract_status`) to the database schema and populated a rich, varied demo dataset across assets, breakdown incidents, maintenance records, and scheduled surgeries.

---

## 1. Schema Additions
Created migration [`supabase/migrations/20260920000006_add_warranty_and_contract_fields.sql`](file:///Users/madhava/Desktop/AssetIQ/supabase/migrations/20260920000006_add_warranty_and_contract_fields.sql):
- `warranty_vendor` (TEXT, DEFAULT 'Philips Healthcare'): Vendor or company providing warranty/service contract.
- `warranty_contract_number` (TEXT, DEFAULT 'PHS-2024-0101'): Realistic contract reference number.
- `warranty_end_date` (TIMESTAMPTZ): Warranty expiration date used by Stage 4 rules engine for `RULE_4_WARRANTY_CONTRACT_EXPIRED`. Backfilled from `warranty_expiration_date` if populated.
- `contract_status` (TEXT, DEFAULT 'Active'): Status indicator ('Active', 'Expiring Soon', 'Expired').

---

## 2. Seeded Demo Data Summary

| Domain Entity | Total Seeded Count | Breakdown / Details |
|---|---|---|
| **Medical Assets** | **50 Assets** | 8 Anesthesia Machines, 5 Laparoscopic Towers, 4 C-Arm Imaging Units, 5 ICU/OR Ventilators, 5 Surgical Monitors, 2 Defibrillators, 3 Electrosurgical Units (ESUs), 4 Infusion Pumps, 3 Surgical Lights, 3 Sterilizers/Autoclaves, 3 ECG Machines, 5 Dialysis Machines. |
| **Breakdown Incidents** | **15 Incidents** | 8 Open incidents (causing `UNDER_REPAIR` statuses), 7 Resolved incidents over the last 12 months with non-trivial downtime hours (totaling 2,684 downtime hours). |
| **Maintenance Records** | **35 Records** | PM checks, calibrations, and corrective maintenance records spanning 12 months with realistic costs ($250–$1,100) and replacement parts. |
| **Scheduled Surgeries** | **15 Surgeries** | Spread across OR-1 to OR-6 over the next 1–10 days covering LAPAROSCOPIC, CARDIAC, ORTHOPEDIC, NEUROSURGERY, and GENERAL_SURGERY. |
| **Surgery Required Assets** | **40 Allocations** | Criticality-weighted asset assignments mapping equipment to scheduled surgeries. |

---

## 3. Engineered Readiness Outcomes Verification

| Readiness Outcome | Surgery Count | Examples | Triggering Rule / Cause |
|---|---|---|---|
| **READY** | **8 Surgeries** | `SURG-2026-001`, `SURG-2026-003`, `SURG-2026-008`, `SURG-2026-011`, `SURG-2026-012`, `SURG-2026-013`, `SURG-2026-014`, `SURG-2026-015` | All assigned equipment is `AVAILABLE`, PM-compliant, with active warranty coverage. |
| **AT_RISK** | **4 Surgeries** | `SURG-2026-002`, `SURG-2026-005`, `SURG-2026-007`, `SURG-2026-010` | `Rule 4` (Expired warranty on C-Arm), `Rule 5` (PM overdue past grace on Lap Tower & Anesthesia Station), `Rule 6` (Breakdown reported in last 30d on CRITICAL monitor). |
| **NOT_READY** | **3 Surgeries** | `SURG-2026-004`, `SURG-2026-006`, `SURG-2026-009` | `Rule 1/2` (Assigned Anesthesia Machine `UNDER_MAINTENANCE` or `UNDER_REPAIR`, Lap Tower `UNDER_REPAIR`). |

---

## 4. Idempotency Verification
- Seeding operations in both [`apps/web/lib/supabase/mock-db.js`](file:///Users/madhava/Desktop/AssetIQ/apps/web/lib/supabase/mock-db.js) and [`supabase/seed/seed.sql`](file:///Users/madhava/Desktop/AssetIQ/supabase/seed/seed.sql) utilize explicit primary keys (`id`) with `ON CONFLICT (id) DO UPDATE SET ...` clauses.
- Unit test `Seed script runs twice idempotently without row duplication` in [`stage1_database.test.js`](file:///Users/madhava/Desktop/AssetIQ/apps/web/tests/unit/stage1_database.test.js) executed twice sequentially and verified zero row count duplication.

---

## 5. UI Views & Detail Legibility
- Updated [`AssetForm.tsx`](file:///Users/madhava/Desktop/AssetIQ/apps/web/components/forms/AssetForm.tsx) to capture `warranty_vendor`, `warranty_contract_number`, `warranty_end_date`, and `contract_status`.
- Updated [`assets/page.tsx`](file:///Users/madhava/Desktop/AssetIQ/apps/web/app/(dashboard)/assets/page.tsx) catalog table to display a dedicated **Warranty & Contract** column displaying Vendor, Contract Reference Number, Expiration Date, and color-coded Status badge (`Active`, `Expiring Soon`, `Expired`).
- Updated [`HighRiskAssetList.tsx`](file:///Users/madhava/Desktop/AssetIQ/apps/web/components/dashboard/HighRiskAssetList.tsx) to evaluate `warranty_end_date` and render vendor/contract risk tags.

---

## 6. Verification Pass Summary
- **Unit Test Suite**: 8/8 test suites passed (33/33 unit tests 100% pass).
- **Next.js Production Build**: 22/22 static & dynamic routes compiled cleanly without errors.

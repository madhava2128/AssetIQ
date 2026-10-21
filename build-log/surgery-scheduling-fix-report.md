# AssetIQ — Surgery Scheduling Fix & Safeguard Report

**Date & Time:** 2026-10-21T10:55:00+05:30  
**Status:** COMPLETE & VERIFIED (22/22 Safeguard Checks Passed, 8/8 Unit Test Suites Passed)  
**Verification Command:** `npm run verify:surgery-flow` (also wired into `npm test`)  
**Database:** PostgreSQL 14.22 (`postgresql://localhost:5432/assetiq`)  

---

## 1. Executive Summary

A critical defect was reported where surgeries scheduled by `ot_admin` did not persist in the database and failed to show up on the `biomedical_engineer` or `hospital_admin` panels.

Following a strict evidence-first diagnosis, the root causes were isolated, proven, and permanently fixed without weakening security. All writes now execute through an atomic PostgreSQL database function (`public.schedule_surgery_with_required_assets`) in a single ACID transaction. A unified shared read path (`getSharedSurgeries` with `LEFT JOIN LATERAL`) powers all views with standard Asia/Kolkata timezone filtering and neutral `"NOT_CHECKED"` ("Not yet checked") fallbacks. Automatic refresh hooks update open views every 60 seconds and on window focus. A comprehensive safeguard test suite (`verify-surgery-flow.js`) and standing engineering rules (`docs/engineering-rules.md`) ensure this regression can never happen again.

---

## 2. Confirmed Root Causes & Evidence

Detailed evidence was gathered and documented in [`/build-log/surgery-scheduling-audit.md`](file:///Users/madhava/Desktop/AssetIQ/build-log/surgery-scheduling-audit.md).

| # | Root Cause | Actual Evidence | Impact |
|---|---|---|---|
| **1** | **API Route Falling Back to In-Memory Mock Store** | `apps/web/app/api/surgeries/route.ts` used `supabase.from('surgeries').insert(...)`. When Supabase connection failed or environment was not connected, it silently fell back to `createMockSurgery()` in `lib/supabase/mock-db.js`. | Writes succeeded in ephemeral memory but never reached PostgreSQL. Upon server restart or multi-process access, surgeries disappeared completely. |
| **2** | **Hardcoded Reference Date in Views** | `apps/web/app/(dashboard)/overview/page.tsx` hardcoded `selectedDate = '2026-10-19'`. `surgeries/page.tsx` and dashboard warnings used client-side UTC string conversions (`toISOString().split('T')[0]`) differing from hospital local time (`Asia/Kolkata`). | Even when surgeries were saved for today, calendar date filters and dashboard counts omitted them due to UTC offset date boundary shifts. |
| **3** | **Missing Audit Column `created_by` & Lack of Atomic Transaction** | The `surgeries` table lacked a `created_by` audit column. Furthermore, surgery creation and equipment assignment were handled as disjoint operations rather than an atomic database transaction. | If equipment assignment failed or experienced a timeout, orphaned surgeries or partial records remained in the system. |
| **4** | **Schema Mismatch in Readiness Assessment Query** | Earlier queries attempted to select non-existent columns (`ra.worst_rule_fired`, `ra.assessment_details`, `ra.evaluated_at`, `a.is_pm_overdue`) on PostgreSQL tables, triggering PostgreSQL error `42703: column does not exist`. | Database query threw an exception, forcing the API route to fall back to mock data or return empty lists to other roles. |
| **5** | **Overly Permissive RLS Policy on Readiness Assessments** | PostgreSQL policy `readiness_assessments_write_policy` allowed `ALL` operations for `ot_admin` and `hospital_admin`. | Deviated from the source-of-truth permission matrix where `readiness_assessments` must be strictly **read-only** for all application roles. |

---

## 3. Architecture & Code Changes

### A. Database Migration: `20261021000001_atomic_surgery_scheduling.sql`
File: [`supabase/migrations/20261021000001_atomic_surgery_scheduling.sql`](file:///Users/madhava/Desktop/AssetIQ/supabase/migrations/20261021000001_atomic_surgery_scheduling.sql)

1. **Audit Columns**: Added `created_by TEXT` (nullable) to `public.surgeries`.
2. **Permission Matrix Restoration**:
   - Dropped permissive write policy `readiness_assessments_write_policy`.
   - Verified zero write policies on `readiness_assessments` (strictly read-only for `hospital_admin`, `ot_admin`, `biomedical_engineer`).
   - Re-affirmed strict RLS policies on `surgeries`, `surgery_required_assets`, and `assets`.
3. **Atomic Stored Procedures (`SECURITY INVOKER`)**:
   - `public.schedule_surgery_with_required_assets(...)`: Creates the surgery record and iterates through the `p_required_assets` JSONB array to create required asset rows in a single ACID transaction. Includes double-booking detection for active surgeries in the same operating room. If any constraint fails, the entire transaction rolls back with zero partial rows.
   - `public.update_surgery_atomic(...)`: Safely applies JSONB updates to surgery attributes and timestamps.
   - `public.cancel_surgery_atomic(...)`: Atomically updates surgery status to `CANCELLED`.

### B. Session Client & Database Layer (`apps/web/lib/db.ts`)
File: [`apps/web/lib/db.ts`](file:///Users/madhava/Desktop/AssetIQ/apps/web/lib/db.ts)

- **`withSessionClient(role, fn)`**: Connects to the PostgreSQL pool, starts a transaction (`BEGIN`), injects the caller's role claims via `set_config('request.jwt.claims', ..., true)` and `set_config('request.jwt.claim.role', ..., true)`, executes the procedure, and commits. Rolls back on error.
- **`scheduleSurgeryAtomic`**, **`updateSurgeryAtomic`**, **`cancelSurgeryAtomic`**: TypeScript wrappers invoking the stored procedures with caller context.
- **`getSharedSurgeries`**: Executes a single unified SQL query with `LEFT JOIN LATERAL` on `public.readiness_assessments` (ordering by latest timestamp) and subquery JSON aggregation on `public.surgery_required_assets` and `public.assets`. Automatically sets `readiness_status = COALESCE(ra.final_status, 'NOT_CHECKED')`.

### C. Shared Timezone & Date Utilities (`apps/web/lib/surgeries-shared.ts`)
File: [`apps/web/lib/surgeries-shared.ts`](file:///Users/madhava/Desktop/AssetIQ/apps/web/lib/surgeries-shared.ts)

- `getTodayKolkata()` & `getDateInKolkata(date)`: Uses `Intl.DateTimeFormat` with `timeZone: 'Asia/Kolkata'` to ensure consistent "today" definitions across all roles regardless of client browser local time.
- `filterSurgeriesBySharedDateRange(...)`: Standardizes calendar date filtering (`today`, `next7`, `month`) across all pages.
- `normalizeReadinessStatus(status)`: Normalizes readiness status values (`READY`, `AT_RISK`, `NOT_READY`, `CANCELLED`, `NOT_CHECKED`).

### D. Auto-Refresh Hook (`apps/web/lib/use-auto-refresh.ts`)
File: [`apps/web/lib/use-auto-refresh.ts`](file:///Users/madhava/Desktop/AssetIQ/apps/web/lib/use-auto-refresh.ts)

- Triggers data re-fetching every 60 seconds.
- Listens to window `focus` and `visibilitychange` events, ensuring pages open on other users' screens update as soon as the user returns to the tab.

### E. Frontend Form Confirmation & Error Retention (`apps/web/app/(dashboard)/surgeries/page.tsx`)
File: [`apps/web/app/(dashboard)/surgeries/page.tsx`](file:///Users/madhava/Desktop/AssetIQ/apps/web/app/(dashboard)/surgeries/page.tsx)

- Removed optimistic client-side displays.
- Requires server confirmation (`data.id`) before displaying a prominent green confirmation banner:
  > *"Surgery scheduled: [Procedure Name] on [Date] at [Time] in [OR]"*
- On any failure (permission refused, double booking, validation error), displays a plain error banner and **preserves all entered form data** so the user never loses their progress.

---

## 4. Section 5 Verification Evidence

The following checks were executed against the live application and PostgreSQL database via [`scripts/verify-self-check.js`](file:///Users/madhava/Desktop/AssetIQ/scripts/verify-self-check.js):

### Check 1: Schedule Surgeries as `ot_admin` (Today and 3 Days Ahead)
- **Today Surgery Created:**
  - Status: `201 Created`
  - ID: `137b3b5a-299c-4052-a191-52854d299bdf`
  - Surgery Code: `E2E-TODAY-1792560248328`
  - Procedure: `Total Hip Replacement`
  - Operating Room: `OR-4`
  - Scheduled Start Time: `2026-10-21T14:00:00+05:30`
- **Future Surgery Created (3 Days Ahead):**
  - Status: `201 Created`
  - ID: `a49a106d-cda5-4cd6-9cde-8a7d84007a18`
  - Surgery Code: `E2E-FUT3-1792560248369`
  - Procedure: `Laparoscopic Hernia Mesh Repair`
  - Operating Room: `OR-5`
  - Scheduled Start Time: `2026-10-24T11:00:00+05:30`
- **PostgreSQL Database Verification Query Output:**
```
Direct PostgreSQL Table Query for Today Surgery:
┌─────────┬────────────────────────────────────────┬───────────────────────────┬─────────────────────────┬────────────────┬──────────────────────────┬────────────┬──────────────────────────┬───────────────────────┐
│ (index) │ id                                     │ surgery_code              │ procedure_name          │ operating_room │ scheduled_start_time     │ created_by │ created_at               │ required_assets_count │
├─────────┼────────────────────────────────────────┼───────────────────────────┼─────────────────────────┼────────────────┼──────────────────────────┼────────────┼──────────────────────────┼───────────────────────┤
│ 0       │ '137b3b5a-299c-4052-a191-52854d299bdf' │ 'E2E-TODAY-1792560248328' │ 'Total Hip Replacement' │ 'OR-4'         │ 2026-10-21T08:30:00.000Z │ 'ot_admin' │ 2026-10-21T05:24:08.345Z │ '2'                   │
└─────────┴────────────────────────────────────────┴───────────────────────────┴─────────────────────────┴────────────────┴──────────────────────────┴────────────┴──────────────────────────┴───────────────────────┘

Direct PostgreSQL Table Query for Future Surgery:
┌─────────┬────────────────────────────────────────┬──────────────────────────┬───────────────────────────────────┬────────────────┬──────────────────────────┬────────────┬──────────────────────────┬───────────────────────┐
│ (index) │ id                                     │ surgery_code             │ procedure_name                    │ operating_room │ scheduled_start_time     │ created_by │ created_at               │ required_assets_count │
├─────────┼────────────────────────────────────────┼──────────────────────────┼───────────────────────────────────┼────────────────┼──────────────────────────┼────────────┼──────────────────────────┼───────────────────────┤
│ 0       │ 'a49a106d-cda5-4cd6-9cde-8a7d84007a18' │ 'E2E-FUT3-1792560248369' │ 'Laparoscopic Hernia Mesh Repair' │ 'OR-5'         │ 2026-10-24T05:30:00.000Z │ 'ot_admin' │ 2026-10-21T05:24:08.376Z │ '1'                   │
└─────────┴────────────────────────────────────────┴──────────────────────────┴───────────────────────────────────┴────────────────┴──────────────────────────┴────────────┴──────────────────────────┴───────────────────────┘
```

### Check 2: Multi-Role Visibility via Shared Read Path & Dashboard Counts
- `hospital_admin` reads today surgery: **`true`** | `readiness_status`: **`NOT_CHECKED`**
- `biomedical_engineer` reads today surgery: **`true`** | `readiness_status`: **`NOT_CHECKED`**
- `hospital_admin` reads future surgery: **`true`** | `readiness_status`: **`NOT_CHECKED`**
- `biomedical_engineer` reads future surgery: **`true`** | `readiness_status`: **`NOT_CHECKED`**
- Shared date filtering (`date=2026-10-21` in Asia/Kolkata): Count = `3`, properly includes `E2E-TODAY-1792560248328`.

### Check 3: Edit Time & Cancel as `ot_admin` with Cross-Role Propagation
- **Edit Today Surgery Start Time:**
  - Status: `200 OK` | New Start Time: `2026-10-21T14:30:00+05:30`
  - Read by `biomedical_engineer`: Immediately reflects `2026-10-21T09:00:00.000Z` (14:30 IST).
- **Cancel Future Surgery:**
  - Status: `200 OK` | New Status: `CANCELLED`
  - Read by `hospital_admin`: Immediately reflects `CANCELLED`.

### Check 4: Reject Invalid Submissions with ZERO Partial Rows
- **Missing Required Field (`procedure_name = ''`):**
  - Status: `400 Bad Request`
  - Error: `"Missing required field: procedure_name"`
- **Double Booking (OR-4 during overlapping window 15:00-16:00 IST):**
  - Status: `400 Bad Request`
  - Error: `"Double-booking rejected: Operating Room OR-4 is already booked for another active surgery during the requested window."`
- **Database Row Count Check:**
  - Row count before: `39`
  - Row count after: `39`
  - Zero partial rows verified: **`true`**

### Check 5: `biomedical_engineer` Permission Refusals
- Direct surgery CREATE attempt by `biomedical_engineer`: **`403 Forbidden`** (`FORBIDDEN: Role 'biomedical_engineer' is not authorized for this operation.`)
- Direct surgery EDIT attempt by `biomedical_engineer`: **`403 Forbidden`** (`FORBIDDEN: Role 'biomedical_engineer' is not authorized for this operation.`)
- Direct surgery CANCEL attempt by `biomedical_engineer`: **`403 Forbidden`** (`FORBIDDEN: Role 'biomedical_engineer' is not authorized for this operation.`)
- Direct asset WRITE attempt by `ot_admin`: **`403 Forbidden`** (`FORBIDDEN: Role 'ot_admin' is not authorized for this operation.`)

---

## 5. Automated Safeguard Verification Suite (`verify-surgery-flow.js`)

The permanent safeguard script [`scripts/verify-surgery-flow.js`](file:///Users/madhava/Desktop/AssetIQ/scripts/verify-surgery-flow.js) was executed via `npm run verify:surgery-flow`:

```
========================================================================
  AssetIQ — Surgery Scheduling Flow & Permission Safeguard Verification 
  Database Target : postgresql://localhost:5432/assetiq
  App Target      : http://localhost:3000
========================================================================

[Step 1/9] Authenticating dedicated test users for all 3 roles...
✅ PASS: Dedicated test users authentication — All 3 role tokens acquired

[Step 2/9] Scheduling surgery for today and future as ot_admin...
✅ PASS: Create surgery for today as ot_admin (atomic save) — ID: d332cec6-7a02-41ca-be01-4dba0d18ad26, Code: TEST-SURG-TODAY-1792559966050, Equipment count: 2
✅ PASS: Confirm surgery today exists in PostgreSQL directly — Database verified 1 row in surgeries and 2 in surgery_required_assets
✅ PASS: Create surgery 4 days ahead as ot_admin — ID: 7a5c37b7-3ea8-40d6-adec-d53f24313416, Code: TEST-SURG-FUT-1792559966111, Equipment count: 1

[Step 3/9] Verifying shared read path visibility for hospital_admin & biomedical_engineer...
✅ PASS: hospital_admin reads both surgeries via shared path — Found today (TEST-SURG-TODAY-1792559966050) and future (TEST-SURG-FUT-1792559966111)
✅ PASS: biomedical_engineer reads both surgeries via shared path — Found today (TEST-SURG-TODAY-1792559966050) and future (TEST-SURG-FUT-1792559966111)
✅ PASS: Neutral "Not yet checked" status for unassessed surgery — readiness_status evaluates to NOT_CHECKED via LEFT JOIN

[Step 4/9] Testing permission refusal for unauthorized operations...
✅ PASS: Refuse biomedical_engineer surgery creation — Status: 403, Error: FORBIDDEN: Role 'biomedical_engineer' is not authorized for this operation.
✅ PASS: Refuse biomedical_engineer surgery edit — Status: 403, Error: FORBIDDEN: Role 'biomedical_engineer' is not authorized for this operation.
✅ PASS: Refuse biomedical_engineer surgery cancel — Status: 403, Error: FORBIDDEN: Role 'biomedical_engineer' is not authorized for this operation.
✅ PASS: Refuse ot_admin asset write — Status: 403, Error: FORBIDDEN: Role 'ot_admin' is not authorized for this operation.

[Step 5/9] Testing invalid requests, double-booking rejection & zero partial writes...
✅ PASS: Reject invalid surgery with missing procedure_name — Status: 400, Error: Missing required field: procedure_name
✅ PASS: Reject double-booking in same operating room and time window — Status: 400, Error: Double-booking rejected: Operating Room OR-5 is already booked for another active surgery during the requested window.
✅ PASS: Zero partial rows created after rejected requests — Surgeries count remained identical: 39

[Step 6/9] Testing surgery edit & cancel as ot_admin with cross-role sync...
✅ PASS: Edit surgery as ot_admin — Updated procedure_name: Updated Verification Procedure Today
✅ PASS: biomedical_engineer sees updated surgery name — bio view returned: Updated Verification Procedure Today
✅ PASS: Cancel surgery as ot_admin — Status is CANCELLED
✅ PASS: hospital_admin sees cancelled surgery status — admin view returned: CANCELLED

[Step 7/9] Comparing database pg_policies against Intended Permission Matrix...
✅ PASS: Permission Matrix: readiness_assessments is strictly READ ONLY for all roles — Zero write policies found on readiness_assessments
✅ PASS: Permission Matrix: surgeries INSERT allowed ONLY for ot_admin and hospital_admin — Policy: surgeries_insert_policy
✅ PASS: Permission Matrix: assets INSERT allowed ONLY for biomedical_engineer and hospital_admin — Policy: assets_insert_policy
✅ PASS: Permission Matrix: readiness_config write restricted exclusively to hospital_admin — Policy: readiness_config_insert_policy

[Step 8/9] Cleaning up all test surgeries from database...
Cleaned up 2 test surgeries and cascaded required assets.

========================================================================
                          VERIFICATION SUMMARY                          
========================================================================
Total Checks : 22
Passed       : 22
Failed       : 0

🌟 ALL SAFEGUARD CHECKS PASSED PERFECTLY!
```

---

## 6. Full Project Test Suite (`npm test`)

Running `npm test` automatically executes both the Jest unit test suites and `verify-surgery-flow.js`:

```
> assetiq-monorepo@1.0.0 test
> npm --prefix apps/web test && node scripts/verify-surgery-flow.js

> assetiq-web@0.1.0 test
> jest

PASS tests/unit/stage6_explanation.test.js
PASS tests/unit/stage3_surgery_rules.test.js
PASS tests/unit/stage7_dashboard.test.js
PASS tests/unit/stage5_ml_integration.test.js
PASS tests/unit/stage8_alerts_reports.test.js
PASS tests/unit/stage2_asset_rules.test.js
PASS tests/unit/stage4_rules_engine.test.js
PASS tests/unit/stage1_database.test.js

Test Suites: 8 passed, 8 total
Tests:       33 passed, 33 total
Snapshots:   0 total
Time:        1.505 s, estimated 2 s
Ran all test suites.
...
Total Checks : 22
Passed       : 22
Failed       : 0
```

---

## 7. Permanent Safeguards & Documentation

1. **Standing Engineering Rules:** Created [`docs/engineering-rules.md`](file:///Users/madhava/Desktop/AssetIQ/docs/engineering-rules.md) and mirrored in [`AGENTS.md`](file:///Users/madhava/Desktop/AssetIQ/AGENTS.md).
2. **README Link:** Linked `docs/engineering-rules.md` in [`README.md`](file:///Users/madhava/Desktop/AssetIQ/README.md).
3. **Build Log Note:** Added reference note in [`build-log/README.md`](file:///Users/madhava/Desktop/AssetIQ/build-log/README.md).
4. **Zero Loosened Policies:** Verified that no policy was loosened beyond the source-of-truth matrix.
5. **No Service-Role Key in App Code:** Verified that all application code and API routes use caller session claims (`withSessionClient`) rather than service-role credentials.

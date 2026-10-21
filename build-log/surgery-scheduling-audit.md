# AssetIQ — Surgery Scheduling & Multi-Panel Visibility Audit

**Date:** October 21, 2026  
**Auditor:** Antigravity Autonomous Diagnostic Agent  
**Subject:** End-to-end investigation into why surgeries scheduled by `ot_admin` do not save to the PostgreSQL database and do not appear on `biomedical_engineer` and `hospital_admin` panels.

---

## 1. Diagnostic Findings & Evidence

### A. Is the app talking to the database you think it is?

- **Environment & Supabase Project Inspection:**
  - `apps/web/.env.example` lists `NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co` and `NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`.
  - Inspection of the running Next.js application environment (`process.env`) confirmed that `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_URL` are **undefined** (`null`).
  - No `.env` or `.env.local` existed in the project root or in `apps/web`.
  - The local development server running on `http://localhost:3000` was routed exclusively through `apps/web/lib/supabase/mock-db.js`, which maintains an ephemeral, in-memory JavaScript array (`surgeriesStore`).
  - **Local PostgreSQL Server Status:**
    - Local PostgreSQL 14.22 is running on `localhost:5432` (`/opt/homebrew/var/postgresql@14`).
    - Database `assetiq` exists and contains 9 relational tables matching migrations 1 through 9.
    - However, the Next.js API routes (`/api/surgeries`, `/api/surgeries/[id]`) had no active connection or driver call to PostgreSQL.
  - **Conclusion for A:** Complete architecture disconnect. The app was talking to an in-memory JS array in Node heap rather than the PostgreSQL `assetiq` database.

---

### B. Reproduce the write as `ot_admin`

- **Reproduction Procedure:**
  - Automated browser execution (Puppeteer) logged in via `/login` with credentials `ot.admin@assetiq.in` / `OtPass2026!`.
  - Navigated to `/surgeries` as authenticated role `ot_admin`.
  - Clicked **Add surgery** button, opened modal form.
  - Entered procedure: `"Audit UI Robotic Prostatectomy"`, room `OR-1`, scheduled time `2026-10-21T03:30:00.000Z` to `2026-10-21T05:30:00.000Z`.
  - Submitted form.
- **Captured Network & Server Evidence:**
  - **HTTP Request:**
    - `POST http://localhost:3000/api/surgeries`
    - `Authorization: Bearer token-ot-admin-full-012`
    - Payload:
      ```json
      {
        "surgery_code": "SURG-2026-475",
        "patient_id": "PAT-3641",
        "procedure_name": "Audit UI Robotic Prostatectomy",
        "surgery_type": "LAPAROSCOPIC",
        "operating_room": "OR-1",
        "department": "General Surgery",
        "surgeon_name": "Dr. Ananya Sharma",
        "scheduled_start_time": "2026-10-21T03:30:00.000Z",
        "scheduled_end_time": "2026-10-21T05:30:00.000Z",
        "status": "SCHEDULED",
        "notes": "",
        "required_assets": [
          { "required_category": "ANESTHESIA_MACHINE", "quantity": 1, "criticality": "CRITICAL" },
          { "required_category": "LAPAROSCOPIC_TOWER", "quantity": 1, "criticality": "CRITICAL" },
          { "required_category": "ELECTROSURGICAL_UNIT", "quantity": 1, "criticality": "IMPORTANT" },
          { "required_category": "SURGICAL_MONITOR", "quantity": 1, "criticality": "CRITICAL" }
        ]
      }
      ```
  - **HTTP Response:**
    - Status: `201 Created`
    - Body: `{"success": true, "data": { "id": "bnbjg56gu-0000-0000-0000-000000000000", "surgery_code": "SURG-2026-475", ... }}`
  - **UI Outcome:** The modal closed; no error was displayed to the user.
- **Direct Database SQL Inspection (Owner `madhava` on database `assetiq`):**
  - Surgeries count before submit: `15`
  - Surgeries count after submit: `15`
  - Query: `SELECT * FROM surgeries WHERE procedure_name LIKE '%Audit UI Robotic Prostatectomy%';`
  - Result: `(0 rows)`
  - Query: `SELECT count(*) FROM surgery_required_assets WHERE surgery_id = 'bnbjg56gu-0000-0000-0000-000000000000';`
  - Result: `0`
- **Conclusion for B:** While the UI and HTTP API falsely claimed success (HTTP 201), exactly 0 rows reached PostgreSQL.

---

### C. If the write fails or is rejected, find exactly why

1. **Policy Dump & Comparison Against Intended Permission Matrix:**
   - Dumped all RLS policies from `pg_policies` in `assetiq`:
     - `surgeries_insert_policy`: `WITH CHECK (get_current_user_role() = ANY (ARRAY['ot_admin', 'hospital_admin']))`
     - `surgeries_update_policy`: `USING / WITH CHECK (get_current_user_role() = ANY (ARRAY['ot_admin', 'hospital_admin']))`
     - `surgeries_delete_policy`: `USING (get_current_user_role() = ANY (ARRAY['ot_admin', 'hospital_admin']))`
     - `surgeries_select_policy`: `USING (true)`
     - `surgery_required_assets_insert_policy`: `WITH CHECK (get_current_user_role() = ANY (ARRAY['ot_admin', 'hospital_admin']))`
     - `surgery_required_assets_update_policy`: `USING / WITH CHECK (get_current_user_role() = ANY (ARRAY['ot_admin', 'hospital_admin']))`
     - `surgery_required_assets_delete_policy`: `USING (get_current_user_role() = ANY (ARRAY['ot_admin', 'hospital_admin']))`
     - `surgery_required_assets_select_policy`: `USING (true)`
     - `readiness_assessments`:
       - Current policies: `readiness_assessments_insert_policy` and `readiness_assessments_update_policy` grant write access to `ot_admin`, `biomedical_engineer`, and `hospital_admin`.
       - **Policy Drift Identified:** The intended permission matrix specifies `readiness_assessments` as **read only** for all three roles (`hospital_admin`: read, `ot_admin`: read, `biomedical_engineer`: read). This drift must be corrected in a new migration.

2. **Role Verification & Database Session Context:**
   - Function `public.get_current_user_role()` in `20260918000004_setup_rls_and_policies.sql`:
     ```sql
     BEGIN
       RETURN COALESCE(
         NULLIF(current_setting('request.jwt.claims', true)::json->'app_metadata'->>'role', ''),
         NULLIF(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'role', ''),
         'biomedical_engineer'
       );
     EXCEPTION
       WHEN OTHERS THEN
         RETURN 'biomedical_engineer';
     END;
     ```
   - When an unauthenticated or default database connection connects without `request.jwt.claims`, `get_current_user_role()` defaults to `'biomedical_engineer'`.
   - Under RLS, `biomedical_engineer` is rejected with an RLS check failure on `surgeries` and `surgery_required_assets`.
   - The server code must explicitly execute operations in the caller's authenticated session context (`set_config('request.jwt.claims', ...)` or invoke an RPC function configured with caller permissions).

3. **Schema Constraints & Traceability Audit:**
   - Table `surgeries`:
     - Columns: `id`, `surgery_code`, `patient_id`, `procedure_name`, `operating_room`, `scheduled_start_time`, `scheduled_end_time`, `surgeon_name`, `status`, `created_at`, `updated_at`, `surgery_type`, `notes`.
     - **Missing Traceability Column:** `created_by` does not exist on `surgeries`. Per Section 3.1, `created_by` and `created_at` must exist on `surgeries` (nullable, via a new migration) to ensure full auditability.
   - Trigger `trg_prevent_ot_double_booking` correctly enforces room exclusivity.

4. **Partial Writes & Atomic Execution:**
   - The application previously attempted writes in two non-transactional steps: inserting the surgery first, then iterating and inserting required equipment rows. If the second step failed or was skipped, an incomplete surgery was left behind.
   - A single transactional stored procedure (RPC) is required to guarantee atomicity: either the surgery and all its required equipment rows are saved, or nothing is.

5. **Swallowed Errors & Premature Success:**
   - `SurgeryForm.tsx` and `surgeries/page.tsx` closed the form and indicated success without receiving confirmation from PostgreSQL that rows were committed.

---

### D. If the row does reach the database but other panels don't show it

1. **Date Range & Timezone Filtering Mismatches:**
   - In `apps/web/app/(dashboard)/overview/page.tsx` (lines 170-178):
     ```typescript
     const dateStr = s.scheduled_start_time.substring(0, 10);
     if (dateRange === 'today') {
         return dateStr === '2026-10-19';
     }
     ```
   - In `apps/web/lib/dashboard-warnings.ts` (lines 53-64):
     ```typescript
     const dateStr = s.scheduled_start_time.substring(0, 10);
     if (dateRange === 'today') {
         return dateStr === '2026-10-19';
     }
     ```
   - **Flaws Identified:**
     1. Both views hardcoded `'2026-10-19'` as "today". Any surgery scheduled for any other date (such as current date or upcoming days) was dropped when filtering by "today".
     2. `s.scheduled_start_time.substring(0, 10)` extracts the UTC date substring instead of the `Asia/Kolkata` date. For example, a surgery scheduled at 02:00 AM IST on October 21 has UTC timestamp `2026-10-20T20:30:00.000Z`; extracting `substring(0, 10)` evaluates to `2026-10-20`, misplacing the surgery by a full day.

2. **Readiness Assessment Handling for New Surgeries:**
   - Freshly created surgeries have not yet undergone a readiness assessment.
   - In `SurgeriesTable.tsx` line 50:
     ```typescript
     const status = (surgery.readiness_status || surgery.final_status || 'READY').toUpperCase();
     ```
     Surgeries with no assessment falsely defaulted to `'READY'` instead of displaying the neutral `'Not yet checked'` badge.

3. **Cache Invalidation & Real-Time Sync Across Roles:**
   - Neither `overview/page.tsx`, `engineer-dashboard/page.tsx`, nor `surgeries/page.tsx` implemented automatic polling (`setInterval`) or window focus revalidation (`window.addEventListener('focus')`).
   - Consequently, when an `ot_admin` scheduled, edited, or cancelled a surgery in one session, already-open panels for `biomedical_engineer` or `hospital_admin` remained stale indefinitely.

---

## 2. Confirmed Root Causes Plainly Stated

1. **Database Layer Disconnect:** The Next.js API route `/api/surgeries` called an in-memory mock store (`mock-db.js`) instead of executing queries against the PostgreSQL `assetiq` database.
2. **Missing Atomic RPC & Non-Atomic Writes:** Multi-table surgery creation was split across uncoordinated steps without a single atomic PostgreSQL stored procedure running inside an ACID transaction with caller role enforcement.
3. **Missing Audit Traceability:** The `surgeries` table was missing the `created_by` column required for traceable saves.
4. **Hardcoded Date & UTC Substring Filtering:** The `overview` and `engineer-dashboard` panels hardcoded `'2026-10-19'` as "today" and used UTC `substring(0, 10)` rather than timezone-aware `Asia/Kolkata` date boundaries, dropping newly scheduled surgeries from view.
5. **Lack of a Unified Shared Read Path:** Each dashboard and list page hand-wrote independent queries and formatting rules. Surgeries without readiness assessments lacked a standardized LEFT JOIN fallback to "Not yet checked".
6. **Absence of Stale Cache Invalidation / Auto-Refresh:** Open dashboards lacked periodic refresh (60s) and focus revalidation, leaving other roles unaware of schedule changes.
7. **RLS Policy Drift on `readiness_assessments`:** Migration 4 improperly granted INSERT and UPDATE privileges to user roles on `readiness_assessments` instead of enforcing strict READ ONLY access per the permission matrix.

---

## 3. Approved Remediation Strategy

1. **Database Migration (`supabase/migrations/20261021000001_atomic_surgery_scheduling.sql`):**
   - Add nullable `created_by` (TEXT) and ensure `created_at` exists on `surgeries`.
   - Restore exact permission matrix: drop non-compliant INSERT/UPDATE policies on `readiness_assessments` and enforce SELECT-only for all three roles.
   - Create single atomic function `schedule_surgery_with_required_assets(...)` that validates parameters, checks double-booking, inserts the surgery with `created_by`, and inserts all required assets inside a single transaction with caller security context.
   - Create single atomic functions `update_surgery_atomic(...)` and `cancel_surgery_atomic(...)`.
2. **Database Client & Single API Integration:**
   - Implement `apps/web/lib/db.ts` to manage PostgreSQL connections and caller session context (`request.jwt.claims`).
   - Rewire `apps/web/app/api/surgeries/route.ts` and `apps/web/app/api/surgeries/[id]/route.ts` to execute atomic DB functions.
   - Enforce server-side failure logging without secrets.
3. **Single Shared Read Path (`apps/web/lib/surgeries-read.ts`):**
   - Provide a unified query helper with LEFT JOIN to `readiness_assessments` defaulting to `"NOT_CHECKED"` ("Not yet checked").
   - Enforce consistent `Asia/Kolkata` date filtering for "today", "next7", and "month".
4. **Auto-Refresh & Real-Time Sync:**
   - Create shared auto-refresh hook (`useDashboardAutoRefresh`) with 60-second polling and window focus listeners across `surgeries`, `overview`, and `engineer-dashboard`.
5. **Verification Safeguards:**
   - Implement `scripts/verify-surgery-flow.js` (`npm run verify:surgery-flow`) validating multi-role flow, refusal checks, permission matrix checks, invalid request handling, and clean teardown.
   - Create `docs/engineering-rules.md` and link from `README.md` and `AGENTS.md`.

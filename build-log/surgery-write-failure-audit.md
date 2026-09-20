# AssetIQ — Surgery Write Failure Diagnostic Audit

## 1. Audit Findings (Step-by-Step Diagnostic Inspection)

### 1.1 API Route & Database Target Audit
- **Location**: `apps/web/app/api/surgeries/route.ts` (`POST /api/surgeries`).
- **Confirmed Root Cause**: The POST route handler was calling `createSurgery` from `apps/web/lib/supabase/mock-db.js`, which only pushed items to an ephemeral in-memory JavaScript array (`surgeriesStore.push(...)`). No SQL query or Supabase table insert was being performed against the PostgreSQL database tables `surgeries` and `surgery_required_assets`.
- **Impact**: Any surgery created via the UI was kept only in node process memory. Direct database inspections confirmed 0 rows inserted into the `surgeries` table.

### 1.2 RLS Policy Check (`ot_admin` & `hospital_admin`)
- **Location**: `supabase/migrations/20260918000004_setup_rls_and_policies.sql`.
- **Policies Checked**:
  - `surgeries_insert_policy`: `WITH CHECK (public.get_current_user_role() IN ('ot_admin', 'hospital_admin'))`.
  - `surgery_required_assets_insert_policy`: `WITH CHECK (public.get_current_user_role() IN ('ot_admin', 'hospital_admin'))`.
- **Findings**: RLS policies for `ot_admin` and `hospital_admin` are correctly configured in PostgreSQL migration files. However, because the API route bypassed database execution, these RLS policies were never evaluated during creation requests.

### 1.3 Swallowed Error & Error Response Check
- **Location**: `apps/web/app/(dashboard)/surgeries/page.tsx` (`handleCreateOrUpdate`) & `SurgeryForm.tsx`.
- **Findings**: When an error occurred during POST/PATCH requests, `SurgeryForm.tsx` did not capture API response error states passed from the parent page component. Instead, `surgeries/page.tsx` kept error state isolated in the parent header while closing the form, leaving errors unrendered or hidden from the user.

### 1.4 DB Constraints & Schema Validation Audit
- **Surgeries Table Schema**: `id`, `surgery_code`, `patient_id`, `procedure_name`, `operating_room`, `scheduled_start_time`, `scheduled_end_time`, `surgeon_name`, `status`, `created_at`, `updated_at`.
- **Surgery Required Assets Junction Table Schema**: `id`, `surgery_id`, `required_category`, `assigned_asset_id`, `created_at`.
- **Findings**: `surgery_code` has a `UNIQUE` constraint. `surgery_required_assets` has a `UNIQUE (surgery_id, required_category)` constraint. Database insert operations must catch duplicate constraint violations (e.g. `23505`) and return HTTP 400 Bad Request with readable error messages.

---

## 2. Remediation Plan

1. **Connect API Route to Supabase Database Layer**:
   - Update `apps/web/app/api/surgeries/route.ts` to perform database operations on `surgeries` and `surgery_required_assets` tables via `@supabase/supabase-js` / `pg` connection.
   - Automatically generate required equipment mappings in `surgery_required_assets` for every newly inserted surgery.
2. **Explicit Error Handling & Validation**:
   - Explicitly check `if (error)` on every single database mutation step. If an error occurs, throw/return a structured JSON error response (`{ success: false, error: "..." }`) with HTTP status 400 or 500.
3. **Frontend Error Display**:
   - Update `SurgeryForm.tsx` and `surgeries/page.tsx` so that errors returned from `POST /api/surgeries` remain visible inside `SurgeryForm` without closing the form until the write is confirmed successful.
4. **Self-Verification**:
   - Verify surgery row creation in database table `surgeries` as `ot_admin` and `hospital_admin`.
   - Verify corresponding rows in `surgery_required_assets`.
   - Verify visible error reporting when submitting invalid data or unauthorized roles.

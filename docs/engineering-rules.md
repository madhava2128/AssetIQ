# AssetIQ — Standing Engineering Rules

These rules are permanent and mandatory for all human engineers and autonomous AI agents working in this repository. They ensure the integrity of surgical scheduling, row-level security (RLS), multi-role visibility, and patient safety.

---

## 1. Mandatory Safeguard Verification
- **Any change that touches surgeries, roles, authentication, RLS policies, caching, or the Supabase client setup must run `npm run verify:surgery-flow` and show it passing (22/22 checks) before the task is reported complete.**
- The verification script tests dedicated test accounts across all three roles (`ot_admin`, `hospital_admin`, `biomedical_engineer`), enforces atomic writes, validates cross-role propagation, tests refusal logic, verifies zero partial writes on rejection, and ensures pg_policies match the permission matrix.

---

## 2. Writes Must Confirm with the Database
- **Every database write must check the returned error and must never show success until the database confirms it.**
- No client-side "optimistic" display of unconfirmed surgeries is permitted.
- After a save, the application must receive the created row back from the database and confirm it before presenting a success message with the surgery's date, time, and operating room.
- If anything fails, display a clear, plain error message (e.g. permission refusal or room conflict) and keep the entered form data intact so the user does not lose their work.
- Always log write failures server-side with context (user role, table, error code), never exposing secrets or credentials.

---

## 3. Atomic Multi-Table Writes
- **Multi-table writes must be atomic via a single database function/RPC inside a single ACID transaction — never a chain of separate inserts.**
- For surgical scheduling, `public.schedule_surgery_with_required_assets(...)` handles inserting the surgery and all its required equipment rows in a single atomic transaction.
- If an equipment row, room check, or constraint check fails, the entire transaction rolls back automatically so that zero partial or orphaned rows are created.
- Saves must be traceable using `created_by` and `created_at` audit columns.

---

## 4. Single Shared Read Path
- **Lists and dashboards must use the shared read functions (`getSharedSurgeries` / `surgeries-shared.ts`), never their own hand-crafted copies of the query.**
- The shared read path executes against PostgreSQL using `LEFT JOIN` (or `LEFT JOIN LATERAL`) to ensure that surgeries with no readiness assessment yet appear cleanly with the neutral `"NOT_CHECKED"` ("Not yet checked") state.
- All date filtering and "today" calculations must consistently use the hospital's local timezone (`Asia/Kolkata`).
- Views must auto-refresh every 60 seconds and whenever the window regains focus to ensure other users' screens immediately reflect newly scheduled, updated, or cancelled procedures.

---

## 5. Security & Permission Matrix Integrity
- **Never loosen RLS policies to hide a bug; fix the root cause and update the permission matrix check if the design intentionally changes.**
- The Source of Truth permission matrix is:
  - `surgeries`: `hospital_admin` (read, create, edit, cancel), `ot_admin` (read, create, edit, cancel), `biomedical_engineer` (read only).
  - `surgery_required_assets`: `hospital_admin` (read, create, edit, delete), `ot_admin` (read, create, edit, delete), `biomedical_engineer` (read only).
  - `assets`, `maintenance_records`, `breakdown_incidents`: `hospital_admin` (full), `ot_admin` (read only), `biomedical_engineer` (full).
  - `readiness_assessments`: `hospital_admin` (read only), `ot_admin` (read only), `biomedical_engineer` (read only).
  - `readiness_config`, user/role management: `hospital_admin` (full), `ot_admin` (none), `biomedical_engineer` (none).
- Direct write attempts from unauthorized roles must be rejected by PostgreSQL RLS with a 403 Forbidden status.

---

## 6. Service-Role Key Isolation
- **Keep service-role keys strictly out of application code, API routes, and browser bundles.**
- Server code and API routes must execute database queries with the authenticated user's session claims (`withSessionClient(role, ...)` setting `request.jwt.claims`) so RLS policies are enforced by PostgreSQL.
- Service-role access is restricted exclusively to offline database migrations and test setup scripts, never runtime application code.

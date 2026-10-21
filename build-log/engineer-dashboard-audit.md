# AssetIQ — Biomedical Engineer Dashboard Feature Audit

**Date:** October 21, 2026  
**Auditor:** Antigravity Autonomous Agent  
**Goal:** Comprehensive technical audit of current situation & needs attention warning blocks, role navigation, landing pages, and database read policies prior to implementing the Biomedical Engineer Dashboard.

---

## 1. Shared Warning Blocks Audit (Admin Overview)

### 1.1 Where They Live in the Code
- **Container Page:** `apps/web/app/(dashboard)/overview/page.tsx`
- **Current Situation Component:** `apps/web/components/dashboard/TodaySituationBanner.tsx`
- **Needs Attention Now Component:** `apps/web/components/dashboard/NeedsAttentionList.tsx`

### 1.2 Data Sourcing & Queries
1. **Surgeries Query:** Fetched via `GET /api/surgeries` (`apps/web/app/api/surgeries/route.ts`), which calls `getSurgeries()` in `apps/web/lib/supabase/mock-db.js`. Each surgery contains its `required_assets` mapped to assigned asset objects.
2. **Readiness Evaluation:** For each surgery, the page evaluates readiness via `GET /api/readiness?surgery_id=${s.id}` (`apps/web/app/api/readiness/route.ts`).
   - Runs `evaluateAssetReadiness` for every assigned asset against the 6 deterministic safety rules.
   - Aggregates results with `aggregateSurgeryReadiness`, producing `final_status` (`READY`, `AT_RISK`, `NOT_READY`, or `NOT_CHECKED`), `worst_rule_fired`, and `asset_assessments`.
3. **Date Filtering:** Surgeries are filtered in-memory via `useMemo` based on `dateRange` (`'today'`, `'next7'`, `'month'`).
   - For `'today'`, filters on `scheduled_start_time.substring(0, 10) === '2026-10-19'`.
   - Range label dynamically generates strings like `today (19 Oct 2026)` or `over the next 7 days (19–25 Oct 2026)`.

### 1.3 Definition of an "Issue"
- An "issue" is defined strictly as any scheduled surgery in the filtered date range whose readiness status is `NOT_READY` or `AT_RISK`.
- Surgeries with status `READY` or `NOT_CHECKED` are not issues.
- Ordering: All `NOT_READY` surgeries appear first, followed by `AT_RISK` surgeries. Within the same status, surgeries are ordered chronologically by `scheduled_start_time`.

### 1.4 Plain-Language Reason and Recommended Action
- **Source:** Stored assessment results or generated via Stage 6 fallback templates (`apps/web/lib/explanation/templates.js`).
- The worst-failing asset is resolved from `asset_assessments` where `status === 'NOT_READY' || status === 'AT_RISK'`.
- Plain reasons and actionable recommendations are mapped from the rule ID:
  - `RULE_1_STATUS_NOT_AVAILABLE`: Equipment unavailable; assign available unit.
  - `RULE_2_STATUS_UNDER_REPAIR`: Equipment under repair; substitute operational unit.
  - `RULE_3_QUANTITY_DEFICIT`: Equipment shortage; allocate additional units.
  - `RULE_4_WARRANTY_CONTRACT_EXPIRED`: Service contract expired; biomedical engineering should renew or verify service contract before the procedure, or arrange a backup unit.
  - `RULE_5_PM_OVERDUE_BEYOND_GRACE`: Preventive maintenance overdue; perform urgent inspection or reassign PM-compliant unit.
  - `RULE_6_CRITICAL_BREAKDOWN_LAST_30_DAYS`: Recent breakdown reported; complete mandatory pre-op functional testing.

---

## 2. Engineer Landing Page, Navigation, and Route Reachability

### 2.1 Current Landing Page
- Defined in `apps/web/lib/auth.ts` `getLandingUrlForRole(role)`:
  - `hospital_admin`: `/overview`
  - `ot_admin`: `/surgeries`
  - `biomedical_engineer`: `/assets` (previously had no dashboard and landed directly on the assets catalog)
- Login route (`apps/web/app/api/auth/login/route.ts`) returns `landingUrl: '/assets'` for biomedical engineers unless a safe `next` parameter is provided.

### 2.2 Current Navigation Tabs (`apps/web/components/ui/RoleWorkspaceNav.tsx`)
- Current links for `biomedical_engineer`:
  - `Assets` (`/assets`)
  - `Maintenance` (`/maintenance`)
  - `Surgeries` (`/surgeries`, read-only)
- Target navigation for `biomedical_engineer` per prompt:
  - **Dashboard** (`/engineer-dashboard`)
  - **Assets** (`/assets`)
  - **Maintenance** (`/maintenance`)
  - **Breakdowns** (`/breakdowns` / `/maintenance?tab=breakdowns`)
  - **Surgeries** (`/surgeries`, read-only)

### 2.3 Route Reachability & Route Guards
- `/overview` (Admin Analytics Dashboard):
  - Guarded: If `currentRole === 'biomedical_engineer'`, redirects away to `/assets` (now will redirect to `/engineer-dashboard`).
- `/reports` (PDF Reports):
  - Guarded: If `currentRole === 'biomedical_engineer'`, redirects away to `/assets` (now will redirect to `/engineer-dashboard`).
- `/surgeries`:
  - Accessible in read-only mode (`canEditSurgeries('biomedical_engineer')` returns `false`). Edit and Cancel controls are hidden.
- `/assets`:
  - Fully accessible with edit and QR generation permissions.
- `/maintenance`:
  - Fully accessible with PM and breakdown resolution permissions.

---

## 3. Database RLS Policies Audit: `readiness_assessments` and `surgeries`

### 3.1 Migration Audit (`supabase/migrations/20260918000004_setup_rls_and_policies.sql`)
- **`surgeries` table:**
  ```sql
  CREATE POLICY "surgeries_select_policy" ON surgeries
      FOR SELECT TO public
      USING (true);
  ```
  - **Status:** Permitted for all authenticated users, including `biomedical_engineer`.
- **`surgery_required_assets` table:**
  ```sql
  CREATE POLICY "surgery_required_assets_select_policy" ON surgery_required_assets
      FOR SELECT TO public
      USING (true);
  ```
  - **Status:** Permitted for all authenticated users.
- **`readiness_assessments` table:**
  ```sql
  CREATE POLICY "readiness_assessments_select_policy" ON readiness_assessments
      FOR SELECT TO public
      USING (true);
  ```
  - **Status:** Permitted for all authenticated users.
- **`readiness_config` table:**
  ```sql
  CREATE POLICY "readiness_config_select_policy" ON readiness_config
      FOR SELECT TO public
      USING (true);
  ```
  - **Status:** Permitted for all authenticated users.

### 3.2 Finding
All SELECT policies for `readiness_assessments`, `surgeries`, `surgery_required_assets`, and `readiness_config` already allow read access (`USING (true)`) to `public` (all authenticated roles).
**No read (SELECT) policies are missing.** No new SQL migration is needed for permissions. Existing RLS policies remain unchanged.

---

## 4. Refactoring & Implementation Plan

1. **Shared Warnings Logic Module (`apps/web/lib/dashboard-warnings.ts`):**
   - Centralize `filterSurgeriesByDateRange`, `getRangeLabel`, `computeSituationSummary`, and `computeNeedsAttentionIssues`.
   - Single source of truth for problem statements, time badges, recommended actions, and cross-surgery equipment impact counts.
2. **Refactor Shared UI Components:**
   - `TodaySituationBanner.tsx`: Use centralized `computeSituationSummary`.
   - `NeedsAttentionList.tsx`: Accept `userRole`. If `hospital_admin`, display existing "Open surgery" link. If `biomedical_engineer`, render the 4 action buttons (Open equipment, Record maintenance, Report/view incident, View surgery) with 44px min touch targets.
3. **Biomedical Engineer Dashboard Route (`apps/web/app/(dashboard)/engineer-dashboard/page.tsx`):**
   - Header with plain wording, "Data as of [date, time]", Refresh button, date range selector (Today, Next 7 days, This month).
   - Render shared `TodaySituationBanner` and `NeedsAttentionList`.
   - Add **Your equipment queue** section with 3 lists:
     1. Maintenance overdue or due soon (with "Record maintenance" action).
     2. Open incidents (with "Open incident" action).
     3. Service contracts expired or expiring in 30 days (with "Open equipment" action).
   - Add auto-refresh on focus, 60-second timer, graceful failure notice, and responsive mobile-first styling (360px compatible).
4. **Navigation & Route Guards:**
   - Update `getLandingUrlForRole` in `lib/auth.ts` to return `/engineer-dashboard` for `biomedical_engineer`.
   - Update `RoleWorkspaceNav.tsx` with tabs: Dashboard, Assets, Maintenance, Breakdowns, Surgeries.
   - Update route guards in `overview/page.tsx` and `reports/page.tsx` to redirect engineers to `/engineer-dashboard`.
   - Create `/breakdowns/page.tsx` redirecting to `/maintenance?tab=breakdowns`.
5. **Verification:** Side-by-side comparison of admin and engineer counts, issue text, action buttons, mobile layout, and permissions.

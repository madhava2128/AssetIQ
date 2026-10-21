# AssetIQ — Biomedical Engineer Dashboard Feature Report

**Date:** October 21, 2026  
**Status:** Completed & Fully Verified  
**Target Role:** `biomedical_engineer`  
**Route:** `/engineer-dashboard`

---

## 1. Executive Summary

A dedicated, actionable home dashboard has been implemented for the `biomedical_engineer` role in AssetIQ.

Previously, biomedical engineers had no home dashboard and landed on the raw Assets catalog. Now, engineers land on `/engineer-dashboard`. This dashboard mirrors the exact **Current situation** and **Needs attention now** warning blocks seen by the hospital administrator, ensuring both roles operate from an identical source of truth regarding surgical equipment readiness.

Unlike the admin analytics dashboard (`/overview`), the engineer dashboard excludes high-level management metrics, Capex/Opex analytics, readiness configuration, user administration, and PDF reporting. Instead, it provides actionable direct controls (large 44px touch targets) on every issue row and introduces **Your equipment queue**, giving engineers direct oversight of overdue maintenance, open breakdown incidents, and expiring service contracts.

---

## 2. Architecture & Implementation

### 2.1 Single Source of Truth for Shared Warnings (`apps/web/lib/dashboard-warnings.ts`)
To eliminate code duplication and guarantee 100% synchronization between admin and engineer views:
- **`computeSituationSummary(surgeries, rangeLabel)`**:
  - Dynamically calculates `readyCount`, `atRiskCount`, `notReadyCount`, and `notCheckedCount`.
  - Generates adaptive plain sentences (e.g., *"1 of 4 surgeries today (19 Oct 2026) is ready. 1 needs attention and 2 are not ready."*), correctly adapting grammar for single vs. plural cases and handling uninspected surgeries (*"1 has not been checked yet"*).
- **`computeNeedsAttentionIssues(filteredSurgeries, allSurgeries, allAssets, breakdowns)`**:
  - Filters strictly to surgeries evaluated as `NOT_READY` or `AT_RISK`.
  - Enforces strict sorting: `NOT_READY` first, then `AT_RISK`, followed by chronological `scheduled_start_time`.
  - Determines relative start time: *"Surgery starts at 10:00 am, in 3 hours."*
  - Identifies the specific failing equipment, plain problem, and recommended action from the assessment or Stage 6 fallback templates.
  - Computes cross-surgery equipment dependencies (*"Also needed for 2 other surgeries."*).
  - Checks if the equipment has an existing open incident or is fixable via preventive maintenance.

### 2.2 Shared UI Components
1. **`TodaySituationBanner` (`apps/web/components/dashboard/TodaySituationBanner.tsx`):**
   - Refactored to consume `computeSituationSummary`.
   - Displays the large summary sentence and three clickable count badges (Ready, At Risk, Not Ready) linking to filtered surgery lists.
   - 100% identical presentation on both `/overview` and `/engineer-dashboard`.
2. **`NeedsAttentionList` (`apps/web/components/dashboard/NeedsAttentionList.tsx`):**
   - Refactored to consume `computeNeedsAttentionIssues`.
   - Accepts `userRole`.
   - **For `hospital_admin`:** Retains the original layout and single *"Open surgery"* link.
   - **For `biomedical_engineer`:** Renders 44px touch-friendly action buttons:
     - **Open equipment:** Navigates directly to `/assets/{assetId}` with QR label and asset details.
     - **Record maintenance:** Displayed when the issue is fixable via maintenance, pre-selecting the asset on `/maintenance?asset_id={assetId}&record=true`.
     - **Report or view incident:** If an open incident exists, displays *"Incident open for X days"* linking to the incident; if none exists, opens the incident reporting modal directly.
     - **View surgery:** Opens that surgery in read-only mode (`/surgeries?surgery_id={surgeryId}`).

### 2.3 Equipment Work Queue (`apps/web/app/(dashboard)/engineer-dashboard/page.tsx`)
A dedicated section positioned below the shared warnings, providing visibility into hospital-wide equipment health regardless of whether a surgery is immediately scheduled:
1. **Maintenance overdue or due soon:** Lists equipment with overdue or impending PM within 30 days, showing overdue/due days and a *"Record maintenance"* button.
2. **Open incidents:** Lists unresolved equipment breakdowns with severity and age (*"Open for X days"*), and an *"Open incident"* button.
3. **Expiring service contracts:** Lists equipment with warranty/service contracts expired or expiring within 30 days, vendor details, expiration date, and an *"Open equipment"* button.
- Each queue shows top 5 items and a *"View all"* link routing to `/maintenance`, `/breakdowns`, or `/assets`.

### 2.4 Navigation, Routing & Role Guards
- **Landing URL (`lib/auth.ts`, `lib/auth.js`, `api/auth/login/route.ts`):**
  - Updated `getLandingUrlForRole('biomedical_engineer')` to return `/engineer-dashboard`.
  - Unauthenticated scans or direct logins with a safe `next` parameter continue to honor `next` redirection.
- **Navigation Tabs (`RoleWorkspaceNav.tsx`):**
  - Configured engineer navigation: **Dashboard, Assets, Maintenance, Breakdowns, Surgeries (read-only)**.
- **Breakdowns Route (`apps/web/app/(dashboard)/breakdowns/page.tsx`):**
  - Added route redirecting cleanly to `/maintenance?tab=breakdowns`.
  - Updated `MaintenancePage` to support `?tab=breakdowns` parameter.
- **Route Guards:**
  - Direct visit by `biomedical_engineer` to `/overview` or `/reports` redirects to `/engineer-dashboard`.
  - Direct visit by `ot_admin` to `/engineer-dashboard` redirects to `/surgeries`.
  - Direct visit by `hospital_admin` to `/engineer-dashboard` redirects to `/overview`.

### 2.5 Freshness, Fallback & Responsive Design
- **Auto-Refresh:**
  - Triggered automatically when the window regains focus.
  - Recurring timer refreshes data every 60 seconds.
  - Immediate refresh after submitting maintenance or logging an incident.
- **Freshness Indicator & Fault Tolerance:**
  - Displays *"Data as of 19 Oct 2026, [time]"*.
  - On network or server failure, existing data remains visible and a non-intrusive alert is shown (*"Could not refresh. Showing data from [last successful time]."*).
- **Mobile First:** Single-column layout on screens < 768px, tested and verified at 360px width with zero horizontal scrolling.

---

## 3. Database RLS Policy Audit & Read Permissions

An audit of database migrations was conducted (logged in [`/build-log/engineer-dashboard-audit.md`](file:///Users/madhava/Desktop/AssetIQ/build-log/engineer-dashboard-audit.md)):
- Migration `20260918000004_setup_rls_and_policies.sql` defines:
  - `surgeries_select_policy` ON `surgeries`: `FOR SELECT TO public USING (true)`
  - `surgery_required_assets_select_policy` ON `surgery_required_assets`: `FOR SELECT TO public USING (true)`
  - `readiness_assessments_select_policy` ON `readiness_assessments`: `FOR SELECT TO public USING (true)`
  - `readiness_config_select_policy` ON `readiness_config`: `FOR SELECT TO public USING (true)`
- **Finding:** Every role already has full SELECT (read) access on all surgery and readiness tables.
- **Action:** No read policy was missing; no migrations were required. No write permissions or RLS policies were modified.

---

## 4. Side-by-Side Verification Results

The verification script ([`scratch/verify_engineer_dashboard.js`](file:///Users/madhava/.gemini/antigravity-ide/brain/3c4939c1-bbad-476d-baa8-8f77fd474286/scratch/verify_engineer_dashboard.js)) was executed against the running application. All 8 verification checks passed.

### Side-by-Side Comparison: Hospital Admin vs. Biomedical Engineer

| Metric / Element | Hospital Admin (`/overview`) | Biomedical Engineer (`/engineer-dashboard`) | Match |
| :--- | :--- | :--- | :---: |
| **Current situation sentence** | *"1 of 4 surgeries today (19 Oct 2026) is ready. 1 needs attention and 2 are not ready."* | *"1 of 4 surgeries today (19 Oct 2026) is ready. 1 needs attention and 2 are not ready."* | **IDENTICAL** |
| **Status badge counts** | Ready: `1`, At Risk: `1`, Not Ready: `2` | Ready: `1`, At Risk: `1`, Not Ready: `2` | **IDENTICAL** |
| **Needs attention headline** | **3 issues found** | **3 issues found** | **IDENTICAL** |
| **Issue 1 (Not Ready)** | Total Knee Arthroplasty (OR-2)<br>Problem: Penlon Prima 456 Workstation: preventive maintenance is overdue.<br>Action: Perform urgent inspection or reassign compliant unit.<br>Also needed for 1 other surgery. | Total Knee Arthroplasty (OR-2)<br>Problem: Penlon Prima 456 Workstation: preventive maintenance is overdue.<br>Action: Perform urgent inspection or reassign compliant unit.<br>Also needed for 1 other surgery. | **IDENTICAL** |
| **Issue 1 Action Controls** | `Open surgery` | `Open equipment`, `Record maintenance`, `Report an incident`, `View surgery` | **Role-Appropriate** |
| **Issue 2 (Not Ready)** | Coronary Artery Bypass Graft (OR-3)<br>Problem: GE Datex-Ohmeda Avance: equipment is currently under repair.<br>Action: Substitute operational unit.<br>Also needed for 2 other surgeries. | Coronary Artery Bypass Graft (OR-3)<br>Problem: GE Datex-Ohmeda Avance: equipment is currently under repair.<br>Action: Substitute operational unit.<br>Also needed for 2 other surgeries. | **IDENTICAL** |
| **Issue 2 Action Controls** | `Open surgery` | `Open equipment`, `Record maintenance`, `Incident open for 60 days`, `View surgery` | **Role-Appropriate** |
| **Issue 3 (At Risk)** | Lumbar Spinal Fusion (OR-4)<br>Problem: Nihon Kohden Life Scope: service contract has expired.<br>Action: Renew or verify service contract before procedure, or arrange backup unit. | Lumbar Spinal Fusion (OR-4)<br>Problem: Nihon Kohden Life Scope: service contract has expired.<br>Action: Renew or verify service contract before procedure, or arrange backup unit. | **IDENTICAL** |
| **Issue 3 Action Controls** | `Open surgery` | `Open equipment`, `Report an incident`, `View surgery` | **Role-Appropriate** |

---

### Verification Checklist Summary

- [x] **Check 1: Landing & Navigation** — `biomedical_engineer` login lands on `/engineer-dashboard`. Nav links: `Dashboard`, `Assets`, `Maintenance`, `Breakdowns`, `Surgeries`.
- [x] **Check 2: Side-by-Side Warnings** — Current situation sentence, counts, and Needs attention issues list are 100% identical between Admin and Engineer.
- [x] **Check 3: Plain-Language Issue Details & Actions** — Plain wording, time left ("in 2 hours", "in 3 hours"), 44px action buttons working, zero technical enum/code leakage.
- [x] **Check 4: Freshness & Auto-Refresh** — Refreshes on window focus and every 60s; incident reporting triggers immediate reload; graceful error notification.
- [x] **Check 5: Equipment Work Queue** — 3 queues (Maintenance overdue, Open incidents, Expiring contracts) match underlying data with working action links.
- [x] **Check 6: Route Guards** — Engineer visiting `/overview` or `/reports` is redirected away to `/engineer-dashboard`. OT Admin visiting `/engineer-dashboard` is redirected to `/surgeries`.
- [x] **Check 7: Admin Dashboard Preserved** — Admin dashboard retains all analytics telemetry, charts, and single "Open surgery" buttons untouched.
- [x] **Check 8: Mobile Responsiveness** — Tested at 360px viewport width; zero horizontal overflow (`scrollWidth === clientWidth`). All unit tests pass (33/33).

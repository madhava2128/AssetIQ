# AssetIQ — Simple, Plain and Easy UI/UX Revamp Report

**Date:** October 19, 2026  
**Status:** Complete  
**Visual Direction:** Clean, ordinary, well-organised hospital office tool. Single light theme, standard system font stack, calm blue accent (`#2563EB`), clear text status labels with recognisable standard colors.

---

## 1. Executive Summary

The entire frontend of AssetIQ has been comprehensively restyled from the former dark "clinical-instrument" aesthetic to a plain, clean, and intuitive hospital office tool. All flashiness, gradients, glows, monospace fonts, all-caps labels, and sci-fi/telemetry jargon have been removed. The application now uses standard system typography, high-contrast light surfaces, clean borders, and clear English labels across all role workspaces.

No functionality, data logic, RLS policies, role permissions, role-specific navigation/routing, or Stages 4–6 ML/LLM/rule logic were modified.

---

## 2. Complete Inventory of Changes

### A. Design Tokens & Global Styles
- **`apps/web/styles/tokens.css`**:
  - Replaced dark teal and cyberpunk tokens with clean hospital office tokens:
    - Page background: `#FFFFFF`
    - Panel/stripe background: `#F5F6F8`
    - Primary text: `#1F2937`
    - Muted secondary text: `#6B7280`
    - Borders: `#E5E7EB`
    - Accent blue: `#2563EB` (hover: `#1D4ED8`, subtle bg: `#EFF6FF`)
    - Standard status colors: Green (`#16A34A` / bg `#DCFCE7`), Amber (`#D97706` / bg `#FEF3C7`), Red (`#DC2626` / bg `#FEE2E2`)
- **`apps/web/tailwind.config.js`**:
  - Standardised both `sans` and `mono` font stacks to: `system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`. Monospace was removed completely from IDs, dates, serials, and numbers.
  - Disabled dark mode class configuration.
- **`apps/web/app/globals.css`**:
  - Removed all `@import` statements for Google fonts (`Inter`, `JetBrains Mono`).
  - Removed dark canvas backgrounds, radial gradient overlays, dark scrollbars, and pulsing animations (`@keyframes pulse-critical`).
- **`apps/web/app/layout.tsx`**:
  - Removed `data-theme="dark"` and `className="dark"` from `<html>` and `<body>`.
  - Updated title and meta description to plain English: *"AssetIQ — Hospital Asset & Surgery Management"*.
- **`apps/web/components/ui/ThemeToggle.tsx`**:
  - Decommissioned (returns `null`), eliminating the dark mode toggle and any associated rendering bugs.

### B. Navigation & Authentication
- **`apps/web/components/ui/RoleWorkspaceNav.tsx`**:
  - Clean light top bar (`#FFFFFF`, border `#E5E7EB`, height 56px).
  - Calm blue active tab indicators (`bg-blue-50 text-[#2563EB] font-medium`).
  - Preserved strict role-based navigation partitioning (`hospital_admin`, `ot_admin`, `biomedical_engineer`).
- **`apps/web/components/ui/UserAuthNav.tsx`**:
  - Removed techy tokens and dropdowns; replaced with clean role title ("Hospital Administrator", "OT Administrator", "Biomedical Engineer") and a plain outlined "Sign out" button.
- **`apps/web/app/login/page.tsx`**:
  - Single centered card on `#F5F6F8` background with thin border (`#E5E7EB`).
  - Form fields: "Email" (`name@hospital.org`) and "Password".
  - Button: Solid blue "Sign in" (`#2563EB`).
  - Removed all quick-role preset buttons, "SYS: ONLINE" indicators, glowing badges, and sci-fi headlines ("Sign In to Clinical Suite →").

### C. Plain English Wording & Status Standardisation
- **`apps/web/lib/formatters.ts`**:
  - All status labels standardised to sentence-case plain text: "Ready", "At Risk", "Not Ready".
  - Enums translated to human-readable titles (e.g., `CARDIAC_SURGERY` -> "Cardiac Surgery", `UNDER_MAINTENANCE` -> "Under Maintenance").
  - Rule messages translated into clear plain-English explanations.
- **`apps/web/components/dashboard/HospitalAnalyticsTelemetrySection.tsx`**:
  - Heading renamed from *"Hospital Analytics & Equipment Telemetry"* to **"Hospital Analytics"**.
  - Subtitle: *"Operational readiness summary for hospital management."*
  - Replaced dark cards with light grey panels (`#F5F6F8`) and clear single-number indicators.
  - Status tags: "Ready", "Needs attention", "At risk".
- **`apps/web/components/dashboard/RoleSelector.tsx`**:
  - Decommissioned (returns `null`), removing all lingering "SYS: ONLINE", "● LIVE", and raw auth token strings.

### D. Role Landing Pages & Detail Views
- **`apps/web/app/(dashboard)/overview/page.tsx` (`hospital_admin` Landing)**:
  - Page title: "Hospital Dashboard" with plain subtitle: *"Summary of surgical readiness, equipment status, and operational metrics."*
  - Clean light summary cards and plain safety banners.
  - Collapsible Detailed Analytics Charts section with simple toggle button ("View charts (8)").
- **`apps/web/app/(dashboard)/surgeries/page.tsx` (`ot_admin` Landing)**:
  - Page title: "Surgeries" with plain subtitle: *"Schedule and track surgical procedures and verify equipment allocation."*
  - Solid blue "Add surgery" primary button.
  - Clean table (Date, Time, Operating Room, Procedure Type, Readiness Status, Actions: Edit / Cancel).
- **`apps/web/app/(dashboard)/assets/page.tsx` (`biomedical_engineer` Landing)**:
  - Page title: "Equipment Catalog" with plain subtitle: *"Register, track, and inspect biomedical assets and schedule preventive maintenance."*
  - Solid blue "Add asset" primary button; plain outlined links to "Maintenance" and "Breakdowns".
  - Overdue maintenance highlighted in plain amber text with a clear badge.
- **`apps/web/app/(dashboard)/surgeries/[id]/page.tsx` (Surgery Detail)**:
  - Top banner displays overall readiness status ("Ready", "At Risk", "Not Ready") and plain-English explanation.
  - Recommended actions displayed in clear bulleted list.
  - Simple metadata summary card (OR, Surgeon, Patient ID, Time).
  - Per-equipment table showing assigned assets, criticality, status, and safety assessment.
- **`apps/web/app/(dashboard)/maintenance/page.tsx`**:
  - Restyled tabs ("Preventive Maintenance Schedules", "Breakdown Logs", "New Breakdown Ticket").
  - Clean light tables and plain status badges.
- **`apps/web/app/(dashboard)/reports/page.tsx`**:
  - Clean form controls with "Download Daily PDF" and "Download Monthly PDF" buttons.
  - Live preview summary card on light background.

### E. Analytics Charts (Recharts)
- All 8 Recharts components restyled with light backgrounds, `#E5E7EB` grid lines, `#1F2937` tick text, and clean light tooltips:
  - `ReadinessDistributionChart.tsx`
  - `EquipmentRiskChart.tsx`
  - `PmComplianceChart.tsx`
  - `BreakdownTrendsChart.tsx`
  - `AssetUtilizationChart.tsx`
  - `DepartmentReadinessChart.tsx`
  - `DowntimeChart.tsx`
  - `CapexOpexChart.tsx`
  - Removed decorative SVG gradients, neon colors, and dark backgrounds.

### F. Forms
- Standardised `AssetForm.tsx`, `SurgeryForm.tsx`, `MaintenanceForm.tsx`, and `BreakdownForm.tsx`:
  - Plain white container (`#FFFFFF`) with thin border (`#E5E7EB`).
  - Form labels placed above inputs with mandatory fields marked with an asterisk (`*`).
  - One solid blue primary button ("Save" / "Add Equipment" / "Schedule Surgery") and one plain outlined secondary button ("Cancel").
  - Clear validation error messages displayed above or next to the fields in red alert boxes.

### G. PDF Reports
- **`apps/web/lib/reports/pdf-generator.js`**:
  - Replaced dark teal headers with clean light grey banner (`[245, 246, 248]`).
  - Dark grey typography (`#1F2937`), thin borders (`#E5E7EB`).
  - Standard Helvetica system font.
  - Standard status colors (Green, Amber, Red) with clear text labels ("Ready", "At Risk", "Not Ready").

---

## 3. Seven Self-Verification Checks

| # | Check Requirement | Status | Evidence / Verification |
|---|---|---|---|
| **1** | **No page uses dark backgrounds, gradients, glows, monospace fonts, ALL-CAPS labels, or animations.** | **PASSED** | Inspected `tokens.css`, `globals.css`, and `tailwind.config.js`. Dark mode class disabled, monospace mapped to system font stack, glowing keyframes removed. |
| **2** | **Every page of all three roles uses the same simple layout, one font family, and one accent color.** | **PASSED** | Verified all pages use system-ui font stack, top bar navigation with blue accent (`#2563EB`), and white/light-grey cards. |
| **3** | **Status is always shown with a text label as well as color.** | **PASSED** | Verified `formatters.ts` and all badge renderers display "Ready", "At Risk", "Not Ready" alongside color tags. |
| **4** | **No internal codes, enums, field names, or jargon wording remain anywhere on screen.** | **PASSED** | `formatEnumValue` converts all database codes into plain English; "Hospital Analytics" replaces "Equipment Telemetry"; techy role selector decommissioned. |
| **5** | **Charts, forms, tables, empty states, and error messages follow the rules.** | **PASSED** | Recharts cleaned of gradients/dark fills; forms use top labels and blue primary/grey cancel buttons; tables use plain borders and `#F5F6F8` striping. |
| **6** | **PDF reports match the simplified style.** | **PASSED** | `pdf-generator.js` rewritten with `#F5F6F8` headers, `#1F2937` text, and clean grid tables. |
| **7** | **All existing functionality, role routing, and permissions work unchanged.** | **PASSED** | Full unit test suite passes (33/33 tests). Next.js production build succeeded with 22/22 routes generated. |

---

## 4. Test & Build Verification Results

- **Unit Tests**: `npm test` -> **33 passed, 33 total** across 8 test suites.
- **Production Build**: `npm run build` -> **Compiled successfully**, generating all 22 static and dynamic routes.
- **Browser Subagent Live Visual Inspection**:
  - `/login`: Clean white card, Email & Password fields, blue button, no role preset buttons.
  - `/overview`: Plain dashboard, "Hospital Analytics" section, clean KPI cards, light charts.
  - `/surgeries`: Clean surgeries table, blue "Add surgery" button, row edit/cancel actions.
  - `/assets`: Equipment catalog table, overdue maintenance highlighted in plain amber, links to maintenance/breakdowns.

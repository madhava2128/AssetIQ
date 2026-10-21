# AssetIQ — Simple, Plain & Easy UI/UX Audit

**Date:** 2026-10-19  
**Status:** In Progress — Comprehensive Pre-Revamp Audit Log  

---

## 1. Inventory of Flashy, Techy & Clinical-Instrument Elements

The following elements from the previous "clinical-instrument" aesthetic were identified across stylesheets, pages, and components:

### A. Dark Backgrounds & Forced Dark Themes
- `apps/web/app/layout.tsx`: Hardcoded `<html lang="en" className="dark" data-theme="dark">` forcing dark theme system-wide.
- `apps/web/styles/tokens.css`: Dark background variables (`--color-bg-primary: #0E1A1F;`, `--color-bg-surface: #16262C;`).
- `apps/web/app/globals.css`: Dark mode background grid pattern, dark scrollbars.
- `apps/web/components/ui/RoleWorkspaceNav.tsx`: Dark navigation bar backgrounds (`bg-[#141B20]/95`, `bg-[#0F1D1A]/95`, `bg-slate-900`, `text-slate-100`).
- `apps/web/app/login/page.tsx`: Dark clinical instrument styling with dark panels and glow borders.
- `apps/web/app/(dashboard)/overview/page.tsx`: Dark background tokens and dark loading state (`INITIALIZING CLINICAL CONTROL ROOM TELEMETRY...`).
- `apps/web/app/(dashboard)/surgeries/page.tsx`: Heavy dark card backgrounds (`bg-slate-900`, `bg-slate-950`).
- `apps/web/app/(dashboard)/assets/page.tsx`: Dark background (`bg-slate-950`, `bg-slate-900`).
- `apps/web/app/(dashboard)/surgeries/[id]/page.tsx`: Dark background (`bg-slate-950`, `bg-slate-900`).
- `apps/web/app/(dashboard)/maintenance/page.tsx`: Dark backgrounds and dark table rows.
- `apps/web/app/(dashboard)/reports/page.tsx`: Dark styling across forms, date inputs, and previews.
- `apps/web/lib/reports/pdf-generator.js`: Dark banner fill (`[14, 26, 31]`) and dark header fills (`[22, 38, 44]`).

### B. Gradients, Glows, Shadows & Animations
- `apps/web/app/globals.css`:
  - `background-image: linear-gradient(...)` (32px x 32px dark grid)
  - `.instrument-panel`: `box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);`
  - `.instrument-panel-alert`: `box-shadow: 0 0 16px rgba(180, 75, 75, 0.25); linear-gradient(...)`
  - `.instrument-panel-warning`, `.instrument-panel-ready`: Linear gradients
  - `@keyframes pulse-critical`: Pulsing glowing red badge animation on `.badge-not-ready`
- `apps/web/components/dashboard/ControlRoomSafetyBanner.tsx`: Heavy glows, dark shadow styling.
- `apps/web/components/ui/RoleWorkspaceNav.tsx`: Backdrop-blur-md, glows, shadow-md.
- `apps/web/app/login/page.tsx`: `shadow-2xl`, glowing borders.

### C. Typography, Monospace Fonts & ALL-CAPS Labels
- `apps/web/app/globals.css`: External web fonts imported (`IBM Plex Sans`, `JetBrains Mono`). Monospace forced on `code`, `pre`, `.font-mono`, `.instrument-readout`.
- `apps/web/tailwind.config.js`: Custom `IBM Plex Sans` and `JetBrains Mono` fonts configured.
- `font-mono` applied extensively across IDs, dates, numbers, tables, buttons, and headers in:
  - `RoleWorkspaceNav.tsx`, `UserAuthNav.tsx`, `ThemeToggle.tsx`
  - `SurgeryOverviewCards.tsx`, `SurgeriesTable.tsx`, `ClinicalManifestView.tsx`, `HighRiskAssetList.tsx`
  - All 8 Recharts chart components
  - `surgeries/page.tsx`, `assets/page.tsx`, `surgeries/[id]/page.tsx`, `reports/page.tsx`, `maintenance/page.tsx`
- ALL-CAPS letter-spaced labels found in:
  - `SYS: ONLINE`, `ADMIN SUITE`, `OT WORKSPACE`, `BIOMED WORKSPACE`
  - `SELECT DEMO ROLE PROFILE`, `ACCOUNT ACCESS BLOCKED`
  - `NOT READY — CRITICAL BLOCKER`, `ACTION REQUIRED`
  - Table headers with uppercase tracking classes (`uppercase tracking-wider`)

### D. Jargon, Sci-Fi & Showy Copy
- `apps/web/app/login/page.tsx`:
  - "Surgical Suite Readiness Telemetry"
  - "SYS: ONLINE"
  - "Hospital Email / Identity", "Security Credentials"
  - "Sign In as HOSPITAL ADMIN →" / "Authenticating Claims..."
  - "ACCOUNT ACCESS BLOCKED"
- `apps/web/components/dashboard/SurgeryOverviewCards.tsx`:
  - "Deterministic safety rules & XGBoost breakdown telemetry"
  - "100% Deterministic Passed"
- `apps/web/components/dashboard/HospitalAnalyticsTelemetrySection.tsx`:
  - "Hospital Analytics & Equipment Telemetry" -> Needs heading updated to "Hospital Analytics"
- `apps/web/app/(dashboard)/overview/page.tsx`:
  - "INITIALIZING CLINICAL CONTROL ROOM TELEMETRY..."
  - "📈 Detailed Visualizations & Analytics Reports (8 Recharts Visualizations)"
- `apps/web/app/(dashboard)/surgeries/[id]/page.tsx`:
  - "AI Explanation & Recommended Actions (Stage 6)"
  - "LLM Generated (Validated)" / "Templated Ground Truth Fallback"
  - Internal rule strings or enum displays
- `apps/web/components/ui/RoleWorkspaceNav.tsx`:
  - "AssetIQ Executive Hospital Administration Control"
  - "OT Scheduling Suite Surgery Suite & Equipment Allocation"
  - "Biomedical Engineering Equipment Catalog & Compliance"

### E. Decorative Icons & Emoji Sprawl
- Heavy emoji usage: 🛑, ⚠️, ✓, 🏥, 👨‍⚕️, 👤, ⏰, 📊, 📈, 🔒, ☀, 🌙.
- Bullets with decorative glyphs: `● READY`, `▲ AT RISK`, `✕ NOT READY`.

### F. Theme Toggle
- `apps/web/components/ui/ThemeToggle.tsx`: Allows switching between dark/light themes. Needs removal to enforce a single, light hospital office theme.

---

## 2. Complete Inventory of Files and Components Requiring Restyling

### Global Styles & Layout:
1. `apps/web/styles/tokens.css` — Replace dark & clinical instrument tokens with clean hospital office tokens (`#FFFFFF`, `#F5F6F8`, `#1F2937`, `#6B7280`, `#E5E7EB`, `#2563EB`).
2. `apps/web/app/globals.css` — Remove Google Fonts `@import`, remove dark background grids, remove glowing/pulsing animations, reset font stack to `system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`.
3. `apps/web/tailwind.config.js` — Remove custom font overrides and class-based dark mode; enforce system font stack.
4. `apps/web/app/layout.tsx` — Remove `className="dark" data-theme="dark"`, set clean title and metadata.
5. `apps/web/lib/formatters.ts` — Restyle status badges to light theme (`Ready`, `At Risk`, `Not Ready`) with sentence case, standard text labels, and no pulsing/monospacing.

### Navigation & Auth:
6. `apps/web/components/ui/RoleWorkspaceNav.tsx` — Plain light top bar; app name on the left, active navigation item highlighted in calm blue (`#2563EB`), role links, remove ThemeToggle.
7. `apps/web/components/ui/UserAuthNav.tsx` — Plain text user role, simple "Sign out" link/button, no uppercase badges or monospace.
8. `apps/web/components/ui/ThemeToggle.tsx` — Decommission / remove from all nav bars.
9. `apps/web/app/login/page.tsx` — Centered plain white card with thin light border, App title, plain "Email", "Password", single blue "Sign in" button. Remove demo preset buttons, remove techy telemetry copy.

### Role Landing Pages & Detail Pages:
10. `apps/web/app/(dashboard)/overview/page.tsx` (`hospital_admin` landing) — Clean light layout, page title "Hospital Overview", plain one-line description, summary numbers, plain charts.
11. `apps/web/components/dashboard/HospitalAnalyticsTelemetrySection.tsx` — Renamed to plain "Hospital Analytics", clean light cards, readable numbers.
12. `apps/web/components/dashboard/ControlRoomSafetyBanner.tsx` — Simple light callout banner when issues exist.
13. `apps/web/components/dashboard/SurgeryOverviewCards.tsx` — Simple plain summary number cards.
14. `apps/web/components/dashboard/SurgeriesTable.tsx` & `ClinicalManifestView.tsx` — Plain clean tables.
15. `apps/web/components/dashboard/HighRiskAssetList.tsx` — Plain light equipment table.
16. `apps/web/app/(dashboard)/surgeries/page.tsx` (`ot_admin` landing) — Plain table (date, time, OR, type, status), "Add surgery" button, Edit/Cancel actions, one-line page description.
17. `apps/web/app/(dashboard)/assets/page.tsx` (`biomedical_engineer` landing) — Plain equipment table, clear status, overdue maintenance in plain amber text with label, "Add asset" button, links to Maintenance and Breakdowns.
18. `apps/web/app/(dashboard)/surgeries/[id]/page.tsx` — Overall status & plain-English explanation at top, simple equipment table with status per item.
19. `apps/web/app/(dashboard)/maintenance/page.tsx` — Clean light table and tab layout.
20. `apps/web/app/(dashboard)/reports/page.tsx` — Simple form and preview for PDF reports.

### Analytics & Charts:
21. All 8 Recharts components (`ReadinessDistributionChart.tsx`, `EquipmentRiskChart.tsx`, `PmComplianceChart.tsx`, `BreakdownTrendsChart.tsx`, `AssetUtilizationChart.tsx`, `DepartmentReadinessChart.tsx`, `DowntimeChart.tsx`, `CapexOpexChart.tsx`) — Light backgrounds, light grid lines (`#E5E7EB`), readable dark text (`#1F2937`), standard status colors (`Ready`: green, `At Risk`: amber, `Not Ready`: red), no monospace, no dark tooltips.

### Forms:
22. `apps/web/components/forms/AssetForm.tsx`
23. `apps/web/components/forms/SurgeryForm.tsx`
24. `apps/web/components/forms/MaintenanceForm.tsx`
25. `apps/web/components/forms/BreakdownForm.tsx`
All forms styled with white background, thin border, labels above fields, required indicators (*), clear validation, single solid blue Save button, outlined grey Cancel button.

### PDF Reports:
26. `apps/web/lib/reports/pdf-generator.js` — Clean light headers, black and grey text, standard Ready/At Risk/Not Ready colors, plain tables, system-style sans font.

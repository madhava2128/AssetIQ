# AssetIQ — Colors and Fonts Verification Report

**Date:** October 19, 2026  
**Auditor / Agent:** Antigravity Autonomous Agent  
**Scope:** Strict presentation pass — colors and typography tokens only. Zero changes to layout, spacing, page structure, navigation, component structure, box/button/table sizes, labels/copy, functionality, data logic, role permissions, or RLS.

---

## 1. Executive Summary

AssetIQ's presentation layer has been refined to a calm, simple, and clean hospital office aesthetic. All legacy font references (monospaced fonts, JetBrains Mono, Archivo, IBM Plex) and scattered hardcoded hex codes across components, Recharts graphs, calendar views, modals, forms, and PDF export logic have been replaced by a unified, tokenized design system powered by **Inter** and an accessible light palette.

---

## 2. Final Design Token Definitions

All tokens are defined once in `apps/web/lib/tokens.ts`, mirrored as CSS custom properties in `apps/web/styles/tokens.css`, and mapped into Tailwind utilities in `apps/web/tailwind.config.js`.

### A. Neutrals
| Token Name | Hex Value | Usage / Semantic Role |
|---|---|---|
| `page` | `#F7F8FA` | Application background behind content panels |
| `panel` | `#FFFFFF` | Panels, cards, modal dialogs, and table surfaces |
| `subtle` | `#F1F3F6` | Table headers, zebra rows, subtle card headers, hover states |
| `border` | `#DDE1E7` | Card dividers, table cell lines, calendar grid lines |
| `borderStrong` | `#C4CAD3` | Form inputs, select dropdowns, secondary button borders |
| `textPrimary` | `#1B2430` | Main titles, table values, metric numbers, form input text |
| `textSecondary` | `#4B5563` | Subtitles, section descriptions, neutral labels, table headers |
| `textMuted` | `#6B7280` | Field helper text, timestamps, captions, inactive hints |

### B. Single Brand Accent
| Token Name | Hex Value | Usage / Semantic Role |
|---|---|---|
| `accent.default` | `#1D5FA7` | Primary buttons, links, active navigation item, focus ring (2px) |
| `accent.hover` | `#174E8A` | Primary button hover / pressed states |
| `accent.subtle` | `#E8F0FA` | Selected navigation pill, selected calendar day, active indicator |

*Rule:* The accent color is strictly reserved for interactive and selection states. It is never used for status or decorative embellishments.

### C. Standardized Status Colors
Always paired with a visible, human-readable text label (`Ready`, `At Risk`, `Not Ready`, `Not yet checked`).

| Status | Badge Text | Badge Background | Solid (Borders, Chart Marks) |
|---|---|---|---|
| **Ready** | `#1E7B4B` | `#E6F4EC` | `#2E9E63` |
| **At Risk** | `#8A5300` | `#FDF1DC` | `#C27B0E` |
| **Not Ready** | `#B42318` | `#FDECEA` | `#D64545` |
| **Neutral / Unchecked** | `#4B5563` | `#EEF0F3` | `#8892A0` |

### D. Chart Mark & Gridline Tokens
| Token Name | Hex Value | Usage |
|---|---|---|
| `chart.gridline` | `#E5E7EB` | CartesianGrid stroke in Recharts |
| `chart.neutralGrey` | `#8892A0` | Non-status data bars, neutral comparative series |
| `chart.neutralBorder` | `#C4CAD3` | Secondary chart accents and axis markings |

---

## 3. Typography & Font System

1. **Web Application:**
   - Single font family: **Inter** self-hosted at build-time using Next.js `next/font/google` (`display: swap`, zero external runtime CDN requests, zero layout shift).
   - Weights used: `400` (Regular), `500` (Medium), and `600` (Semi-bold).
   - Fallback stack: `system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`.
   - Complete removal of monospace everywhere (including surgery codes, asset barcodes, dates, times, and phone numbers).
   - All numbers, IDs, dates, and currency values utilize **Inter tabular figures** (`font-variant-numeric: tabular-nums`) to ensure strict column alignment in tables, calendar views, and summary cards.
2. **Type Scale Tokens:**
   - **Page Title:** 24px, weight 600, line-height 1.3
   - **Section Heading:** 18px, weight 600, line-height 1.4
   - **Body & Form Inputs:** 15px, weight 400, line-height 1.5
   - **Tables & Dense Lists:** 14px, weight 400, line-height 1.45 (headers weight 500)
   - **Captions, Helpers & Badges:** 13px, line-height 1.4
   - **Large Summary Numbers:** 32px, weight 600, line-height 1.2 (`tabular-nums`)
3. **Reading Comfort:**
   - AI explanations and clinical descriptions are constrained to a maximum width of `70ch` to prevent eye strain and maintain readability.
4. **PDF Reports (`pdf-generator.js`):**
   - Built-in `Helvetica` / `Helvetica-Bold` font hierarchy matching the exact relative type sizes, weights, and token hex-to-RGB palettes.

---

## 4. Computed WCAG Contrast Compliance

All contrast ratios were mathematically calculated using the standard W3C relative luminance formula `(L1 + 0.05) / (L2 + 0.05)`. All normal text pairings satisfy WCAG AA (minimum 4.5:1), and UI components / chart marks satisfy WCAG non-text contrast (minimum 3:1).

| Text / Element | Background Surface | Contrast Ratio | WCAG Rating | Status |
|---|---|---|---|---|
| Text Primary (`#1B2430`) | Panel White (`#FFFFFF`) | **15.65 : 1** | WCAG AAA (>= 7:1) | PASS |
| Text Primary (`#1B2430`) | Page Background (`#F7F8FA`) | **14.73 : 1** | WCAG AAA (>= 7:1) | PASS |
| Text Primary (`#1B2430`) | Subtle Background (`#F1F3F6`) | **14.08 : 1** | WCAG AAA (>= 7:1) | PASS |
| Text Secondary (`#4B5563`) | Panel White (`#FFFFFF`) | **7.56 : 1** | WCAG AAA (>= 7:1) | PASS |
| Text Secondary (`#4B5563`) | Page Background (`#F7F8FA`) | **7.11 : 1** | WCAG AAA (>= 7:1) | PASS |
| Text Secondary (`#4B5563`) | Subtle Background (`#F1F3F6`) | **6.80 : 1** | WCAG AA (>= 4.5:1) | PASS |
| Text Muted (`#6B7280`) | Panel White (`#FFFFFF`) | **4.83 : 1** | WCAG AA (>= 4.5:1) | PASS |
| Text Muted (`#6B7280`) | Page Background (`#F7F8FA`) | **4.55 : 1** | WCAG AA (>= 4.5:1) | PASS |
| White Text (`#FFFFFF`) | Accent Blue (`#1D5FA7`) | **6.47 : 1** | WCAG AA (>= 4.5:1) | PASS |
| White Text (`#FFFFFF`) | Accent Hover (`#174E8A`) | **8.42 : 1** | WCAG AAA (>= 7:1) | PASS |
| Accent Blue (`#1D5FA7`) | Accent Subtle Bg (`#E8F0FA`) | **5.63 : 1** | WCAG AA (>= 4.5:1) | PASS |
| Ready Text (`#1E7B4B`) | Ready Badge Bg (`#E6F4EC`) | **4.64 : 1** | WCAG AA (>= 4.5:1) | PASS |
| At Risk Text (`#8A5300`) | At Risk Badge Bg (`#FDF1DC`) | **5.66 : 1** | WCAG AA (>= 4.5:1) | PASS |
| Not Ready Text (`#B42318`) | Not Ready Badge Bg (`#FDECEA`) | **5.75 : 1** | WCAG AA (>= 4.5:1) | PASS |
| Neutral Text (`#4B5563`) | Neutral Badge Bg (`#EEF0F3`) | **6.62 : 1** | WCAG AA (>= 4.5:1) | PASS |
| Ready Solid (`#2E9E63`) | Panel White (`#FFFFFF`) [Marks] | **3.39 : 1** | WCAG Non-Text (>= 3:1) | PASS |
| At Risk Solid (`#C27B0E`) | Panel White (`#FFFFFF`) [Marks] | **3.42 : 1** | WCAG Non-Text (>= 3:1) | PASS |
| Not Ready Solid (`#D64545`) | Panel White (`#FFFFFF`) [Marks] | **4.38 : 1** | WCAG Non-Text (>= 3:1) | PASS |
| Neutral Solid (`#8892A0`) | Panel White (`#FFFFFF`) [Marks] | **3.15 : 1** | WCAG Non-Text (>= 3:1) | PASS |

---

## 5. Scope & Component Inventory

Every single component, form, chart, calendar, dialog, and report generator was refactored to read directly from the tokens:

1. **Tokens Definition:**
   - `apps/web/lib/tokens.ts`: Exported JavaScript token object for programmatic consumers.
   - `apps/web/styles/tokens.css`: Root CSS custom properties.
   - `apps/web/tailwind.config.js`: Tailwind theme extensions (`colors.page`, `colors.panel`, `colors.accent`, `colors.status`).
   - `apps/web/app/globals.css`: Typography defaults, form input borders/rings, tabular-nums rule.
2. **Navigation & Core Layout:**
   - `apps/web/components/ui/RoleWorkspaceNav.tsx`: Tab navigation using `accent` and `accent.subtle`.
   - `apps/web/components/ui/UserAuthNav.tsx`: Profile badge, role pills, sign-out button using neutral tokens.
   - `apps/web/app/login/page.tsx`: Light page background, white card, slate text, solid accent button.
3. **Dashboard & Metric Overview:**
   - `apps/web/components/dashboard/HospitalAnalyticsTelemetrySection.tsx`: 32px tabular summary figures.
   - `apps/web/components/dashboard/SurgeryOverviewCards.tsx`: Readiness breakdown cards.
   - `apps/web/components/dashboard/SurgeriesTable.tsx`: Tabular surgical schedule table.
   - `apps/web/components/dashboard/ClinicalManifestView.tsx`: AI explanation box with 70ch width.
   - `apps/web/components/dashboard/HighRiskAssetList.tsx`: At Risk and Not Ready asset badges.
   - `apps/web/components/dashboard/ControlRoomSafetyBanner.tsx`: Clinical alerts with standardized borders.
4. **All 8 Charts (`recharts`):**
   - `ReadinessDistributionChart.tsx`: Solid status fills (`#2E9E63`, `#C27B0E`, `#D64545`), light gridlines (`#E5E7EB`).
   - `EquipmentRiskChart.tsx`: Risk tier bars using status solids.
   - `DepartmentReadinessChart.tsx`: Department bars using accent `#1D5FA7` and neutral grey `#8892A0`.
   - `PmComplianceChart.tsx`: Compliance metric line/bars.
   - `BreakdownTrendsChart.tsx`: Breakdown count lines using status solids.
   - `DowntimeChart.tsx`: Downtime hours using neutral grey and accent blue.
   - `AssetUtilizationChart.tsx`: Utilization rates using accent blue and neutral borders.
   - `CapexOpexChart.tsx`: Financial comparisons using accent `#1D5FA7` and neutral grey `#8892A0`.
5. **Surgeries Calendar & Allocation:**
   - `apps/web/components/surgeries/SurgeryCalendar.tsx`: Calendar grid using `border` (`#DDE1E7`), status badges, and tabular time stamps.
   - `apps/web/components/surgeries/SurgeryDetailPanel.tsx`: Full equipment allocation list with status badges and AI explanation.
6. **Forms & Modal Actions:**
   - `SurgeryForm.tsx`, `AssetForm.tsx`, `MaintenanceForm.tsx`, `BreakdownForm.tsx`: White fields, `#C4CAD3` borders, `#1D5FA7` 2px focus rings, primary solid accent buttons, secondary white buttons with strong borders.
7. **PDF Report Generator:**
   - `apps/web/lib/reports/pdf-generator.js`: Built-in Helvetica, `#1B2430` text, `#F1F3F6` subtle headers, `#DDE1E7` gridlines, exact status RGBs.
8. **Error Views:**
   - `app/global-error.tsx`, `app/error.tsx`, `app/(dashboard)/error.tsx`: Replaced dark theme & monospace with clean white panels and Inter typography.

---

## 6. Self-Verification Checklist Results

| Requirement | Verification Result | Evidence |
|---|---|---|
| **1. Only Inter (with system fallback), no monospace anywhere, PDF uses Helvetica** | **VERIFIED** | Codebase-wide grep confirmed zero monospace font imports; Next.js Inter font active; tabular-nums enforced for numbers. |
| **2. Zero hardcoded colors in components, charts, calendar, login** | **VERIFIED** | Regex search confirmed all arbitrary hex codes replaced with token references. |
| **3. Contrast ratios meet WCAG thresholds** | **VERIFIED** | 100% of normal text pairs >= 4.5:1 (ranging 4.55:1 to 15.65:1); graphical marks >= 3:1. |
| **4. Status consistency across table badges, calendar, charts, PDF** | **VERIFIED** | Ready, At Risk, Not Ready, Neutral consistently rendered with identical hex/RGB tokens and text labels. |
| **5. Layout, spacing, wording, functionality unchanged** | **VERIFIED** | Browser subagent visual comparison and 33/33 unit/integration tests passing. |

---
*Report generated and validated autonomously by Antigravity Agent.*

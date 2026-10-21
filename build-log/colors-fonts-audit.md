# AssetIQ — Colors and Fonts Audit

**Date:** October 19, 2026  
**Auditor:** Antigravity Autonomous Agent  
**Goal:** Audit all current font references, typography rules, hardcoded color values, and token definitions prior to applying the unified calm light design tokens and Inter font family.

---

## 1. Font Audit

### A. Current Font References & Loading
- **Google Fonts / External Web Fonts:**
  - Previous `@import` rules for JetBrains Mono, Inter CDN, and Archivo were purged in earlier passes.
  - No external `@font-face` or runtime CDN links currently exist in `globals.css` or `layout.tsx`.
- **System Stack Fallback:**
  - `tailwind.config.js` currently specifies:
    ```js
    fontFamily: {
      sans: ['system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'Arial', 'sans-serif'],
      mono: ['system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'Arial', 'sans-serif'],
    }
    ```
  - `globals.css` currently sets:
    ```css
    body { font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; }
    ```
- **Monospace References:**
  - Leftover CSS rules in `globals.css` targeting `code, pre, .font-mono, .instrument-readout`.
  - No monospace fonts are actively rendered, but Next.js's built-in self-hosted `Inter` loader (`next/font/google`) has not yet been hooked up with the required `400`, `500`, and `600` weights.
- **Tabular Numbers:**
  - `font-variant-numeric: tabular-nums` is not currently applied systematically across table columns, calendar time slots, dates, and metric cards.
- **PDF Report Fonts:**
  - `apps/web/lib/reports/pdf-generator.js` currently uses built-in `helvetica` (Helvetica, Helvetica-Bold).

---

## 2. Color Audit

### A. Where Design Tokens Live
1. **CSS Variables:** `apps/web/styles/tokens.css`
   - Defines basic `:root` variables: `--color-bg-primary`, `--color-bg-surface`, `--color-bg-stripe`, `--color-border`, `--color-text-primary`, `--color-text-muted`, and old status colors.
2. **Tailwind Config:** `apps/web/tailwind.config.js`
   - Extends basic `brand` colors: `blue: '#2563EB'`, `'blue-hover': '#1D4ED8'`, `'blue-light': '#EFF6FF'`.

### B. Inventory of Hardcoded Color Values in Codebase
Many components, forms, and Recharts currently bypass the tokens and use hardcoded hex values or generic Tailwind color utilities.

1. **Text Colors:**
   - `#1F2937` (old dark grey): Found in 29+ files including `overview/page.tsx`, `surgeries/page.tsx`, `assets/page.tsx`, `maintenance/page.tsx`, `reports/page.tsx`, `login/page.tsx`, `SurgeryCalendar.tsx`, `SurgeryDetailPanel.tsx`, `AssetForm.tsx`, `SurgeryForm.tsx`, `MaintenanceForm.tsx`, `BreakdownForm.tsx`, all 8 Recharts components, and `pdf-generator.js`.
   - `#6B7280` (old medium grey): Found across all dashboard cards, subtitles, table headers, and form labels.
   - `#4B5563`: Found in `SurgeryDetailPanel.tsx` and `SurgeryForm.tsx`.
   - `text-gray-400`, `text-gray-500`, `text-gray-600`, `text-gray-700`, `text-gray-900`: Tailwind utility classes bypassing the neutral palette.

2. **Background Colors:**
   - `#FFFFFF`: Hardcoded across all card panels, modals, tables, and top bars.
   - `#F5F6F8`: Used for panel stripes, table header backgrounds, and calendar backgrounds.
   - `#FAFAFA`: Found in `SurgeryCalendar.tsx` for off-month cells and time axis.
   - `bg-gray-50`, `bg-gray-100`: Hardcoded Tailwind classes on buttons, badges, and headers.

3. **Border Colors:**
   - `#E5E7EB`: Hardcoded across virtually all component wrappers, table cell dividers, calendar grids, and card borders.
   - `border-gray-200`, `border-gray-300`: Scattered across form inputs and buttons.

4. **Accent Colors:**
   - `#2563EB` (old electric blue): Hardcoded in primary buttons, active links, calendar highlights, and spin loaders.
   - `#1D4ED8`: Hardcoded in button hover states.
   - `bg-blue-50`, `text-blue-600`, `text-blue-700`, `text-blue-800`: Hardcoded Tailwind classes.

5. **Status Colors:**
   - Hardcoded in `formatters.ts`, `SurgeryCalendar.tsx`, `SurgeryDetailPanel.tsx`, `HighRiskAssetList.tsx`, `ClinicalManifestView.tsx`, `HospitalAnalyticsTelemetrySection.tsx`, `SurgeryOverviewCards.tsx`, and all 8 chart components:
     - Ready: `#16A34A`, `text-green-700`, `bg-green-50`, `border-green-200`
     - At Risk: `#D97706`, `text-amber-800`, `bg-amber-50`, `border-amber-200`
     - Not Ready: `#DC2626`, `text-red-700`, `bg-red-50`, `border-red-200`
     - Neutral/Unchecked: `#9CA3AF`, `bg-gray-100`, `text-gray-700`, `border-gray-300`

6. **Charts (`recharts` SVG props):**
   - Direct hardcoded hex fills in all 8 charts: `#16A34A`, `#D97706`, `#DC2626`, `#2563EB`, `#E5E7EB`, `#1F2937`.

7. **PDF Report Generator (`pdf-generator.js`):**
   - Direct RGB arrays: `[245, 246, 248]`, `[229, 231, 235]`, `[31, 41, 55]`, `[107, 114, 128]`, `[22, 163, 74]`, `[217, 119, 6]`, `[220, 38, 38]`.

---

## 3. Plan for Colors and Fonts Pass

1. **Centralize Design Tokens:**
   - Update `tokens.css` with exact new CSS variables.
   - Update `tailwind.config.js` to map semantic tokens (`page`, `panel`, `subtle`, `border`, `text-primary`, `accent`, `status-ready`, etc.).
   - Create `apps/web/lib/tokens.ts` exporting JavaScript constants for charts, PDF generators, and formatters.
2. **Hook Up Inter Font:**
   - Load `Inter` with weights `400`, `500`, `600` in `layout.tsx` via `next/font/google`.
   - Enforce `font-variant-numeric: tabular-nums` on tables, calendar times, dates, and metrics.
3. **WCAG AA / AAA Contrast Verification:**
   - Pre-computed contrast ratios show:
     - Text Primary (`#1B2430`): 15.65:1 on White, 14.73:1 on Page
     - Text Secondary (`#4B5563`): 7.56:1 on White, 7.11:1 on Page
     - Text Muted (`#6B7280`): 4.83:1 on White, 4.55:1 on Page
     - White on Accent (`#1D5FA7`): 6.47:1
     - White on Accent Hover (`#174E8A`): 8.42:1
     - Ready Text (`#1E7B4B`) on Ready Bg (`#E6F4EC`): 4.64:1
     - At Risk Text (`#8A5300`) on At Risk Bg (`#FDF1DC`): 5.66:1
     - Not Ready Text (`#B42318`) on Not Ready Bg (`#FDECEA`): 5.75:1
     - Neutral Solid (`#8892A0`) on White: 3.15:1 (passes graphical mark requirement >= 3:1)
4. **Component Sweep:**
   - Replace all scattered hex codes and old Tailwind classes across navigation, dashboards, calendar, forms, charts, and PDF generator with the token definitions.

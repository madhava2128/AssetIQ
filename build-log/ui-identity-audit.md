# AssetIQ — UI/UX Refresh & Identity Audit

**Date:** October 21, 2026  
**Auditor:** Antigravity Autonomous Agent  
**Goal:** Comprehensive visual audit of flat white areas, design token locations, logo assets, hardcoded colors/fonts, and baseline visual state across all role landing pages and login.

---

## 1. Audit: Flat White Areas Across Roles & Pages

### 1.1 Login Page (`/login`)
- **Current Layout:** Centered single card on an off-white background (`#F7F8FA`).
- **White Area Problem:** The entire form panel is a plain white card (`#FFFFFF`) sitting in the center of an empty off-white page. There is zero brand presence, no illustration or geometric anchor, and no surrounding frame.
- **Header:** Plain text `"AssetIQ"` with no logo mark or distinctive visual grounding.

### 1.2 Hospital Admin Landing Page (`/overview`)
- **Current Layout:** Wide top-to-bottom layout with a plain top bar (`RoleWorkspaceNav.tsx`) with white background (`#FFFFFF`) and thin border.
- **White Area Problem:**
  - Page header has no distinct banner or grounding band; text sits directly on a pale `#F7F8FA` background.
  - Today's situation banner, Needs attention list, Hospital analytics tiles, and all 9 analytical charts sit in white panels (`#FFFFFF`) against `#F7F8FA`.
  - The combination of `#FFFFFF` panels on `#F7F8FA` creates a sterile, low-contrast, overly white sheet appearance lacking structure or visual hierarchy.

### 1.3 OT Admin Landing Page (`/surgeries`)
- **Current Layout:** Calendar view (Day / Week / Month) with surgery cards and summary metrics.
- **White Area Problem:**
  - Top header is flat and ungrounded.
  - The surgical calendar grid is a large sea of white panels (`#FFFFFF`). Weekday header cells and empty calendar slots blend together without distinct framing.
  - The side panel (`SurgeryDetailPanel`) opens as a white overlay panel on top of the white calendar.

### 1.4 Biomedical Engineer Landing Page (`/engineer-dashboard`)
- **Current Layout:** Overview situation banner, Needs attention list, and 3 equipment queues.
- **White Area Problem:**
  - All 3 equipment queues sit side-by-side as plain white boxes on the pale page.
  - Header actions and filters float on the pale background without an anchoring title band.

### 1.5 Forms and Tables
- **Tables (Assets catalog, Maintenance log):**
  - Table backgrounds and rows alternate between white (`#FFFFFF`) and very faint `#F1F3F6`.
  - Header rows lack distinctive contrast from table body rows.
- **Modals & Forms (`AssetForm`, `MaintenanceForm`, `BreakdownForm`, `ReportIncidentModal`):**
  - Plain white modal containers with white inputs and light grey borders.

---

## 2. Design Tokens, Logo Assets & Hardcoded Styling Audit

### 2.1 Where Design Tokens Currently Live
1. **`apps/web/styles/tokens.css`**: Defines CSS variables (`--color-bg-page: #F7F8FA`, `--color-bg-panel: #FFFFFF`, `--color-accent: #1D5FA7`, status tokens).
2. **`apps/web/tailwind.config.js`**: Extends Tailwind colors mapping `page`, `panel`, `subtle`, `border`, `text`, `accent`, and `status`.
3. **`apps/web/lib/tokens.ts`**: TypeScript export of constants matching `tokens.css`.
4. **`apps/web/app/globals.css`**: Global typography scales and utility classes.

### 2.2 Logo Asset Audit
- **Current State:** There is **no SVG or image logo asset** in the codebase.
- The top bar in `RoleWorkspaceNav.tsx` renders plain text:
  ```tsx
  <Link href={homeHref} className="text-base font-semibold text-text-primary tracking-tight hover:text-accent shrink-0">
      AssetIQ
  </Link>
  ```
- **Target Design:** A 28px logo mark showing three ascending bars in a rounded square (`#15314B` background, `#FFFFFF` and `#8CC1F0` bars) for the top bar/sidebar, and a large low-contrast version (`#1D4062`) for the login page background.

### 2.3 Hardcoded Colors & Typography Audit
- **`apps/web/components/assets/QrLabelCard.tsx`**: Contains canvas fill styles (`#FFFFFF`, `#C4CAD3`, `#1D5FA7`, `#1B2430`, `#4B5563`, `#6B7280`) for generating downloadable PNG labels and `@media print` styles. Must be updated to use design tokens.
- **`apps/web/app/(dashboard)/assets/page.tsx`**: Batch print stylesheet contains print hex rules.
- **`apps/web/lib/reports/pdf-generator.js`**: Hardcoded RGB values for jsPDF rendering (`setFillColor(241, 243, 246)`, `setDrawColor(221, 225, 231)`, `setTextColor(27, 36, 48)`). Must be updated with a deep-blue header rule (`#15314B`), wordmark, and clean white page formatting.
- **Fonts:** Only `Inter` is currently loaded via `next/font/google` in `apps/web/app/layout.tsx`. `Source Serif 4` is not yet loaded.

---

## 3. Baseline Before Screenshots

Before screenshots have been captured at 1280x900 resolution and stored in the artifact directory:

| Page | Route | Captured File |
| :--- | :--- | :--- |
| **Login Page** | `/login` | `file:///Users/madhava/.gemini/antigravity-ide/brain/3c4939c1-bbad-476d-baa8-8f77fd474286/screenshots/before_login.png` |
| **Hospital Admin Landing** | `/overview` | `file:///Users/madhava/.gemini/antigravity-ide/brain/3c4939c1-bbad-476d-baa8-8f77fd474286/screenshots/before_overview.png` |
| **OT Admin Landing** | `/surgeries` | `file:///Users/madhava/.gemini/antigravity-ide/brain/3c4939c1-bbad-476d-baa8-8f77fd474286/screenshots/before_surgeries.png` |
| **Biomedical Engineer Landing** | `/engineer-dashboard` | `file:///Users/madhava/.gemini/antigravity-ide/brain/3c4939c1-bbad-476d-baa8-8f77fd474286/screenshots/before_engineer_dashboard.png` |

---

## 4. Architectural Transformation Plan

1. **Tokens & Theme Overhaul:**
   - Update `styles/tokens.css`, `tailwind.config.js`, and `lib/tokens.ts` with the new slate-blue frame (`#15314B`), cool blue-grey page background (`#E6ECF2`), page header band (`#DCE6F0`), panel header band (`#F0F4F8`), panel background (`#FFFFFF`), borders (`#C9D4DF` / `#AEBBC9`), and interaction accent (`#1F66C2` / `#18539F`).
   - Retain all existing status colors (`#1E7B4B`, `#8A5300`, `#B42318`, `#4B5563`).
2. **Typography Setup:**
   - Load **Source Serif 4** (weight 600, `variable: '--font-source-serif'`) alongside **Inter** in `apps/web/app/layout.tsx` using `next/font/google` (zero layout shift, self-hosted at build time).
   - Apply serif font exclusively to page titles (`28px`) and large summary KPI numbers (`36px`). Keep Inter for all body text, tables, buttons, forms, and navigation.
3. **Deep Frame Navigation (`RoleWorkspaceNav.tsx` & Chrome):**
   - Implement deep slate-blue frame (`#15314B`) top bar with new logo mark (28px white and light blue three ascending bars in a rounded square), clear user identity initials circle, role label, and sign out button.
   - Implement navigation tabs with selected marker and background (`#25507A`, left/bottom indicator `#8CC1F0`).
4. **Page Header Band & Panels:**
   - Add the `#DCE6F0` header band to all dashboard and catalog pages.
   - Style all content panels with `#FFFFFF` background, `#C9D4DF` border, `6px` radius, **no shadow**, and `#F0F4F8` panel header strip.
5. **Status-Tinted Situation Banner:**
   - Update `TodaySituationBanner` to dynamically apply a 4px left border and background tint based on worst status (`#1E7B4B`, `#8A5300`, or `#B42318`).
6. **Hospital Analytics KPI Summary Tiles:**
   - Style KPI cards with 36px Source Serif 4 numbers, 3px colored top border (status color or accent), and clean white panel background.
7. **Tables, Forms & Empty States:**
   - Tinted table headers (`#E4EBF2`), striped rows (`#F7F9FB`), hover rows (`#EAF1F8`).
   - Inputs with `#AEBBC9` border and `#1F66C2` focus ring.
8. **Login Page Refresh:**
   - Two-part layout: Left panel (45%) deep slate-blue (`#15314B`) with logo mark, title, tagline, and tone-on-tone background artwork (`#1D4062`). Right panel with clean white sign-in card on `#E6ECF2`.
9. **Contrast Ratio Auditing & Verification:**
   - Compute contrast ratios mathematically for all text/background pairs to ensure WCAG AA compliance (4.5:1 for normal text, 3:1 for large text/icons/borders).

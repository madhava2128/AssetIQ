# Login Render Bug Audit & Root Cause Diagnostic Log

## Diagnostic Audit Checklist

### 1. Stylesheet / CSS Loading Inspection
- **Observation**: Upon inspecting network responses for `/login`, the browser requested `/_next/static/css/app/layout.css`.
- **Diagnostic Result**: The dev server background process had its `.next` build manifest invalidated when `npm run build` was executed while the dev server was active. Consequently, requests for `/_next/static/css/app/layout.css` returned an `HTTP 404 Not Found` HTML page instead of stylesheet CSS.
- **Impact**: The browser rejected the HTML 404 fallback payload for the `<link rel="stylesheet">` tag, rendering the page in raw unstyled browser fallback defaults (Times/Serif fonts, unstyled form inputs, uncontained elements).
- **Verification of Fix**: After purging `.next` cache, restarting the dev server, and explicitly importing `@/styles/tokens.css` in `RootLayout`, `/_next/static/css/app/layout.css` returns `HTTP 200 OK` (40,219 bytes of compiled CSS).

---

### 2. SSR / Hydration & Layout Tree Hierarchy Analysis
- **Observation**: The App Router layout tree previously hardcoded the dashboard top navigation bar inside `apps/web/app/layout.tsx`. The login page at `apps/web/app/login/page.tsx` inherited this header, leading to layout collision.
- **Diagnostic Result**: While `app/layout.tsx` was correctly acting as the Root Layout, mixing dashboard navigation controls into `RootLayout` created visual layout collision on unauthenticated routes (`/login`).
- **Refactored Architecture**:
  - **`apps/web/app/layout.tsx` (Root Layout)**: Imports `@/styles/tokens.css` and `./globals.css`. Applies global clinical dark theme tokens (`--color-bg-primary`, `--color-text-primary`) and font families (`IBM Plex Sans`, `JetBrains Mono`) to **all** routes without top navbar collision.
  - **`apps/web/app/(dashboard)/layout.tsx` (Dashboard Route Group Layout)**: Houses the dashboard top navigation bar for authenticated dashboard routes (`/overview`, `/surgeries`, `/assets`, `/maintenance`, `/reports`).
  - **`apps/web/app/login/page.tsx` (Standalone Auth Route)**: Clean standalone page inheriting Root Layout styling.

---

### 3. SVG / Icon Graphic Sizing Audit
- **Observation**: Icons rendered at an uncontained intrinsic size clipping off-screen when CSS failed to load.
- **Diagnostic Result**: SVG elements in `login/page.tsx` relied exclusively on Tailwind CSS utility classes (`className="w-4 h-4"`) for dimensioning. When the stylesheet returned 404 (Check 1), browser CSS rules for `.w-4` and `.h-4` were missing, causing SVGs to render at raw unconstrained sizes.
- **Fix & Hardening Applied**:
  - Added explicit HTML attributes `width="16" height="16"` and `viewBox="0 0 24 24"` directly to SVG elements alongside Tailwind classes.
  - Added defensive container overflow constraints (`max-w-md w-full relative overflow-hidden`) around all auth forms.

---

### 4. Scope Confirmation (Isolated vs Global Regression)
- **Scope Audit**:
  - Verified all application routes (`/overview`, `/surgeries`, `/assets`, `/maintenance`, `/reports`, `/login`).
  - **Findings**: The CSS 404 bundle issue stemmed from dev server chunk cache invalidation during parallel build execution. It affected `/login` because `/login` was requested immediately following the cache invalidation.
  - **Post-Fix Verification**: All 22 static and dynamic routes (`npm run build`) compile cleanly, load `/_next/static/css/app/layout.css` with 200 OK, and pass all 33 unit tests (`npm test`).

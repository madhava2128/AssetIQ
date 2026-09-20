# AssetIQ — Blank White Screen Diagnostic Audit

## 1. Audit Findings (Step-by-Step Diagnostic Inspection)

### 1.1 Server Logs & Browser Console Analysis
- **Root Cause Identified**: When `npm run build` executed while `next dev` was active, Next.js chunk manifests in `apps/web/.next` were corrupted, triggering `MODULE_NOT_FOUND` errors on page routes and 404 failures on static JavaScript chunks (`/_next/static/chunks/fallback/...`).
- **Render Crash Symptom**: When Next.js encounters an uncaught render error or missing chunk without a React Error Boundary at the root layout level, React unmounts the tree completely, presenting a blank white screen to the browser.

### 1.2 Leftover Context Reference Check
- **Search Query**: `RoleContext`, `AuthContext`, `UserRoleProvider`, `useContext`, `useRole`.
- **Result**: 0 remaining references found across `apps/web/app`, `apps/web/components`, and `apps/web/lib`. The context removal refactor left no dangling Context imports or hook calls.

### 1.3 Error Boundary Audit
- **Findings**: The App Router layout tree (`apps/web/app/layout.tsx` and `apps/web/app/(dashboard)/layout.tsx`) lacked both `global-error.tsx` and `error.tsx`.
- **Consequence**: Any uncaught JavaScript runtime or render error caused React to fail silently and unmount without displaying a diagnostic error UI.

### 1.4 Redirect Loop Inspection
- **Root Route (`/`)**: Unconditionally redirects to `/login`.
- **Login Route (`/login`)**: Terminal view; renders login card without redirection. Upon authentication, routes to `landingUrl` (`/overview`, `/surgeries`, or `/assets`). No looping or circular redirects detected.

### 1.5 SSR Hydration Inspection
- All window/localStorage state accesses are properly encapsulated inside client-side `useEffect` hooks or safe `typeof window !== 'undefined'` checks.

---

## 2. Remediation Plan
1. **Implement Root & Dashboard Error Boundaries**:
   - Create `apps/web/app/global-error.tsx`, `apps/web/app/error.tsx`, and `apps/web/app/(dashboard)/error.tsx`.
   - Render a stylized, dark-themed OR monitor diagnostic card showing error details, component stack trace, and an interactive "Reset Application State / Retry" button.
2. **Verify Server Cache Cleanup**:
   - Ensure clean `.next` cache directory build state.
3. **Verify End-to-End Navigation & Error Recovery**:
   - Test landing routes across all 3 roles (`/overview`, `/surgeries`, `/assets`) and verify error boundary catches intentional runtime errors cleanly.

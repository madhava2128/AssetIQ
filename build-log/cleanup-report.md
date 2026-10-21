# AssetIQ — Final Cleanup Before Android Packaging Report

**Date**: 2026-10-21T12:18:00+05:30  
**Git Branch**: `cleanup/pre-android`  
**Safety Tag**: `pre-cleanup` (at commit `a75cd4b`)  

---

## 1. Actions Required from the Owner

1. **Set `NEXT_PUBLIC_APP_URL` in Vercel Production Environment**:
   - Confirm `NEXT_PUBLIC_APP_URL` is set to `https://assetiq-omega.vercel.app` in Vercel Project Settings -> Environment Variables (Production).
   - Because `NEXT_PUBLIC_` variables are compiled into static frontend assets at build time, trigger a new production deployment after setting or modifying it.
2. **Review Default Demo Passwords for Production Rotation**:
   - The test credentials in `apps/web/app/api/auth/login/route.ts` (`AdminPass2026!`, `OtPass2026!`, `BiomedPass2026!`) are designed for demo and verification purposes. When transitioning to a live hospital production environment with real Supabase Auth accounts, ensure these fallback demo accounts are replaced with database-backed password hashing or OAuth/SAML provider authentication.
3. **Android Packaging Wrapper Prerequisites (when ready to convert)**:
   - For an Android wrapper (Capacitor or TWA), provide an official web app manifest (`manifest.json` / `manifest.webmanifest`) and standard PWA icons (192x192 px and 512x512 px) in `apps/web/public/`.
   - Set `<meta name="theme-color" content="#15314B">` in the root layout to match the AssetIQ navy frame color.

---

## 2. Table of Everything Deleted

| Path | Category | Evidence of Non-Usage / Proof |
|---|---|---|
| `apps/web/tsconfig.tsbuildinfo` | 1. Junk & build cache | TypeScript incremental compilation cache. Fully regenerable by `tsc`. Added `*.tsbuildinfo` to `.gitignore`. |
| `.pytest_cache/` (root) | 1. Junk & build cache | Root pytest cache folder. Added `.pytest_cache/` to `.gitignore`. |
| `services/ml/.pytest_cache/` | 1. Junk & build cache | Python pytest cache. Added `.pytest_cache/` to `.gitignore`. |
| `services/ml/**/__pycache__/` | 1. Junk & build cache | Compiled Python bytecode. Fully regenerable. Covered by `.gitignore`. |
| `components/dashboard/EquipmentRiskChart.tsx` | 2. Dead code | Stale, dark-theme component left in root `components/` from before monorepo migration. Zero imports across the entire repository. The active component lives at `apps/web/components/dashboard/EquipmentRiskChart.tsx`. |
| `components/dashboard/` & `components/` (root) | 6. Empty folders | Empty root folders remaining after deleting the root `EquipmentRiskChart.tsx`. |
| `apps/web/components/dashboard/ControlRoomSafetyBanner.tsx` | 2. Dead code | Legacy banner replaced during UI overhaul by `TodaySituationBanner.tsx`. Zero imports across repo; verified by `git grep` and `knip`. |
| `apps/web/components/dashboard/ReadinessDistributionChart.tsx` | 2. Dead code | Replaced during dashboard overhaul by telemetry distribution charts. Zero imports across repo. |
| `apps/web/components/dashboard/RoleSelector.tsx` | 2. Dead code | Decommissioned stub component that returned `null`. Replaced by server-driven authentication. Zero imports across repo. |
| `apps/web/components/dashboard/SurgeryOverviewCards.tsx` | 2. Dead code | Replaced by `TodaySituationBanner.tsx` and unified KPI metrics. Zero imports across repo. |
| `apps/web/components/ui/ThemeToggle.tsx` | 2. Dead code | Decommissioned stub component that returned `null`. App standardized on single, clean light theme. Zero imports across repo. |
| `apps/web/components/ui/UserAuthNav.tsx` | 2. Dead code | Replaced by unified header in `apps/web/components/ui/RoleWorkspaceNav.tsx`. Zero imports across repo. |
| `puppeteer` (`devDependencies`) | 3. Unused dependency | Leftover dependency from earlier screenshot sessions. Not imported by any source file, test, or build script. Cleanly uninstalled via `npm rm puppeteer`. |

---

## 3. Review (Kept) Table

| Path / Item | Suspect Reason | Reason Kept (Safety Proof) |
|---|---|---|
| `apps/web/app/qr/[assetTag]/route.ts` | Stale legacy route suspect | **Kept.** Acts as backward-compatible redirect for any previously printed labels using asset tags, safely redirecting them to `/assets/{assetId}`. |
| `apps/web/lib/auth.js` | Duplicate of `auth.ts` | **Kept.** Required by Jest unit tests (`tests/unit/stage7_dashboard.test.js`) and CommonJS test scripts that run in Node.js without TypeScript preprocessing. |
| `apps/web/lib/supabase/mock-db.js` | Duplicate of `mock-db.ts` | **Kept.** Core in-memory/fallback database adapter imported by Jest tests and `mock-db.ts`. Connected to `globalThis` stores. |
| `apps/web/lib/rules-engine/engine.js` | Duplicate of `engine.ts` | **Kept.** Imported by CommonJS unit tests (`tests/unit/stage4_rules_engine.test.js`). |
| `apps/web/lib/rules-engine/types.ts` | Flagged as unused by Knip | **Kept.** Defines core TypeScript interfaces (`SurgeryReadinessAssessment`, etc.) imported by `apps/web/lib/rules-engine/engine.ts`. |
| `apps/web/lib/explanation/generator.js` & `validator.js` | Flagged by Knip | **Kept.** Required by Stage 6 explanation tests (`tests/unit/stage6_explanation.test.js`) and API route handlers. |
| `apps/web/lib/reports/pdf-generator.js` | Flagged by Knip | **Kept.** Required by Stage 8 alerts/reports tests (`tests/unit/stage8_alerts_reports.test.js`). |
| `apps/web/lib/scanner/index.ts` | Flagged unused exports by Knip | **Kept.** Explicitly protected by Section 2. Contains URL normalization and scanner interface readiness for future Android Capacitor barcode scanner. |
| `apps/web/components/forms/MaintenanceForm.tsx` | Unused exported types | **Kept.** Active form component used in production maintenance workflows. |
| `supabase/seed/test_stage1.js` | Test script in seed directory | **Kept.** Explicitly protected by Section 2 (`supabase/seed/` is protected). |
| `services/ml/requirements.txt` | Dependency analysis | **Kept.** All 10 dependencies are actively imported by `src/main.py`, feature engineering, training, inference, or pytest. |

---

## 4. Dependencies, Project Size, and File Count Comparison

### A. Dependencies
- **npm Dependencies Removed**: `puppeteer` (^25.11.0) and its 22 transitive dependencies.
- **Python Dependencies Removed**: 0 (all 10 requirements actively in use).

### B. Size & File Count
| Metric | Baseline | Post-Cleanup | Net Change |
|---|---:|---:|---:|
| Project Size (excluding `node_modules`, `.next`, `.git`) | `2.7 MB` | `2.7 MB` | Cleaned caches and stale components |
| Total Tracked Files (excluding dependencies & git) | `243` | `231` | **-12 files** |
| Web `node_modules` Package Count | `722` | `700` | **-22 packages** |

---

## 5. Section 5 Pre-Packaging Findings

1. **Committed Secrets Audit**:
   - **Status**: PASSED. No API keys, secret keys, service-role keys, or private JWT tokens are committed to tracked files.
   - **`NEXT_PUBLIC_` Inspection**: Only `NEXT_PUBLIC_APP_URL` exists in code, containing solely the public base address `https://assetiq-omega.vercel.app`. Placeholders in `.env.example` contain non-functional templates (`your-anon-key`).
   - **Demo Passwords**: Demo passwords in `api/auth/login/route.ts` are documented in Section 1 for owner rotation upon real EHR/auth integration.
2. **Hardcoded Addresses Audit**:
   - Zero hardcoded production domains exist in code.
   - `apps/web/lib/scanner/index.ts` strictly validates against `localhost`, `127.0.0.1`, and private IP addresses, requiring valid HTTPS.
   - Fallbacks to `localhost:5432` and `localhost:8000` exist solely as environment defaults for local PostgreSQL and local ML development (`DATABASE_URL`, `ML_SERVICE_URL`).
3. **Server-Only Features & Android Conversion Guidance**:
   - **Server Dependencies**:
     - Dynamic server-rendered routes: `/assets/[id]`, `/qr/[assetTag]`, `/surgeries/[id]`.
     - 15 server-side API Route Handlers under `/api/*` performing PostgreSQL connection pooling (`pg`), ACID transactions, and ML microservice proxying.
     - Authentication session cookies (`assetiq_auth_token`, `assetiq_user_role`).
   - **Android Packaging Conclusion**:
     - A static export (`output: 'export'`) is incompatible with server database connection pooling and dynamic route rendering without re-architecting the entire backend.
     - The recommended approach for Android conversion is a modern Android Web wrapper (Capacitor / Trusted Web Activity / custom WebView) that loads the deployed production website (`https://assetiq-omega.vercel.app`).
4. **Web App Basics for Mobile Wrapper**:
   - Viewport: Responsive down to 360px with touch targets >= 44px. No hover-only interactions.
   - Missing for PWA/Android wrapper: Web app manifest (`manifest.json`) and 192px/512px app launcher icons.

---

## 6. Verification Results

| Verification Check | Baseline | Post-Cleanup | Status |
|---|---|---|---|
| Fresh `npm ci` from lockfile | Passed (722 pkgs) | Passed (700 pkgs) | PASS |
| `tsc --noEmit` (TypeScript Typecheck) | 0 errors | 0 errors | PASS |
| Next.js ESLint Check (`next build`) | 0 errors / warnings | 0 errors / warnings | PASS |
| Production Build (`next build`) | 25 pages generated | 25 pages generated (identical route list) | PASS |
| Jest Unit Tests (`npm test`) | 8 suites, 33/33 passed | 8 suites, 33/33 passed | PASS |
| Surgery Flow & Permission Safeguards (`verify:surgery-flow`) | 22/22 passed | 22/22 passed | PASS |
| E2E Verification Script (`verify-self-check.js`) | 5/5 passed | 5/5 passed | PASS |
| Python ML Service Pytest (`services/ml/tests`) | 5/5 passed | 5/5 passed | PASS |
| Database Seed Idempotency (`seed.sql`) | Idempotent | Idempotent | PASS |
| Production Server Startup (`next start`) | Ready in 235ms | Ready in 235ms | PASS |
| Multi-Role Production Route Traversal | All routes 200/307 | All routes 200/307 | PASS |

---

## 7. How to Restore Anything

If any deletion needs to be reverted:
1. **Safety Tag (Full Initial State)**:
   ```bash
   git checkout pre-cleanup
   ```
2. **Category Commits**:
   - Category 1 (Junk & Build Caches): commit `61ede44`
   - Category 2 (Dead Code Components): commit `13d1b5d`
   - Category 3 (Unused Dependencies): commit `3a2fcef`
   - Category 4-7 (Housekeeping & Documentation): current HEAD on `cleanup/pre-android`

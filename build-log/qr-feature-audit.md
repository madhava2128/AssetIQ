# AssetIQ — QR-Based Asset Tracking & Incident Reporting Feature Audit

**Date:** October 20, 2026  
**Auditor:** Antigravity Autonomous Agent  
**Goal:** Complete technical audit of existing asset routes, database schema, incident reporting flows, authentication redirects, and configuration before implementing QR code asset tracking and incident reporting.

---

## 1. Existing Asset Detail Page & Route Audit

### Routes & Page Structure
- **Asset Catalog Route:** `/assets` (`apps/web/app/(dashboard)/assets/page.tsx`).
  - Displays a tabular list of medical equipment with status, category, room, maintenance status, next PM due date, and actions ("Maintenance", "Edit").
  - Assets in the table are currently plain text rows with an edit modal (`AssetForm`); there is no standalone asset detail page or link to an individual asset.
- **Asset Detail Route (`/assets/[id]`):**
  - Currently does **not exist** as a web page route.
  - An API route exists at `/api/assets/[id]` (`apps/web/app/api/assets/[id]/route.ts`) providing `GET` (returns asset details along with `maintenance_history` and `breakdown_history`), `PATCH` (updates asset details), and `DELETE` (deletes asset).
- **Asset Identification:**
  - **Database ID (`id`):** UUID format (e.g., `a0000000-0000-0000-0000-000000000001` or generated `crypto.randomUUID()` / v4 UUID). This is immutable and permanent.
  - **Asset Tag (`asset_tag`):** Human-readable unique identifier string (e.g., `AST-CARM-002`, `AST-ANES-001`, `AST-VENT-001`). This is visible to hospital staff on labels and equipment tags.
- **Pre-existing QR Routes:**
  - An empty directory was found at `apps/web/app/qr/[assetTag]` containing only a placeholder `.gitkeep` file with the text `# QR Asset Access Routes`.
  - No active QR code generation or resolution logic exists in this route or elsewhere in the project.
  - We will implement a redirect from `/qr/[assetTag]` to the canonical `/assets/{assetId}` route by looking up the asset by tag.

---

## 2. Dependency Status: `qrcode.react`

- **Root `package.json`:** Not installed.
- **`apps/web/package.json`:** Not installed.
- **Action:** Install `qrcode.react` in `apps/web`. Use only its `QRCodeSVG` export for vector SVG rendering, high-resolution canvas PNG generation for label downloads, and pure CSS print layout styling. No other scanning or QR dependencies will be installed.

---

## 3. Breakdown / Incident Form & Write Logic Audit

### Component & Endpoint
- **Existing Component:** `apps/web/components/forms/BreakdownForm.tsx`.
- **Existing API Route:** `POST /api/assets/breakdowns` (`apps/web/app/api/assets/breakdowns/route.ts`).
- **Data Layer Function:** `createBreakdownIncident(data)` in `apps/web/lib/supabase/mock-db.js`.

### Fields & Validation
- **`asset_id` (UUID, required):** Must match an existing asset in `assetsStore` / `assets` table. Throws `Referenced asset does not exist` if invalid.
- **`severity` (ENUM/TEXT, required):** Allowed values are `CRITICAL` ("Immediate stop"), `HIGH` ("Major malfunction"), `MEDIUM` ("Partial failure"), `LOW` ("Minor glitch"). Default is `MEDIUM`.
- **`failure_type` (ENUM/TEXT, required):** Allowed values are `MECHANICAL`, `ELECTRICAL`, `SOFTWARE`, `CALIBRATION`, `USER_ERROR`, `OTHER`.
- **`description` (TEXT, required in form):** Problem description text.
- **`reported_at` (TIMESTAMPTZ, automatic):** Generated on the server using `new Date().toISOString()`.
- **`reported_by` (TEXT, see Section 4):** Captured from authenticated session user.
- **Role Permission Check:**
  - `verifyRolePermission(authHeader, ['biomedical_engineer', 'hospital_admin'])`.
  - Roles `biomedical_engineer` and `hospital_admin` are allowed to log breakdowns.
  - Role `ot_admin` is **not permitted** to write breakdown incidents (returns 403 Forbidden).

### Effect on Asset Status
- In `createBreakdownIncident`:
  ```javascript
  const assetIndex = assetsStore.findIndex(a => a.id === data.asset_id);
  if (assetIndex !== -1) assetsStore[assetIndex].status = 'UNDER_REPAIR';
  ```
  The asset's status is immediately updated to `UNDER_REPAIR`.
- In `updateAsset`:
  An asset cannot be set back to `AVAILABLE` while any unresolved breakdown incident exists (`resolved_at === null`).
- **Reuse Guarantee:** The new QR asset page incident reporting flow will call `POST /api/assets/breakdowns` directly with the exact same payload structure, preserving all existing validation, timestamping, and asset status updates.

---

## 4. Schema Audit: `breakdown_incidents` Columns

### Existing Schema (`supabase/migrations/20260918000003_create_history_and_assessment_tables.sql`)
```sql
CREATE TABLE IF NOT EXISTS breakdown_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    reported_at TIMESTAMPTZ NOT NULL,
    resolved_at TIMESTAMPTZ,
    severity TEXT NOT NULL,
    failure_type TEXT,
    description TEXT NOT NULL,
    resolution_notes TEXT,
    downtime_hours NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Findings
- **`description` column:** **Already exists** as `description TEXT NOT NULL`.
- **`reported_by` column:** **Missing** from existing migrations and mock-db schema.
- **Action Required:**
  1. Add a **new migration** `supabase/migrations/20261020000001_add_reported_by_to_breakdown_incidents.sql` containing:
     ```sql
     ALTER TABLE breakdown_incidents ADD COLUMN IF NOT EXISTS reported_by TEXT;
     ```
  2. Update `apps/web/lib/supabase/mock-db.js` `createBreakdownIncident` to store `reported_by: data.reported_by || null`.
  3. Update `apps/web/app/api/assets/breakdowns/route.ts` to pass `reported_by` from the authenticated session user.

---

## 5. Login Redirects & Return-to-Page Flow

### Current Implementation
- Handled in `apps/web/app/login/page.tsx`:
  - After successful POST to `/api/auth/login`, it routes to `data.landingUrl || '/overview'` using `router.push(...)`.
- `apps/web/app/api/auth/login/route.ts` computes `landingUrl` using `getLandingUrlForRole(role)`:
  - `hospital_admin` -> `/overview`
  - `ot_admin` -> `/surgeries`
  - `biomedical_engineer` -> `/assets`

### Proposed Return-to-Page (`next`) Implementation
- Support a `next` query parameter on `/login` (e.g. `/login?next=/assets/a0000000-0000-0000-0000-000000000001`).
- **Open Redirect Protection:** Strict validation function:
  ```typescript
  function getSafeNextPath(nextParam: string | null): string | null {
      if (!nextParam) return null;
      // Must start with exactly one '/' and not '//' or 'http' or '\\'
      if (/^\/[^/\\]/.test(nextParam) && !nextParam.includes('://')) {
          return nextParam;
      }
      return null;
  }
  ```
- If a safe `next` path exists, `router.push(safeNext)` is invoked instead of `data.landingUrl`.
- If an unauthenticated user opens `/assets/{assetId}`, the page detects lack of credentials and redirects to `/login?next=/assets/${assetId}`.

---

## 6. Public Base URL Configuration

### Current State
- `apps/web/.env.example` and root `.env.example` currently define Supabase, ML, and LLM endpoints, but have no public app address variable.
- Hardcoded URLs must be avoided to ensure links function properly when scanned from mobile phone cameras and when packaged for Android.

### Proposed Configuration
- Define `NEXT_PUBLIC_APP_URL` in both `.env.example` and `apps/web/.env.example`:
  ```bash
  # Public App Base URL for QR Codes (e.g., https://assetiq.hospital.org or http://192.168.1.50:3000)
  NEXT_PUBLIC_APP_URL=http://localhost:3000
  ```
- QR label generator reads `process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')`.
- If `NEXT_PUBLIC_APP_URL` is unset or resolves to `localhost` / `127.0.0.1`, display a prominent warning banner on the QR label panel:
  > *"QR codes will not work on other devices until the public app address is set."*

---

## 7. Audit Conclusion & Implementation Plan
1. **Database:** Add migration for `reported_by` column on `breakdown_incidents`; update `mock-db.js`.
2. **Dependencies:** Install `qrcode.react` in `apps/web`.
3. **Scanner Layer:** Build `lib/scanner/index.ts` with `parseAssetQrPayload` and `ScannerService`.
4. **Login Redirect:** Add safe `next` parameter support to `apps/web/app/login/page.tsx`.
5. **Asset Detail Page (`/assets/[id]`):** Implement phone-friendly health summary, history, incident reporting form, and QR label download/print section.
6. **QR Redirect Route (`/qr/[assetTag]`):** Redirect old asset tag URLs to `/assets/{assetId}`.
7. **Equipment List ("Print Labels"):** Add batch QR label printing for asset managers on `/assets`.
8. **Self-Verification:** Verify with two distinct assets, throwaway decoder script, auth redirection, editing immutability, role permissions, and mobile 360px layout.

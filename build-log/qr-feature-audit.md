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

## 6. Public Production Base URL Configuration

### Configuration & Normalization
- **Confirmed Production Domain:** `https://assetiq-omega.vercel.app/` (normalized to `https://assetiq-omega.vercel.app`).
- **Single Source of Truth:** `getAppBaseUrl()` in `apps/web/lib/scanner/index.ts` reads `process.env.NEXT_PUBLIC_APP_URL`, trims whitespace, and strips trailing slashes. No fallback to `localhost`, preview domains, or window origin is permitted for QR payloads.
- **Strict Validation Rules (`isAppBaseUrlValid`):**
  - Must be present and non-empty.
  - Must not be a placeholder (e.g. `YOUR-VERCEL-DOMAIN`).
  - Must use the `https://` protocol scheme.
  - Must not be `localhost`, loopback (`127.0.0.1`, `0.0.0.0`, `::1`), link-local, or RFC 1918 private IPv4 addresses (`10.*`, `192.168.*`, `172.16-31.*`).
  - Must contain at least a valid hostname with a dot.
- **Invalid Address Warning State (Section 2 Requirement):**
  - If the public app address is missing or invalid:
    - Display plain warning banner: *"QR codes cannot be used yet. The public app address is not set up correctly."*
    - Disable the **Download label** button (`disabled`, opacity reduced, cursor not allowed).
    - Disable the **Print label** button (`disabled`).
    - Suppress QR code rendering, replacing the code with a disabled placeholder. (This prevents anyone from printing non-functional physical stickers.)
- **On-Screen Information:**
  - Displays `"Opens: {full address}"` font-mono string beneath the QR code on screen only (omitted from print sticker).
  - If viewing origin differs from the configured QR destination, displays: *"You are viewing the app from a different address than the one used in QR codes."*
- **Documentation in `.env.example`:**
  - Documented in both root `.env.example` and `apps/web/.env.example` with clear comments: must be the permanent production address, set in Vercel's Production environment variables, and requires a redeployment after changing because `NEXT_PUBLIC_` variables are compiled into static assets.

---

## 7. Audit Conclusion & Implementation Plan
1. **Database:** Verified schema; confirmed `reported_by` column present on `breakdown_incidents`; confirmed mock-db and PostgreSQL synchronization.
2. **Dependencies:** Confirmed `qrcode.react` is the only added runtime dependency; vector `QRCodeSVG` used with medium error correction (`level="M"`).
3. **Scanner Layer:** Created `apps/web/lib/scanner/index.ts` with `getAppBaseUrl()`, `isAppBaseUrlValid()`, `getSafeNextPath()`, `isValidAssetId()`, `parseAssetQrPayload()`, and `ScannerService`.
4. **Login Redirect:** Added safe relative `next` parameter support to `apps/web/app/login/page.tsx` with open-redirect rejection.
5. **Asset Detail Page (`/assets/[id]`):** Implemented phone-friendly header, health summary, location & specifications, quick actions, maintenance history, incident history, and QR label download/print section. Configured `force-dynamic` rendering.
6. **Registration Flow:** Updated `handleCreateOrUpdate` on `/assets` to automatically redirect newly registered equipment to `/assets/${id}?registered=true` showing the success banner and top QR label.
7. **Equipment List Batch Printing:** Added A4 sheet sticker grid printing on `/assets` for authorized equipment managers.
8. **Throwaway Verification:** Verified end-to-end with two distinct assets, throwaway `jsQR` decoder, editing immutability, role matrix checks, and 360px mobile usability.

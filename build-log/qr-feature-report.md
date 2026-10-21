# AssetIQ — QR-Based Asset Tracking, Incident Reporting & Health Check Feature Report

**Date:** October 20, 2026  
**Status:** Completed & Self-Verified  
**Dependencies Added:** `qrcode.react` (`^4.2.0`) in `apps/web` (No other dependencies; zero paid services)

---

## 1. Executive Summary

A free, open-source QR-based asset tracking, real-time health check, and mobile incident reporting system has been implemented across AssetIQ.

Every medical asset receives a unique QR code encoding strictly `{BASE_URL}/assets/{assetId}`, referencing its immutable database primary key. When scanned with any standard phone camera or QR reader, the code directs authenticated hospital personnel to the mobile-optimized asset overview page. The page fetches real-time telemetry, readiness assessments, service contracts, maintenance history, and breakdown history without stale caching.

Authorized clinical engineers and hospital administrators can immediately log breakdown incidents directly linked to the equipment, automatically transitioning asset state to `UNDER_REPAIR` and updating operational readiness across the hospital.

Existing Row-Level Security (RLS) policies, role permissions, readiness rules, and ML/LLM scoring logic remain strictly intact.

---

## 2. Architecture & Components Built

### 2.1 Audit & Discovery
As documented in [`/build-log/qr-feature-audit.md`](file:///Users/madhava/Desktop/AssetIQ/build-log/qr-feature-audit.md):
- Assets use an immutable UUID/base36 identifier (`id`) and a human-readable tag (`asset_tag`).
- Legacy placeholder route at `/qr/[assetTag]` was identified and redirected via HTTP 307 to the canonical `/assets/{assetId}` route.
- The existing breakdown submission logic (`POST /api/assets/breakdowns` and `createBreakdownIncident`) was audited and reused.
- Schema audit revealed that `breakdown_incidents` already contained `description`, but lacked `reported_by`. A non-destructive migration was created.

### 2.2 Schema & Database Migrations
- **Migration:** [`supabase/migrations/20261020000001_add_reported_by_to_breakdown_incidents.sql`](file:///Users/madhava/Desktop/AssetIQ/supabase/migrations/20261020000001_add_reported_by_to_breakdown_incidents.sql)
  - Adds nullable `reported_by TEXT` column to `breakdown_incidents`.
- **Data Layer:** Updated [`apps/web/lib/supabase/mock-db.js`](file:///Users/madhava/Desktop/AssetIQ/apps/web/lib/supabase/mock-db.js) to persist `reported_by` in memory and populate mock incidents.
- **Breakdown API:** Updated [`apps/web/app/api/assets/breakdowns/route.ts`](file:///Users/madhava/Desktop/AssetIQ/apps/web/app/api/assets/breakdowns/route.ts) to capture `reported_by` from the authenticated user token/session.

### 2.3 QR Code Generation & Label Printing
- **Component:** [`apps/web/components/assets/QrLabelCard.tsx`](file:///Users/madhava/Desktop/AssetIQ/apps/web/components/assets/QrLabelCard.tsx)
  - Renders vector SVG via `QRCodeSVG` from `qrcode.react` with Level M (Medium) error correction.
  - Generates URL solely as `{BASE_URL}/assets/{assetId}` with no tokens, credentials, or sensitive metadata.
  - Detects missing or localhost base URLs and displays a clear advisory banner:
    > *"QR codes will not work on other devices until the public app address is set."*
  - **Download Label:** Renders a high-resolution 300 DPI canvas combining the QR code, bold asset name, asset tag, and AssetIQ branding into a downloadable PNG (`{asset_tag}-qr-label.png`).
  - **Print Label:** Triggers `@media print` layout styled precisely to 50 mm x 50 mm in black and white with clean text wrapping, hiding all browser headers, navbars, and buttons during print.
- **Batch Print Sheet:** Added to [`apps/web/app/(dashboard)/assets/page.tsx`](file:///Users/madhava/Desktop/AssetIQ/apps/web/app/(dashboard)/assets/page.tsx)
  - Allows selecting multiple assets via checkboxes and clicking **"Print Labels ({count})"** to print a multi-label grid on standard A4 paper.
  - Visible only to roles that manage assets (`biomedical_engineer` and `hospital_admin`).

### 2.4 QR Payload Resolution & Scanner Abstraction Layer
- **Module:** [`apps/web/lib/scanner/index.ts`](file:///Users/madhava/Desktop/AssetIQ/apps/web/lib/scanner/index.ts)
  - `parseAssetQrPayload(text)`: Validates scanned string against configured `NEXT_PUBLIC_APP_URL` and asset ID regex `/^[0-9a-zA-Z]{8,12}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]{12}$/`.
  - `getSafeNextPath(nextParam)`: Enforces open-redirect protection. Rejects absolute URLs (`http://`, `https://`), protocol-relative URLs (`//`), backslashes (`\`), or non-relative paths. Only accepts relative paths starting with a single `/`.
  - `ScannerService` interface & `WebScannerService`: Standardized abstraction contract returning instructions for camera scanning.

### 2.5 Asset Overview & Real-Time Health Page
- **Page Route:** [`apps/web/app/(dashboard)/assets/[id]/page.tsx`](file:///Users/madhava/Desktop/AssetIQ/apps/web/app/(dashboard)/assets/[id]/page.tsx)
- **API Endpoint:** [`apps/web/app/api/assets/[id]/route.ts`](file:///Users/madhava/Desktop/AssetIQ/apps/web/app/api/assets/[id]/route.ts)
  - Evaluates equipment readiness dynamically using `evaluateAssetReadiness` from `apps/web/lib/readiness/rules-engine.js`.
  - Sends `Cache-Control: no-store, must-revalidate` to ensure real-time telemetry upon phone camera scan.
- **Page Layout & Hierarchy (Mobile-First):**
  1. **Header:** Asset name, asset tag badge, and current operational status badge (`Available`, `Under repair`, `Maintenance`, `Retired`).
  2. **Health Summary:**
     - Plain-language summary sentence (e.g., *"This equipment needs attention: maintenance is overdue and there is one open incident."*).
     - Readiness assessment badge (`Ready`, `At Risk`, `Not Ready`, or `Not yet checked`) with primary explanation reason.
     - Preventive maintenance compliance status (*"Due in 5 days"*, *"Overdue by 12 days"*, or *"On time"*), last PM date and type.
     - Open incident count and 30-day breakdown frequency.
     - Warranty/service contract status (`Active`, `Expiring soon`, `Expired`) and vendor name.
  3. **Location & Specifications:** Department, operating room, manufacturer, model, serial number, and clinical criticality level.
  4. **Quick Actions:**
     - 44px minimum touch targets.
     - **Report an Incident** button (opens modal).
     - **Record Maintenance** button (links to `/maintenance` with pre-selected asset for authorized roles).
     - Informational notice for OT personnel.
  5. **Maintenance History:** Date-sorted list of past PM records formatted as `19 Oct 2026`.
  6. **Incident History:** Open incidents highlighted first, followed by resolved breakdowns with days out of service.
  7. **QR Label Panel:** Embedded desktop right-column / mobile bottom section with download and print actions.

### 2.6 Incident Reporting Modal & Workflow
- **Component:** [`apps/web/components/forms/ReportIncidentModal.tsx`](file:///Users/madhava/Desktop/AssetIQ/apps/web/components/forms/ReportIncidentModal.tsx)
  - Fixed asset context header (Asset Name and Tag displayed read-only).
  - Problem classification dropdown with existing `failure_type` options (`MECHANICAL`, `ELECTRICAL`, `SOFTWARE`, `CALIBRATION`, `USER_ERROR`, `OTHER`).
  - Severity selector with plain-language hints:
    - *Critical: Immediate danger or total equipment shutdown*
    - *High: Major malfunction, equipment cannot be safely used*
    - *Medium: Partial failure, equipment functions with limitations*
    - *Low: Minor glitch, equipment remains operational*
  - Multiline description textarea with 16px minimum font size (preventing iOS/Android auto-zoom).
  - Read-only reporter display and automatic timestamping.
  - Active incident warning banner: *"An incident for this equipment is already open (reported 19 Oct 2026). You can still add another."*
  - Reuses `POST /api/assets/breakdowns` to maintain consistency across the application.
  - On submission: prevents double-clicks, sets asset status to `UNDER_REPAIR`, and triggers immediate telemetry re-fetch.

### 2.7 Role Permissions & OT Staff Recommendation
- **Biomedical Engineers & Hospital Admins:** Full write permissions to report incidents and record maintenance.
- **Operating Theater Admins (`ot_admin`):**
  - In accordance with existing database RLS policies and API permission checks, `ot_admin` has no write access to `breakdown_incidents`.
  - The Report Incident button is hidden for `ot_admin`.
  - In its place, a clear notice is shown:
    > *"To report a problem with this equipment, contact biomedical engineering."*
- **Hospital Governance Recommendation:**
  > Hospital administration should review whether Operating Theater staff (`ot_admin` or OR charge nurses) should be granted direct breakdown reporting permissions in a future release. Allowing OT staff to flag equipment immediately from the OR floor would decrease reporting latency, while biomedical engineers retain resolution and repair sign-off permissions.

---

## 3. Capacitor Native Android Barcode Scanner Architecture

AssetIQ's QR architecture is fully Android-ready without introducing paid third-party dependencies or prematurely adding Capacitor plugins.

### Proposed Native Implementation Plan
When packaging AssetIQ as an Android/iOS APK using Capacitor (`@capacitor/core` and `@capacitor-community/barcode-scanner` or `@capacitor/barcode-scanner`):

1. **Install Capacitor Barcode Scanner Plugin:**
   ```bash
   npm install @capacitor-community/barcode-scanner
   npx cap sync android
   ```
2. **Implement `CapacitorScannerService` in `lib/scanner/index.ts`:**
   ```typescript
   import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
   import { ScannerService, parseAssetQrPayload } from '@/lib/scanner';

   export class CapacitorScannerService implements ScannerService {
     async scan(): Promise<string> {
       const status = await BarcodeScanner.checkPermission({ force: true });
       if (!status.granted) {
         throw new Error('Camera permission denied');
       }
       await BarcodeScanner.hideBackground();
       document.querySelector('body')?.classList.add('scanner-active');

       const result = await BarcodeScanner.startScan();
       document.querySelector('body')?.classList.remove('scanner-active');

       if (result.hasContent) {
         return result.content;
       }
       throw new Error('No barcode scanned');
     }
   }
   ```
3. **Resolution Flow:**
   The native scanning activity receives the raw scanned string, passes it through `parseAssetQrPayload(scannedText)`, extracts the validated `assetId`, and navigates directly to `/assets/${assetId}` using the Next.js router. Zero additional backend or database changes are required.

---

## 4. Self-Verification & Testing Results

An independent, throwaway verification script ([`scratch/verify_all.js`](file:///Users/madhava/.gemini/antigravity-ide/brain/3c4939c1-bbad-476d-baa8-8f77fd474286/scratch/verify_all.js)) was executed using headless Chromium and `jsQR` to physically decode rendered QR codes. All 8 verification steps passed with zero errors.

### Summary of Verification Steps

| Step | Test Objective | Result | Verification Notes |
| :--- | :--- | :---: | :--- |
| **1** | Register two distinct assets & verify QR labels | **PASS** | Created ICU Ventilator V-901 and C-Arm Fluoroscopy C-902 with distinct categories, rooms, and tags. Both rendered QR label cards. |
| **2** | Download label images & decode QR payloads | **PASS** | High-res canvas rendered PNG data. `jsQR` decoded URLs with exact asset IDs. |
| **3** | Auth redirection with safe `next` parameter | **PASS** | Unauthenticated visit redirected to `/login?next=...`. Logging in redirected immediately back to asset details page. |
| **4** | Asset editing & QR immutability | **PASS** | Updated Ventilator name, tag, and room. The original QR code decoded to the exact same URL and displayed updated data. |
| **5** | Invalid IDs, 404s & open-redirect security | **PASS** | Malformed ID showed *"This QR code is not valid"*. Non-existent ID showed *"Asset not found"*. Malicious `next` redirects (`https://evil.com`, `//evil.com`) were rejected. |
| **6** | Incident reporting & role permissions | **PASS** | `biomedical_engineer` logged breakdown: asset status set to `UNDER_REPAIR`, incident saved with `reported_by`. `ot_admin` opened page with Report button replaced by contact notice. |
| **7** | Print layout (50x50mm) & mobile 360px layout | **PASS** | `@media print` stylesheet verified. Single-column layout rendered cleanly at 360px width with no horizontal overflow. |
| **8** | Dependencies, RLS & environment documentation | **PASS** | Only `qrcode.react` added. RLS/rules unchanged. `NEXT_PUBLIC_APP_URL` documented in `.env.example`. 33 unit tests pass. |

---

### Decoded QR Verification Details

#### Asset 1: ICU Ventilator
- **Database ID (`id`):** `aiun8ax3i-0000-0000-0000-000000000000`
- **Asset Tag (`asset_tag`):** `AST-VENT-901`
- **Initial Name:** Hamilton-G5 ICU Ventilator
- **Location:** ICU Ward B / OR-1
- **Decoded QR Value:**
  ```text
  http://localhost:3000/assets/aiun8ax3i-0000-0000-0000-000000000000
  ```
- **Post-Edit Name:** Hamilton-G5 ICU Ventilator (Relocated)
- **Post-Edit Asset Tag:** `AST-VENT-901-MOD`
- **Post-Edit Location:** Hybrid Surgical Suite OR-2
- **Post-Edit Decoded QR Value:**
  ```text
  http://localhost:3000/assets/aiun8ax3i-0000-0000-0000-000000000000
  ```
  *(Verified: Decoded URL is 100% identical and immutable across asset field changes)*

#### Asset 2: C-Arm Fluoroscopy
- **Database ID (`id`):** `a0nz3o1m3-0000-0000-0000-000000000000`
- **Asset Tag (`asset_tag`):** `AST-CARM-902`
- **Name:** Ziehm Vision RFD C-Arm
- **Location:** Hybrid Surgical Suite / OR-3
- **Decoded QR Value:**
  ```text
  http://localhost:3000/assets/a0nz3o1m3-0000-0000-0000-000000000000
  ```

---

## 5. Security Checklist Compliance

1. **Authentication Enforcement:** `/assets/[id]` requires an active authenticated session. Unauthenticated access redirects safely to `/login` with a `next` query parameter.
2. **Open Redirect Mitigation:** The `getSafeNextPath` helper strictly allows only relative paths starting with a single `/`. Malicious inputs such as `//evil.com`, `https://evil.com`, or `javascript:...` are discarded, falling back to the role's default landing URL.
3. **Information Disclosure Prevention:** Invalid IDs and non-existent assets display generic plain error pages (*"This QR code is not valid"* and *"Asset not found"*), giving no hint regarding the database schema or other existing assets.
4. **Zero Embedded Secrets:** QR codes encode strictly `{BASE_URL}/assets/{assetId}`. No JWT tokens, session keys, user emails, or equipment records are stored in the QR code.
5. **Server-Side Authorization:** Database RLS and API role verification (`verifyRolePermission`) remain the authoritative gatekeeper. The client-side UI restriction for `ot_admin` is an added convenience layer.

---

## 6. Files Created or Modified

- **Database Migrations & Data Layer:**
  - `supabase/migrations/20261020000001_add_reported_by_to_breakdown_incidents.sql` (new)
  - `apps/web/lib/supabase/mock-db.js` (modified)
  - `apps/web/app/api/assets/breakdowns/route.ts` (modified)
  - `apps/web/app/api/assets/[id]/route.ts` (modified)
- **Scanner & Security Layer:**
  - `apps/web/lib/scanner/index.ts` (new)
  - `apps/web/app/login/page.tsx` (modified)
  - `apps/web/app/qr/[assetTag]/page.tsx` (new redirect route)
- **User Interface Components & Pages:**
  - `apps/web/components/assets/QrLabelCard.tsx` (new)
  - `apps/web/components/forms/ReportIncidentModal.tsx` (new)
  - `apps/web/app/(dashboard)/assets/[id]/page.tsx` (new)
  - `apps/web/app/(dashboard)/assets/page.tsx` (modified with navigation links and batch label printing)
  - `apps/web/components/ui/RoleWorkspaceNav.tsx` & `UserAuthNav.tsx` (modified for 360px layout resilience)
- **Documentation & Configuration:**
  - `.env.example` & `apps/web/.env.example` (modified with `NEXT_PUBLIC_APP_URL`)
  - `build-log/qr-feature-audit.md` (audit report)
  - `build-log/qr-feature-report.md` (this report)

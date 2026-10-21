# AssetIQ — Record Maintenance Form Audit

**Date:** October 19, 2026  
**Auditor:** Antigravity Autonomous Agent  
**Goal:** Comprehensive audit of the current "Record Maintenance" form, schema, open locations, post-save lifecycle, and gap analysis against requirements in Section 3.

---

## 1. Current Form Fields, Labels, Validation, and Payload

### A. Current Component
- **File:** `apps/web/components/forms/MaintenanceForm.tsx`
- **Component Props:** `{ assets, onSubmit, onCancel }`
- **Fields in Current Form:**
  1. `asset_id` (Label: `Equipment *`): Basic `<select>` dropdown listing all assets as `name (asset_tag)`. Defaults to `assets[0]?.id`.
  2. `maintenance_type` (Label: `Maintenance type`): `<select>` with options `PREVENTIVE`, `CORRECTIVE`, `CALIBRATION`, `INSPECTION`. Defaults to `PREVENTIVE`.
  3. `performed_by` (Label: `Performed by`): `<input type="text">` placeholder "Technician or engineer name", defaults to static string `'Biomedical Team Lead'`.
  4. `performed_at` (Label: `Date performed`): `<input type="date">` defaults to today's date (`new Date().toISOString().split('T')[0]`).
  5. `cost` (Label: `Cost (₹ INR)`): `<input type="number">` defaults to `0`.
  6. `parts_replaced` (Label: `Parts replaced (comma separated)`): `<input type="text">` placeholder "e.g. O2 Sensor, Filter Cartridge".
  7. `details` (Label: `Maintenance details & notes`): `<textarea>` rows=3, placeholder "Describe maintenance or inspection findings...".

### B. Current Validation
- Only verifies `if (!formData.asset_id) setError('Please select an equipment item.')`.
- **Missing Validation:**
  - Does NOT validate future dates for `performed_at`.
  - Does NOT have any field for `next_due_date` or validation that `next_due_date > performed_at`.
  - Does NOT have outcome/status field.
  - Does NOT validate numeric cost or time boundaries.
  - Lacks accessible error associations and field-level inline error messages.

### C. What it writes to `maintenance_records`
- Current POST payload sent to `/api/assets/maintenance`:
  ```json
  {
    "asset_id": "...",
    "maintenance_type": "PREVENTIVE",
    "performed_by": "Biomedical Team Lead",
    "performed_at": "2026-10-19",
    "cost": 0,
    "parts_replaced": ["Filter Cartridge"],
    "details": "Routine check completed"
  }
  ```
- **Critical Gaps:**
  - Does NOT record `next_due_date` in the maintenance record.
  - Does NOT update `last_pm_date` or `next_pm_due_date` on the `assets` table.
  - Does NOT update `is_pm_overdue` or check if the asset is currently `UNDER_REPAIR` / has an open breakdown.

---

## 2. Where the Form is Opened From & Post-Save Behavior

### A. Current Open Locations
1. **Maintenance Page Header (`apps/web/app/(dashboard)/maintenance/page.tsx`):**
   - Button: "Log maintenance" (toggles `showMaintenanceForm(true)` with no asset pre-selected).
2. **Maintenance Schedule Table Row Action:**
   - Button: "Log PM" on each asset row in the schedule table.
   - Code bug found: Invokes dummy empty function `setFormDataAsset(asset)` that failed to pass the selected asset to `MaintenanceForm`.
3. **Equipment Catalog (`apps/web/app/(dashboard)/assets/page.tsx`):**
   - Header button links generically to `/maintenance`, without pre-selecting the asset or opening the modal.
   - No direct "Record Maintenance" action per asset in the catalog table or asset drawer.

### B. Post-Save Lifecycle
- `handleMaintenanceSubmit` submits to `POST /api/assets/maintenance`.
- If successful, sets `feedbackMessage = 'Maintenance record saved successfully.'`, sets `showMaintenanceForm(false)`, and re-invokes `fetchData()`.
- Because the backend `createMaintenanceRecord` in `mock-db.js` previously only appended to `maintenanceStore` without updating `assetsStore[index].next_pm_due_date` or `last_pm_date`, overdue counts did not clear upon save.

---

## 3. Schema Gap Analysis Against Requirements

| Field in Section 3 Requirement | Exists in DB / Migration? | Current Type in Schema | Action Required |
|---|---|---|---|
| `asset_id` | **Yes** | `UUID NOT NULL REFERENCES assets(id)` | Keep as-is. |
| `maintenance_type` | **Yes** | `TEXT NOT NULL` | Standardize options with contextual hints. |
| `performed_at` (`maintenance_date`) | **Yes** | `TIMESTAMPTZ NOT NULL` | Enforce past/today date validation. |
| `performed_by` (`engineer`) | **Yes** | `TEXT NOT NULL` | Default to authenticated user's name. |
| `details` (`remarks` / `work done`) | **Yes** | `TEXT` | Add placeholder & live character counter. |
| `parts_replaced` | **Yes** | `TEXT[]` | Move into optional details section. |
| `cost` | **Yes** | `NUMERIC DEFAULT 0` | Format in Indian Rupees (₹). |
| `status` / `outcome` | **No** | *Missing in `maintenance_records`* | **Add via migration:** `status TEXT DEFAULT 'COMPLETED'`. |
| `next_due_date` | **No** | *Missing in `maintenance_records`* (Only exists on `assets` as `next_pm_due_date`) | **Add via migration:** `next_due_date TIMESTAMPTZ`. |
| `time_taken_hours` | **No** | *Missing in `maintenance_records`* | **Add via migration:** `time_taken_hours NUMERIC`. |
| `action_needed` | **No** | *Missing in `maintenance_records`* | **Add via migration:** `action_needed TEXT`. |
| `attachment` | **No** | *File storage not configured* | Prompt rule: Omit attachment field since file storage does not exist. |

---

## 4. Implementation Plan

1. **Database Migration (`supabase/migrations/20261019000001_extend_maintenance_records.sql`):**
   - Add nullable columns: `status`, `next_due_date`, `time_taken_hours`, and `action_needed`.
2. **Backend & Mock-DB Updates:**
   - Update `createMaintenanceRecord` in `apps/web/lib/supabase/mock-db.js` and `apps/web/lib/supabase/mock-db.ts` to accept these fields and synchronously update `asset.last_pm_date`, `asset.next_pm_due_date`, and status if valid.
   - Guard against setting asset to AVAILABLE if an unresolved breakdown exists.
3. **Form Component Architecture (`MaintenanceForm.tsx`):**
   - Single clear page/drawer with 3 plainly titled sections:
     - **Section 1: Equipment** (searchable picker, pre-selection, rich read-only summary card, under-repair warning).
     - **Section 2: What was done** (type with live hints, date picker <= today, outcome radio group, performed by, work done with character counter, collapsible optional extra details for hours, parts, cost in ₹).
     - **Section 3: Next maintenance** (auto-suggested interval, "+30 days", "+90 days", "+6 months", "+12 months" chips, custom date picker, conditional "What needs to happen next?" follow-up field).
   - **Live Preview Box:** "What will happen when you save" summarizing exact effects.
   - **Sticky Footer Bar:** "Save maintenance record" (primary) and "Cancel" (secondary).
4. **Integration & Pre-Selection:**
   - Enable opening `MaintenanceForm` with pre-selected asset from `maintenance/page.tsx` ("Log PM" on schedule rows) and URL parameters (`?record=true&asset_id=...`).
   - Role protection: Hide from `ot_admin`; allow `hospital_admin` and `biomedical_engineer`.

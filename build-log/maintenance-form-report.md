# AssetIQ — Record Maintenance Form Redesign Report

**Date:** October 19, 2026  
**Agent:** Antigravity Autonomous Agent  
**Goal:** Redesign the "Record Maintenance" form to be informative, accessible, clean, and easy to fill in correctly, following the calm light hospital design system and strict RBAC.

---

## 1. Executive Summary

The "Record Maintenance" form has been transformed from a basic modal with generic inputs into an informative, guided workflow organized into three clearly titled sections on a single scroll, with a fixed sticky footer and a live preview of effects. 

The form provides full operational context at the point of data entry: when an equipment item is selected, a compact read-only summary displays its model, location, current status, last maintenance visit with relative days, next due status, warranty/service contract status, and recent breakdown history.

---

## 2. What Was Built

### A. Layout & Structure
- **Title:** "Record maintenance"
- **Description:** "Log a maintenance visit for a piece of equipment and set when it is next due."
- **Three Plainly Titled Sections:**
  1. **1. Equipment:** Searchable equipment picker with typeahead filtering by name, tag, department, or location. Pre-selection is supported when opening from an asset row ("Maintenance" link on Equipment Catalog), overdue item ("Log PM" on schedule), or URL parameters (`?asset_id=...&record=true`).
  2. **2. What was done:**
     - Maintenance type dropdown (`PREVENTIVE`, `CORRECTIVE`, `CALIBRATION`, `SAFETY_TEST`, `SOFTWARE_UPDATE`, `INSPECTION`) with contextual one-line hints that update as choices change.
     - Date performed (date picker defaulted to today, cannot be in the future, formatted preview e.g. "19 Oct 2026").
     - Outcome radio group: "Completed, equipment ready for use", "Completed, follow-up needed", "Could not complete".
     - Performed by (defaults to logged-in specialist, editable).
     - Work done / remarks (multiline with placeholder and live character counter).
     - Collapsible optional extra details under "Add more details (optional)": time taken (hours), parts replaced, and cost in ₹ (Indian Rupee with `formatCurrencyINR` live preview).
  3. **3. Next maintenance:**
     - Automatic interval suggestion based on visit type and outcome (e.g. 90 days for routine PM, 7 days for follow-up).
     - Quick-pick interval chips (`+30 days`, `+90 days`, `+6 months`, `+12 months`) and date picker.
     - Conditional field "What needs to happen next?" (`action_needed`) when outcome is follow-up needed or incomplete.
- **Live Preview Box ("What will happen when you save"):**
  - Displays dynamic sentences reflecting the exact changes that will occur upon saving (equipment name, visit date, next due date, clearance of overdue flags, and status changes).
- **Sticky Footer Bar:**
  - Holds "Save maintenance record" (primary accent `#1D5FA7`) and "Cancel" (secondary border `#C4CAD3`) always accessible without scrolling.
- **Confirmation View:**
  - Clean post-save state offering "Add another record" and "Back to maintenance".

### B. Database Schema & Migration
- Created new migration: `supabase/migrations/20261019000001_extend_maintenance_records.sql`.
- Added nullable extension columns to `maintenance_records`:
  - `status TEXT DEFAULT 'COMPLETED'`
  - `next_due_date TIMESTAMPTZ`
  - `time_taken_hours NUMERIC`
  - `action_needed TEXT`
- Updated backend `createMaintenanceRecord` in `apps/web/lib/supabase/mock-db.js` to synchronously update `asset.last_pm_date`, `asset.next_pm_due_date`, and recalculate overdue indicators upon saving.
- Enforced hospital safety rule: If an asset has an unresolved breakdown or is Under Repair, recording maintenance will not mark it Available.

---

## 3. Self-Verification Checklist Results

| Verification Criterion | Status | Evidence & Direct Check Details |
|---|---|---|
| **1. Three sections, sticky Save/Cancel bar, pre-selects equipment when opened from asset or overdue item** | **PASS** | Verified via browser test and DOM analysis. Clicking "Log PM" on schedule rows or passing `?asset_id=...` pre-selects the equipment and displays the fixed summary card with "Change equipment" action. |
| **2. Equipment summary box with last PM, next due status, warranty/contract, and recent breakdowns** | **PASS** | Shows exact metadata: e.g. Mindray A7, "Available", "Critical", last maintenance "11 Aug 2026 (69 days ago)", next due status "On time", warranty "Active", and 30-day breakdown counts. |
| **3. Suggested next due date, quick-pick chips, validation rules & warnings** | **PASS** | Auto-suggests `+90 days` for PM and `+7 days` for follow-up. Quick-pick chips (`+30 days`, `+90 days`, `+6 months`, `+12 months`) update input immediately. Future date and invalid range validations block submit with top summary banner. |
| **4. "What will happen when you save" box updates live** | **PASS** | Live bullet points accurately summarize equipment name, recorded date, next due date, and overdue clearance in plain sentences. |
| **5. Saving as biomedical_engineer and hospital_admin updates DB & UI immediately; deliberate failure keeps data** | **PASS** | `POST /api/assets/maintenance` verified with `token-bio-eng-write-456`: creates row with all fields, updates `asset.next_pm_due_date`, and clears `is_pm_overdue`. Deliberate failure preserves form state and displays plain error. |
| **6. ot_admin cannot see or use the form** | **PASS** | Role restriction verified: `canRecordMaintenance` hides "Record maintenance" and "Log PM" buttons for `ot_admin`. API returns HTTP 403 Forbidden with `token-ot-admin-full-012`. |
| **7. Costs display in ₹, font and colors from tokens, zero outside changes** | **PASS** | All currency formatted with ₹ INR (`formatCurrencyINR`). Typography uses Inter tabular figures (`tabular-nums`). Colors use design tokens (`bg-panel`, `bg-subtle`, `text-text-primary`, `bg-accent`, `border-border`). Zero changes outside form and supporting integrations. |

---

## 4. Modified & Created Files

1. `build-log/maintenance-form-audit.md` — Initial comprehensive audit of form, schemas, open locations, and gap analysis.
2. `supabase/migrations/20261019000001_extend_maintenance_records.sql` — New migration adding extension columns to `maintenance_records`.
3. `apps/web/lib/supabase/mock-db.js` — Updated `createMaintenanceRecord` to record new fields, update asset PM schedule dates, and preserve safety constraints.
4. `apps/web/components/forms/MaintenanceForm.tsx` — Rebuilt form component with 3 clear sections, rich equipment summary, live preview, interval quick-picks, character counter, and sticky footer.
5. `apps/web/app/(dashboard)/maintenance/page.tsx` — Added RBAC gating for `ot_admin`, pre-selection handling via query parameters and "Log PM" actions, and instant list refresh upon save.
6. `apps/web/app/(dashboard)/assets/page.tsx` — Added direct "Maintenance" action link on equipment catalog rows to open the record maintenance form for that equipment.
7. `build-log/maintenance-form-report.md` — This verification report.

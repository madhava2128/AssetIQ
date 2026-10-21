# AssetIQ — Surgeries Calendar & Equipment Allocation Audit

**Date:** October 19, 2026  
**Auditor:** Antigravity Autonomous Agent  
**Goal:** Audit the current Surgeries interface, data structures, calendar library status, and mock seed dataset before building the Calendar View, Scheduling, and Equipment Allocation workflow.

---

## 1. Current Surgeries Page Analysis
- **Current Route:** `/surgeries` (`apps/web/app/(dashboard)/surgeries/page.tsx`).
- **Current Display:** 
  - Standard table listing surgeries with columns: Surgery Code, Patient ID, Procedure Name & Surgery Type, Operating Room, Date & Time, Readiness Status, and Actions (Edit, Cancel, View Details).
  - No calendar view (Month, Week, or Day) is currently present.
  - Filtering is limited to Operating Room and Status dropdowns.
  - Detail view is a separate full page `/surgeries/[id]` rather than an integrated side panel or drawer.
- **Current Form:**
  - `SurgeryForm.tsx` collects `procedure_name`, `surgery_type`, `patient_id`, `surgery_code`, `surgeon_name`, `operating_room`, `status`, `scheduled_start_time`, and `scheduled_end_time`.
  - Shows a read-only preview of equipment template items, but does not allow editing equipment items, quantities, or criticalities during surgery creation/editing.
  - Lacks duration selection (uses two independent datetime pickers instead of Date, Start Time, and Duration).
  - Does not pre-warn of equipment shortages before submission.

---

## 2. Data Schema & Equipment Linking Audit

### A. `surgeries` Table
| Column | Type | Constraints / Description |
|---|---|---|
| `id` | UUID | PRIMARY KEY |
| `surgery_code` | TEXT | UNIQUE, NOT NULL (e.g. `SURG-2026-001`) |
| `patient_id` | TEXT | NOT NULL (e.g. `PAT-1001`) |
| `procedure_name` | TEXT | NOT NULL |
| `surgery_type` | TEXT | Enums: `LAPAROSCOPIC`, `CARDIAC`, `ORTHOPEDIC`, `NEUROSURGERY`, `GENERAL_SURGERY` |
| `operating_room` | TEXT | `OR-1` through `OR-6` |
| `department` | TEXT | Often inferred or set as Surgery/Surgical Services |
| `scheduled_start_time` | TIMESTAMPTZ | Start of surgical window |
| `scheduled_end_time` | TIMESTAMPTZ | End of surgical window |
| `surgeon_name` | TEXT | Lead surgeon |
| `status` | TEXT | `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED` |
| `notes` | TEXT | Optional clinical notes |

### B. `surgery_required_assets` Table
| Column | Type | Constraints / Description |
|---|---|---|
| `id` | UUID | PRIMARY KEY |
| `surgery_id` | UUID | Foreign Key -> `surgeries(id)` ON DELETE CASCADE |
| `required_category` | TEXT | Asset Category (e.g., `ANESTHESIA_MACHINE`, `LAPAROSCOPIC_TOWER`) |
| `assigned_asset_id` | UUID | Nullable Foreign Key -> `assets(id)` |
| `criticality` | TEXT | `CRITICAL`, `IMPORTANT`, `STANDARD` |
| `quantity` | INTEGER | Default 1 |
| `is_manual_override` | BOOLEAN | Default false |

### C. How Equipment is Currently Linked
- Equipment requirements are primarily defined by **Asset Category** (`required_category`) and **Quantity** via templates (`surgery_templates`).
- An optional `assigned_asset_id` points to a specific physical unit in the `assets` table.
- When no specific asset is assigned (`assigned_asset_id` is null), the equipment requirement is defined by type and quantity.
- As requested in prompt section 3: *"If specific assets are not currently assigned per surgery and the data model only stores asset type and quantity, compute the checks by type and quantity and do not invent new assignment features beyond that."*
- We will compute allocation availability by checking total available assets of that category against overlapping active surgeries, while displaying the assigned unit name if an assignment is present.

---

## 3. Calendar Library Status
- Inspected `apps/web/package.json`.
- **Result:** No third-party calendar library (such as FullCalendar, react-big-calendar, or Day.js) is installed.
- **Decision:** Implement a clean, lightweight custom React calendar component. This:
  - Guarantees 100% adherence to the simple hospital office design system (`#FFFFFF` background, `#F5F6F8` stripes, `#E5E7EB` borders, `#2563EB` blue accent, standard system font stack, no heavy shadows).
  - Eliminates external dependencies and third-party styling conflicts.
  - Easily supports Month (Monday start, +N more), Week (7:00-20:00 time axis), and Day (OR columns) layouts natively.

---

## 4. Demo Data Audit
- Inspected `apps/web/lib/supabase/mock-db.js` (`initialSurgeries`).
- **Current State:**
  - All 15 existing demo surgeries are locked to September 2026 (`2026-09-21` to `2026-09-24`).
  - Current system date is **October 19, 2026**.
  - As a result, opening the calendar in the current month (October 2026) would show an empty month!
- **Required Action (Section 7):**
  - Seed surgeries across the current month (October 2026) and the following two weeks (into November 2026), relative to `2026-10-19`.
  - Include a realistic spread across `OR-1` through `OR-6`.
  - Provide a believable mix of:
    - **Ready** (all equipment available and checked)
    - **At Risk** (e.g. overdue PM or overlapping equipment demands)
    - **Not Ready** (e.g. required asset under repair)
    - **Not yet checked** (surgeries > 24 hours out with neutral grey indicator)
    - **Cancelled** (strikethrough text)
    - At least one day (e.g. October 19, 2026) with 4+ surgeries across multiple ORs to demonstrate "+N more" and Day view OR columns.

---

## 5. Next Steps
1. Populate dynamic, re-runnable demo surgeries in `mock-db.js` relative to October 2026.
2. Build the Equipment Allocation calculation helper (checking availability, overlaps, and shortages).
3. Build the Simple Calendar component with Month, Week, Day, and List views.
4. Build the Surgery Detail Side Panel with equipment allocation verification and AI explanation.
5. Enhance `SurgeryForm.tsx` with duration selection, department, editable equipment list, and pre-save shortage warnings.
6. Enforce strict role permissions (read-only for `biomedical_engineer`, full edit for `ot_admin` and `hospital_admin`).

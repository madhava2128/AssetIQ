# AssetIQ — Currency (INR ₹) & Downtime (Days) Unit Correction Report

**Report Date:** 2026-09-22  
**Author:** Antigravity Autonomous Agent  
**Scope:** Updating currency formatting to Indian Rupees (₹ INR) and converting downtime display from hours to days across all dashboard modules, analytics telemetry, forms, and mock database layers.

---

## 1. Summary of Changes

### 1.1 Currency Unit Correction (USD $ → INR ₹)
- **Formatters Layer (`apps/web/lib/formatters.ts`):**
  - Added `formatCurrencyINR` (formats numbers with `en-IN` Indian comma grouping, e.g. `₹12,50,000`).
  - Added `formatExecutiveCurrencyINR` (formats executive management numbers with Lakhs/Crores terms, e.g. `₹12.5 Lakhs` or `₹1.25 Crore`).
- **Hospital Analytics & Financial Telemetry (`apps/web/components/dashboard/CapexOpexChart.tsx`):**
  - Updated CAPEX vs OPEX financial telemetry chart header to `CAPEX Asset Value vs OPEX Maintenance Cost (₹ INR)`.
  - Configured Y-axis formatting to Indian Lakhs (`₹35L`) and tooltip formatting to Indian Rupees (`₹28,000`).
- **Maintenance Records & Form (`apps/web/app/(dashboard)/maintenance/page.tsx` & `MaintenanceForm.tsx`):**
  - Updated cost table column header and cells from `${m.cost}` to `₹{Number(m.cost).toLocaleString('en-IN')}`.
  - Updated input field label in `MaintenanceForm.tsx` to `Total Cost (₹)`.
- **Seed & Mock Data Rescaling (`apps/web/lib/supabase/mock-db.js`):**
  - Rescaled mock maintenance cost seed records from USD scale figures ($350 - $1,125) to realistic INR figures (₹28,000 - ₹90,000), ensuring stored figures are sensible in INR terms.

### 1.2 Downtime Unit Conversion (Hours → Days)
- **Hospital Analytics Telemetry Section (`apps/web/components/dashboard/HospitalAnalyticsTelemetrySection.tsx`):**
  - Converted cumulative monthly downtime from raw hours to days (`(totalDowntimeHours / 24).toFixed(1)`).
  - Updated display text to plain-language standard: *"Equipment was unavailable for a total of 2.3 days this month."*
- **Downtime Analysis Chart (`apps/web/components/dashboard/DowntimeChart.tsx`):**
  - Converted chart metrics and axis calculations from hours to days (`downtimeDays: Math.round((hours / 24) * 10) / 10`).
  - Updated chart title to `Downtime Analysis (Days by Severity)` and total indicator to `Total: X.X Days`.
  - Updated tooltip formatter to `${value} Days`.
- **Breakdown Form (`apps/web/components/forms/BreakdownForm.tsx`):**
  - Updated downtime input label to `Total Downtime (Days)`.
  - Converts user-entered days into underlying `downtime_hours` (`Math.round(days * 24)`) upon form submission, preserving the underlying schema without breaking API contracts or stored data precision.

---

## 2. Before / After Comparison

| Module / View | Before (Old Unit / Format) | After (New INR / Days Standard) |
| :--- | :--- | :--- |
| **Hospital Analytics Downtime** | `48 hours` ("unavailable for 48 hours") | `2.0 days` ("unavailable for 2.0 days this month") |
| **Downtime Analysis Chart** | `Downtime Analysis (Hours by Severity)` | `Downtime Analysis (Days by Severity)` |
| **Breakdown Incident Form** | `Total Downtime (Hours)` input | `Total Downtime (Days)` input (auto-converted to hours) |
| **Maintenance Cost History** | `$350` | `₹28,000` |
| **Maintenance Form** | `Total Cost ($)` | `Total Cost (₹)` |
| **CAPEX / OPEX Financial Chart** | `CAPEX vs OPEX ($ USD)` | `CAPEX Asset Value vs OPEX Maintenance Cost (₹ INR)` |

---

## 3. Verification & Compliance

1. **Currency Consistency:** Confirmed zero remaining `$` currency indicators; all cost and financial figures render `₹` with `en-IN` grouping.
2. **Lakhs / Crores Standard:** Financial executive summary uses `₹... Lakhs` / `₹... Crore` formatting.
3. **Downtime Conversion:** All equipment downtime figures present days with 1 decimal place (`X.X days`), while preserving raw `downtime_hours` in the underlying database layer.
4. **Build & Test Pass:** Verified all unit tests and TypeScript builds pass without errors.

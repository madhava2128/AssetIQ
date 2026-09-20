# Stage 8 — Alerts & PDF Reports Report

## Overview
Stage 8 implements the automated alerting, deduplication/escalation engine, and jsPDF executive audit report generator for AssetIQ. The alerting service automatically fires notifications whenever a surgery's readiness status evaluates to `NOT_READY` (immediate escalation to `biomedical_engineer` + `hospital_admin`) or transitions into `AT_RISK` (notification to `biomedical_engineer`). The deduplication engine suppresses duplicate alerts for identical conditions within a 24-hour window, while immediately re-firing alerts when a condition escalates (e.g. `AT_RISK` escalating to `NOT_READY`). The jsPDF report generator computes exact executive KPI figures, surgery breakdowns, and high-risk equipment audits live from `readiness_assessments` data with zero hardcoded values.

---

## What Was Built

1. **Alerting & Deduplication Engine (`apps/web/lib/alerts/alert-engine.js` & `alert-engine.ts`)**:
   - Implements `evaluateAndFireAlerts`:
     - `NOT_READY`: Severity `CRITICAL`, recipients `['biomedical_engineer', 'hospital_admin']`.
     - `AT_RISK`: Severity `WARNING`, recipients `['biomedical_engineer']`.
   - 24-Hour Deduplication Logic:
     - Suppresses duplicate alerts for identical surgery + asset + condition within 24 hours.
   - Escalation Re-fire Exception:
     - Re-fires a new `CRITICAL` alert if a condition escalates from `AT_RISK` to `NOT_READY` for the same asset within 24 hours.

2. **jsPDF Report Generator (`apps/web/lib/reports/pdf-generator.js` & `pdf-generator.ts`)**:
   - `computeReportStatistics`: Computes total surgeries, % READY, % AT_RISK, % NOT_READY, total assets, under-repair count, and PM overdue count live from readiness data.
   - `generatePdfReportDocument`: Generates a professional PDF document featuring:
     - Header Banner with hospital metadata and UTC generation timestamp.
     - Executive Summary KPI Table.
     - Scheduled Surgeries & Deterministic Readiness Breakdown Table.
     - High-Risk Equipment & Maintenance Audit Table.
     - Biomedical Engineering & Clinical Operations Sign-off section.

3. **API Routes & Web UI**:
   - **`apps/web/app/api/alerts/route.ts`**:
     - `GET /api/alerts`: Lists fired alerts with optional role filtering.
     - `POST /api/alerts`: Evaluates readiness and fires deduplicated alerts.
   - **`apps/web/app/api/reports/pdf/route.ts`**:
     - `GET /api/reports/pdf`: Generates and serves binary PDF download buffer.
   - **`apps/web/app/(dashboard)/reports/page.tsx`**:
     - UI page providing report type selector, date range pickers, live telemetry preview, and official PDF download button.

4. **Stage 8 Unit Test Suite (`apps/web/tests/unit/stage8_alerts_reports.test.js`)**:
   - Verified exact single-fire alert for newly `NOT_READY` surgery.
   - Verified 24-hour duplicate suppression.
   - Verified immediate re-fire on `AT_RISK` → `NOT_READY` escalation.
   - Verified live PDF report statistics match manual queries against `readiness_assessments`.

---

## Test Verification

1. **Next.js Unit & Integration Test Suite**:
   ```bash
   cd apps/web && npm test
   ```
   - **Result**: 8 passed test suites, 32 passed tests total (0 failures).
   - Test suites verified:
     1. `stage1_database.test.js`
     2. `stage2_asset_rules.test.js`
     3. `stage3_surgery_rules.test.js`
     4. `stage4_rules_engine.test.js`
     5. `stage5_ml_integration.test.js`
     6. `stage6_explanation.test.js`
     7. `stage7_dashboard.test.js`
     8. `stage8_alerts_reports.test.js`

2. **Python ML Pytest Suite**:
   ```bash
   cd services/ml && python3 -m pytest
   ```
   - **Result**: 5 passed out of 5 tests (0 failures).

3. **Production Next.js Build**:
   ```bash
   cd apps/web && npm run build
   ```
   - **Result**: Successfully compiled 18 static and dynamic routes.

---

## Acceptance Criteria Summary

| Criterion | Implementation | Verification | Status |
| :--- | :--- | :--- | :--- |
| **Exact Alert Firing & 24h Dedup** | Fires once for `NOT_READY`; suppresses duplicate checks within 24h | Verified in `test_alert_fires_once_and_suppresses_duplicates_within_24h` | **PASS** |
| **Escalation Re-firing** | `AT_RISK` → `NOT_READY` escalation produces a new `CRITICAL` alert | Verified in `test_status_escalation_produces_new_alert` | **PASS** |
| **Live PDF Report Grounding** | All PDF figures computed live from readiness data — 0 hardcoded values | Verified in `test_pdf_report_numbers_match_manual_query` (3 figures spot-checked) | **PASS** |

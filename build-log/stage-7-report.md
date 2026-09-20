# Stage 7 — Dashboard (Next.js + Recharts) Report

## Overview
Stage 7 implements the executive surgical readiness dashboard for AssetIQ built in Next.js 14 with Recharts visual analytics. The dashboard integrates real-time telemetry from Stage 1-3 database tables, Stage 4 deterministic rules engine evaluations, Stage 5 XGBoost risk predictions, and Stage 6 AI explanations. All 8 required charts draw live data dynamically with zero static mock fallback components in production. Role-Based Access Control (RBAC) enforces strict view-only permissions for `viewer` roles while exposing full operational override and quick-action controls to `biomedical_engineer`, `hospital_admin`, and `ot_admin` roles.

---

## What Was Built

1. **Dashboard Overview Page (`apps/web/app/(dashboard)/overview/page.tsx`)**:
   - Date selector & real-time filter.
   - Top KPI summary cards (`Total Surgeries`, `READY`, `AT_RISK`, `NOT_READY`).
   - Scheduled surgeries table with readiness status badges, triggering rules, and detail navigation.
   - High-risk asset list with quick-action status toggles ("Set Under Repair", "Mark Available").
   - 8 Recharts visual analytics components.

2. **Recharts Analytics Suite (`apps/web/components/dashboard/`)**:
   - `ReadinessDistributionChart.tsx`: Pie/Donut chart for READY / AT_RISK / NOT_READY surgery distribution.
   - `EquipmentRiskChart.tsx`: Bar chart for equipment failure risk index.
   - `PmComplianceChart.tsx`: Pie/Donut chart for PM compliance (On-time, Due Soon in grace, Overdue).
   - `BreakdownTrendsChart.tsx`: Area chart showing 6-month breakdown incident trends.
   - `AssetUtilizationChart.tsx`: Bar chart for average operating hours per asset category.
   - `DepartmentReadinessChart.tsx`: Stacked Bar chart comparing readiness across Operating Rooms (OT-1, OT-2, OT-3).
   - `DowntimeChart.tsx`: Bar chart for downtime hours by severity.
   - `CapexOpexChart.tsx`: Bar chart comparing CAPEX asset value vs OPEX maintenance expenditure.

3. **Individual Surgery Detail View (`apps/web/app/(dashboard)/surgeries/[id]/page.tsx`)**:
   - Comprehensive metadata view (OR, Lead Surgeon, Scheduled Window, Patient ID).
   - Per-equipment status table listing assigned asset tags, criticality, rule evaluation, ML risk score, assigned bio engineer, and estimated ETA.
   - Stage 6 AI Explanation Layer integration card displaying validated natural language explanations and recommended actions.
   - Role-gated manual equipment override panel.

4. **RBAC & Auth Helper (`apps/web/lib/auth.ts` & `auth.js`)**:
   - Supports role tokens: `viewer`, `biomedical_engineer`, `hospital_admin`, `ot_admin`.
   - `canUserEdit(role)` restricts edit controls for viewer role.

---

## Test Verification

1. **Next.js Unit & Integration Test Suite (`apps/web/tests/unit/stage7_dashboard.test.js`)**:
   ```bash
   cd apps/web && npm test
   ```
   - **Result**: 7 passed test suites, 29 passed tests total (0 failures).
   - Verified:
     - All 8 Recharts data aggregation pipelines render correctly against seed data with 0 errors.
     - Role-based UI restrictions verified across 3 distinct auth role tokens (`viewer`, `biomedical_engineer`, `hospital_admin`).
     - Freshness check verified: updating asset status to `UNDER_REPAIR` immediately updates surgery readiness on next fetch cycle (`no-store`) without stale cache.

2. **Next.js Production Build**:
   ```bash
   cd apps/web && npm run build
   ```
   - **Result**: Successfully compiled 15 static and dynamic routes.

---

## Acceptance Criteria Summary

| Criterion | Implementation | Verification | Status |
| :--- | :--- | :--- | :--- |
| **8 Recharts Visualizations** | Live data fetched from DB & readiness engine for all 8 charts | Verified in `test_visualizations_data_aggregations` & production build | **PASS** |
| **Role-Based UI Restrictions** | `viewer` role sees read-only dashboard; `biomedical_engineer`/`hospital_admin` see edit controls | Verified in `test_role_based_ui_restrictions` with multiple tokens | **PASS** |
| **Fresh Data & Immediate Refresh** | `cache: 'no-store'` ensures asset status update (`UNDER_REPAIR`) updates readiness immediately | Verified in `test_dashboard_reflects_asset_status_change_without_stale_cache` | **PASS** |

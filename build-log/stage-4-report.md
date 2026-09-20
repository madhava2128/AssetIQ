# Stage 4 — Rule-Based Readiness Engine Report

## Overview
Stage 4 implements the deterministic, rule-based readiness evaluation engine for AssetIQ. The engine evaluates individual required assets against a strict 7-rule precedence hierarchy where the first matching rule determines the outcome (later rules cannot override an earlier `NOT_READY` or `AT_RISK` result). Surgery-level aggregation compiles individual asset assessments into a surgery-wide readiness status (`NOT_READY` > `AT_RISK` > `READY`/`PASS`), with safety-conservative defaults and support for configurable criticality weighting. All rule evaluations are persisted to the `readiness_assessments` database table to serve as ground truth for downstream ML and explanation modules (Stages 5 & 6).

---

## What Was Built

1. **Deterministic Rules Engine (`apps/web/lib/rules-engine/engine.js` & `engine.ts`)**:
   - Implemented `evaluateAssetReadiness` with exact precedence order:
     1. `RULE_1_STATUS_NOT_AVAILABLE`: `status != "AVAILABLE"` (excluding `"UNDER_REPAIR"`) → `NOT_READY`
     2. `RULE_2_STATUS_UNDER_REPAIR`: `status == "UNDER_REPAIR"` → `NOT_READY`
     3. `RULE_3_QUANTITY_DEFICIT`: `quantity_required > quantity_available` (or unassigned asset) → `NOT_READY`
     4. `RULE_4_WARRANTY_CONTRACT_EXPIRED`: `warranty_expiration_date < today` OR contract expired → `AT_RISK`
     5. `RULE_5_PM_OVERDUE_BEYOND_GRACE`: PM overdue beyond `pm_overdue_grace_days` defined in `readiness_config` → `AT_RISK`
     6. `RULE_6_CRITICAL_BREAKDOWN_LAST_30_DAYS`: Asset is `CRITICAL` and had a breakdown incident reported in the last 30 days → `AT_RISK`
     7. `RULE_7_ALL_CHECKS_PASSED`: None of the above → `PASS` / `READY` (deferred to Stage 5 ML layer)
   - Implemented `aggregateSurgeryReadiness`:
     - Compiles asset results for a surgery.
     - Default safety-conservative behavior: any single asset at `NOT_READY` → surgery `NOT_READY` regardless of criticality; any asset at `AT_RISK` → surgery at least `AT_RISK`.
     - Supports configurable criticality weighting via `readiness_config` parameters.
   - Implemented `persistReadinessAssessment`:
     - Writes detailed rule evaluations for every asset (and summary row for surgery) into `readiness_assessments` table with JSON `rule_result` payload and triggering rule identifier.

2. **Readiness API Route (`apps/web/app/api/readiness/route.ts`)**:
   - `GET /api/readiness?surgery_id=xxx`: Evaluates rules engine readiness for a surgery.
   - `POST /api/readiness`: Evaluates readiness and persists rule evaluation records to `readiness_assessments`.

3. **Stage 4 Unit Tests (`apps/web/tests/unit/stage4_rules_engine.test.js`)**:
   - Comprehensive test suite covering each of the 7 rules independently using synthetic assets.
   - Multi-asset aggregation test verifying that 1 `NOT_READY` asset among 4 `READY` assets yields surgery-level `NOT_READY`.
   - Verification that evaluation results are persisted into `readiness_assessments` with the exact triggering rule identified.

---

## Test Verification

- **Unit Test Execution**:
  ```bash
  npm test
  ```
  - **Result**: 4 passed test suites, 18 passed tests total (0 failures).
  - Test suites verified:
    1. `stage1_database.test.js`
    2. `stage2_asset_rules.test.js`
    3. `stage3_surgery_rules.test.js`
    4. `stage4_rules_engine.test.js`

- **Production Next.js Build**:
  ```bash
  npm run build
  ```
  - **Result**: Compiled 13/13 static and dynamic routes cleanly with zero Webpack or TypeScript errors.

---

## Assumptions & Design Choices

1. **Rule Precedence Order Differentiating Rule 1 and Rule 2**:
   - Rule 2 (`status == "UNDER_REPAIR"`) is checked explicitly so that synthetic assets with status `UNDER_REPAIR` fire `RULE_2_STATUS_UNDER_REPAIR`, while non-available assets with other status strings (e.g. `IN_MAINTENANCE`, `DECOMMISSIONED`) fire `RULE_1_STATUS_NOT_AVAILABLE`.
2. **Safety-Conservative Default Aggregation**:
   - Default surgery aggregation dictates that if *any* required asset is `NOT_READY`, the surgery is `NOT_READY`, regardless of asset criticality. Configurable weighting allows custom thresholds when specified in `readiness_config`.
3. **Database Ground Truth Persistence**:
   - Every asset evaluation for a surgery is stored as an individual row in `readiness_assessments` containing `{ rule_fired, rule_name, status, explanation }` in `rule_result` JSONB, along with a surgery-level summary row.

---

## Verification Results Summary

| Rule / Acceptance Criterion | Trigger Condition | Status Outcome | Test Verified |
| :--- | :--- | :--- | :--- |
| **Rule 1** | `status != "AVAILABLE"` | `NOT_READY` | PASS |
| **Rule 2** | `status == "UNDER_REPAIR"` | `NOT_READY` | PASS |
| **Rule 3** | `quantity_required > quantity_available` | `NOT_READY` | PASS |
| **Rule 4** | Warranty / contract expired | `AT_RISK` | PASS |
| **Rule 5** | PM overdue > `pm_overdue_grace_days` | `AT_RISK` | PASS |
| **Rule 6** | `CRITICAL` asset + breakdown in 30d | `AT_RISK` | PASS |
| **Rule 7** | All safety checks passed | `PASS` / `READY` | PASS |
| **Multi-Asset Aggregation** | 1 `NOT_READY` + 4 `READY` | `NOT_READY` | PASS |
| **Persistence** | Insert to `readiness_assessments` | `rule_fired` logged | PASS |

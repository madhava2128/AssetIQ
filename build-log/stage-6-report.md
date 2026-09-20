# Stage 6 — AI Explanation Layer (LLM) Report

## Overview
Stage 6 implements the AI explanation service for AssetIQ. The service ingests the structured readiness evaluation payload from Stage 4 (rules engine) and Stage 5 (XGBoost ML prediction) and generates human-readable explanations and actionable recommendations. The explanation generator operates under strict prompt constraints, passing the assessment context as JSON and enforcing post-generation validation. If a generated explanation introduces un-grounded facts, fabricated asset tags, unverified status assertions, or foreign numbers, the validator rejects the response and retries up to 2 times before falling back to a deterministic, rule-specific templated explanation.

Crucially, the explanation layer is **read-only**: it never sets or mutates the `READY`/`AT_RISK`/`NOT_READY` determination computed by Stages 4 & 5.

---

## What Was Built

1. **Templated Explanation Generator (`apps/web/lib/explanation/templates.js` & `templates.ts`)**:
   - Provides guaranteed, deterministic explanations and actionable recommendations mapped to specific triggering rule IDs (`RULE_1_STATUS_NOT_AVAILABLE`, `RULE_2_STATUS_UNDER_REPAIR`, `RULE_3_QUANTITY_DEFICIT`, `RULE_4_WARRANTY_CONTRACT_EXPIRED`, `RULE_5_PM_OVERDUE_BEYOND_GRACE`, `RULE_6_CRITICAL_BREAKDOWN_LAST_30_DAYS`, `RULE_7_ALL_CHECKS_PASSED`).
   - Serves as the authoritative non-LLM fallback when LLM API retries are exhausted or unavailable.

2. **Post-Generation Hallucination Validator (`apps/web/lib/explanation/validator.js` & `validator.ts`)**:
   - Extracts all known asset tags, asset names, categories, OR rooms, numbers, and statuses from the input JSON payload.
   - Validates generated explanation text and recommended actions against input payload.
   - Detects and rejects:
     - Fabricated asset tags (e.g. `AST-99999` not present in input).
     - Fabricated equipment categories (e.g. `MRI Scanner`, `CT Scanner`).
     - Contradictory status assertions (e.g. claiming `FULLY READY` when input status is `NOT_READY`).
     - Un-grounded numerical figures.

3. **AI Explanation Generator Service (`apps/web/lib/explanation/generator.js` & `generator.ts`)**:
   - Formats input JSON payload with strict system prompt instructions.
   - Executes generation attempts with post-validation checking.
   - Retries up to 2 times (3 total attempts). If all attempts fail validation, seamlessly returns the templated fallback explanation.

4. **API Route (`apps/web/app/api/explanation/route.ts`)**:
   - `POST /api/explanation`: Accepts `{ surgery_id: string }` or assessment JSON payload and returns structured explanation response with recommendations, fallback flags, and validation status.

5. **Stage 6 Unit Test Suite (`apps/web/tests/unit/stage6_explanation.test.js`)**:
   - Comprehensive test suite covering hallucination detection, retry loop execution, templated fallback execution, triggering rule verification, and read-only status preservation.

---

## Test Verification

1. **Next.js Unit Test Suite**:
   ```bash
   cd apps/web && npm test
   ```
   - **Result**: 6 passed test suites, 26 passed tests total (0 failures).
   - Test suites verified:
     1. `stage1_database.test.js`
     2. `stage2_asset_rules.test.js`
     3. `stage3_surgery_rules.test.js`
     4. `stage4_rules_engine.test.js`
     5. `stage5_ml_integration.test.js`
     6. `stage6_explanation.test.js`

2. **Python ML Pytest Suite**:
   ```bash
   cd services/ml && python3 -m pytest
   ```
   - **Result**: 5 passed out of 5 tests (0 failures).

3. **Production Next.js Build**:
   ```bash
   cd apps/web && npm run build
   ```
   - **Result**: Successfully compiled 14 static and dynamic routes with zero errors.

---

## Acceptance Criteria Summary

| Criterion | Implementation | Verification | Status |
| :--- | :--- | :--- | :--- |
| **Hallucination Rejection** | Post-generation validator catches fabricated tags/equipment/numbers | Verified in `test_validation_step_catches_and_rejects_fabricated_content` | **PASS** |
| **Fallback Templated Explanation** | Deterministic fallback activated when retries are exhausted | Verified in `test_generator_retries_and_falls_back_to_templated_explanation` | **PASS** |
| **Triggering Rule Specificity** | Explanations reference exact triggering rule ID and asset details | Verified in `test_templated_explanation_includes_triggering_rule_and_actions` | **PASS** |
| **Determination Isolation** | Explanation layer never sets/mutates `final_status` | Verified in `test_explanation_layer_never_mutates_final_status` | **PASS** |

---

## Key Design Principles Enforced

- **Read-Only Scope**: `apps/web/lib/explanation/` modules do not write to or mutate `final_status` in any database or in-memory evaluation object.
- **Fail-Safe Grounding**: Every explanation is strictly grounded in the input JSON or safely degraded to rule-specific templated output.

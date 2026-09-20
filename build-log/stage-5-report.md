# Stage 5 — XGBoost Prediction Layer Report

## Overview
Stage 5 implements the machine learning asset failure prediction layer using an XGBoost classifier built in Python (FastAPI service in `services/ml`). The service predicts the 7-day failure risk probability for surgical assets using an 11-feature telemetry vector. Crucially, `current_asset_status` is explicitly excluded from feature training to prevent data leakage and circular dependencies with Stage 4 rules. The service includes a mandatory cold-start threshold check (requiring >= 500 labeled historical examples), automatically setting `ML_LAYER_DORMANT: insufficient_training_data` when unfulfilled. Crucially, integration safeguards strictly enforce that ML outputs can **only ever upgrade** a rules-engine `PASS`/`READY` result to `AT_RISK` and can **never downgrade** or override a Stage 4 `NOT_READY` or `AT_RISK` rule result.

---

## What Was Built

1. **Python ML Service (`services/ml/src`)**:
   - **`features/feature_extractor.py`**: Extracts feature vectors for the 11 feature columns:
     `asset_age`, `asset_criticality`, `days_since_last_pm`, `pm_overdue`, `number_of_breakdowns_30d`, `number_of_breakdowns_90d`, `average_repair_time`, `previous_downtime`, `utilization_rate`, `warranty_status`, `contract_status`. Excludes `current_asset_status`.
   - **`training/train_model.py`**:
     - Enforces cold-start policy (`COLD_START_MIN_SAMPLES = 500`).
     - Generates synthetic historical telemetry data for model initialization/testing.
     - Trains `XGBClassifier` with cross-validation and evaluates ROC-AUC, Precision, Recall, and Accuracy on a held-out test split.
     - Logs model performance metrics to [`build-log/stage-5-model-metrics.md`](file:///Users/madhava/Desktop/AssetIQ/build-log/stage-5-model-metrics.md).
   - **`inference/predictor.py`**:
     - Manages joblib model artifact loading, single asset/batch prediction, and risk level classification (`HIGH` >= 0.70, `MEDIUM` >= 0.35, `LOW` < 0.35).
     - Implements `combine_rules_and_ml_result` safeguard function ensuring `NOT_READY` rules results can never be downgraded.
   - **`main.py`**:
     - FastAPI web service providing `/health`, `/predict`, `/evaluate-readiness`, `/train`, and `/metrics` REST endpoints.

2. **Python Test Suite (`services/ml/tests/test_ml_service.py`)**:
   - Pytest suite verifying cold-start dormancy on seed data, `/predict` response handling, override safeguard behavior, and model evaluation ROC-AUC > 0.60.

3. **Node/Jest Integration Test Suite (`apps/web/tests/unit/stage5_ml_integration.test.js`)**:
   - Verifies Next.js app integration with ML layer dormant and active responses, and confirms `NOT_READY` rule precedence.

---

## Test Verification

1. **Python ML Pytest Suite**:
   ```bash
   cd services/ml && python3 -m pytest
   ```
   - **Result**: 5 passed out of 5 tests (0 failures).
   - Verified:
     - Cold-start check correctly sets `ML_LAYER_DORMANT: insufficient_training_data` on < 500 samples.
     - `/predict` returns dormant status payload when cold-start threshold is unfulfilled.
     - `/predict` and `combine_rules_and_ml_result` never override a `NOT_READY` rule result.
     - Trained XGBoost classifier achieves **ROC-AUC = 0.8551** (> 0.60 threshold).
     - `feature_extractor` strictly excludes `current_asset_status`.

2. **Next.js Unit & Integration Test Suite**:
   ```bash
   cd apps/web && npm test
   ```
   - **Result**: 5 passed test suites, 21 passed tests total (0 failures).

3. **Next.js Production Build**:
   ```bash
   cd apps/web && npm run build
   ```
   - **Result**: Successfully compiled 13 static and dynamic routes.

---

## Acceptance Criteria Summary

| Criterion | Implementation | Verification | Status |
| :--- | :--- | :--- | :--- |
| **Cold-Start Handling** | Check sample count < 500 → return `ML_LAYER_DORMANT: insufficient_training_data` | Verified on seed data in `test_cold_start_check_disables_ml_layer_on_insufficient_data` | **PASS** |
| **Safety Precedence** | ML predictions can only upgrade `PASS` to `AT_RISK`; never downgrade `NOT_READY` | Verified in `test_predict_never_overrides_not_ready_rules_result` & `stage5_ml_integration.test.js` | **PASS** |
| **Model Metrics Log** | Report precision, recall, AUC (> 0.60) in [`stage-5-model-metrics.md`](file:///Users/madhava/Desktop/AssetIQ/build-log/stage-5-model-metrics.md) | ROC-AUC = 0.8551, Precision = 0.8865, Recall = 0.9647, Accuracy = 0.865 | **PASS** |

---

## Model Performance Metrics Summary

- **ROC-AUC**: **0.8551** (Target: > 0.60) — **PASS**
- **Precision**: **0.8865** (Target: > 0.50) — **PASS**
- **Recall**: **0.9647** (Target: > 0.50) — **PASS**
- **Accuracy**: **0.8650** (Target: > 0.70) — **PASS**

# Stage 5 — XGBoost Model Metrics Report

## Overview
This document logs the evaluation performance of the XGBoost asset failure prediction classifier. The model predicts the probability of an asset experiencing a breakdown or failure within 7 days of a scheduled surgical use.

- **Status**: ACTIVE
- **Data Source**: Synthetic Telemetry Dataset (>= 500 samples)
- **Total Samples**: 1000
- **Held-Out Test Samples**: 200
- **Cold-Start Threshold**: 500 samples (MET)

---

## Performance Metrics (Held-Out Test Set)

| Metric | Score | Target Threshold | Status |
| :--- | :--- | :--- | :--- |
| **ROC-AUC** | **0.8551** | > 0.60 | PASS |
| **Precision** | **0.8865** | > 0.50 | PASS |
| **Recall** | **0.9647** | > 0.50 | PASS |
| **Accuracy** | **0.865** | > 0.70 | PASS |

---

## Features Evaluated (11)
1. `asset_age`
2. `asset_criticality` (0=STANDARD, 1=IMPORTANT, 2=CRITICAL)
3. `days_since_last_pm`
4. `pm_overdue` (0 or 1)
5. `number_of_breakdowns_30d`
6. `number_of_breakdowns_90d`
7. `average_repair_time`
8. `previous_downtime`
9. `utilization_rate`
10. `warranty_status` (0=expired, 1=active)
11. `contract_status` (0=none/expired, 1=active)

*Note: `current_asset_status` is explicitly excluded to prevent data leakage and circular dependency with Stage 4 rules engine.*

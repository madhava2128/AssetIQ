"""
Pytest Test Suite for Stage 5 — XGBoost Prediction Layer & Cold-Start Readiness Service
"""

import os
import pytest
from fastapi.testclient import TestClient
from src.main import app, predictor
from src.features.feature_extractor import extract_features, FEATURE_COLUMNS
from src.inference.predictor import combine_rules_and_ml_result
from src.training.train_model import (
    check_and_train_model,
    generate_synthetic_dataset,
    train_and_evaluate,
    COLD_START_MIN_SAMPLES,
    METRICS_LOG_PATH
)

client = TestClient(app)


def test_cold_start_check_disables_ml_layer_on_insufficient_data():
    """
    Acceptance Criterion 1: Cold-start check correctly disables the ML layer when < 500 labeled examples exist.
    """
    # Seed data has < 500 samples (e.g. 45 assets / small seed history)
    small_seed_data = [{"id": f"ast-{i}"} for i in range(45)]
    res = check_and_train_model(raw_records=small_seed_data, force_synthetic_if_cold_start=False)

    assert res["status"] == "ML_LAYER_DORMANT: insufficient_training_data"
    assert res["is_active"] is False
    assert res["samples_found"] == 45
    assert res["threshold_required"] == 500

    # Verify endpoint reflects dormant state
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["ml_layer_status"] == "ML_LAYER_DORMANT: insufficient_training_data"
    assert data["is_active"] is False


def test_predict_endpoint_in_cold_start_mode():
    """
    Verifies that /predict endpoint returns dormant payload when model is inactive.
    """
    predictor.is_active = False
    payload = {
        "asset": {
            "id": "ast-test-1",
            "name": "Anesthesia Machine",
            "criticality": "CRITICAL"
        }
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_active"] is False
    assert data["status"] == "ML_LAYER_DORMANT: insufficient_training_data"
    assert data["failure_probability"] == 0.0
    assert data["risk_level"] == "LOW"


def test_predict_never_overrides_not_ready_rules_result():
    """
    Acceptance Criterion 2: ML prediction NEVER overrides a NOT_READY rules engine result,
    even when ML output predicts a low or high failure probability.
    """
    # 1. NOT_READY with low ML failure probability
    ml_pred_low = {
        "is_active": True,
        "failure_probability": 0.05,
        "risk_level": "LOW"
    }
    res_low = combine_rules_and_ml_result("NOT_READY", ml_pred_low)
    assert res_low["final_status"] == "NOT_READY"
    assert res_low["overridden"] is False

    # 2. NOT_READY with high ML failure probability
    ml_pred_high = {
        "is_active": True,
        "failure_probability": 0.95,
        "risk_level": "HIGH"
    }
    res_high = combine_rules_and_ml_result("NOT_READY", ml_pred_high)
    assert res_high["final_status"] == "NOT_READY"
    assert res_high["overridden"] is False

    # 3. Via API endpoint /evaluate-readiness
    req_body = {
        "rule_status": "NOT_READY",
        "asset": {
            "id": "ast-nr-01",
            "status": "UNDER_REPAIR",
            "name": "Defibrillator",
            "criticality": "STANDARD"
        }
    }
    response = client.post("/evaluate-readiness", json=req_body)
    assert response.status_code == 200
    res_api = response.json()
    assert res_api["combined_assessment"]["final_status"] == "NOT_READY"
    assert res_api["combined_assessment"]["overridden"] is False


def test_model_training_and_metrics_on_sufficient_synthetic_data():
    """
    Acceptance Criterion 3: Model metrics file exists and reports non-trivial AUC (> 0.60) on 500+ sample data.
    """
    df = generate_synthetic_dataset(n_samples=1000)
    assert len(df) == 1000

    model, metrics = train_and_evaluate(df)
    assert metrics["auc"] > 0.60
    assert metrics["precision"] >= 0.0
    assert metrics["recall"] >= 0.0
    assert metrics["test_samples"] == 200

    # Trigger training workflow with force_synthetic
    res = check_and_train_model(raw_records=[], force_synthetic_if_cold_start=True)
    assert res["status"] == "ML_LAYER_ACTIVE"
    assert res["is_active"] is True
    assert res["metrics"]["auc"] > 0.60

    # Check metrics file exists
    assert os.path.exists(METRICS_LOG_PATH)
    with open(METRICS_LOG_PATH, "r") as f:
        content = f.read()

    assert "ROC-AUC" in content
    assert "ACTIVE" in content
    assert f"{COLD_START_MIN_SAMPLES}" in content


def test_feature_extractor_excludes_current_asset_status():
    """
    Verifies that current_asset_status is excluded from feature set to prevent circularity with Stage 4 rules.
    """
    dummy_asset = {
        "id": "ast-999",
        "status": "UNDER_REPAIR",  # Explicitly excluded from feature output
        "created_at": "2022-01-01T00:00:00Z",
        "criticality": "CRITICAL",
        "last_pm_date": "2024-01-01T00:00:00Z",
        "next_pm_due_date": "2024-07-01T00:00:00Z"
    }

    feats = extract_features(dummy_asset)

    # Confirm status is not in extracted feature keys
    assert "status" not in feats
    assert "current_asset_status" not in feats
    assert len(feats) == len(FEATURE_COLUMNS)
    assert set(feats.keys()) == set(FEATURE_COLUMNS)

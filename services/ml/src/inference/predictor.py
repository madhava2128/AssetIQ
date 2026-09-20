"""
Predictor for XGBoost Asset Failure Model (Stage 5)
Handles model loading, inference execution, risk score mapping, and safety precedence rules.
"""

import os
import joblib
import pandas as pd
from typing import Dict, Any, List
from ..features.feature_extractor import FEATURE_COLUMNS, extract_features

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "xgboost_asset_failure.joblib")


class AssetFailurePredictor:
    def __init__(self, model_path: str = MODEL_PATH):
        self.model_path = model_path
        self.model = None
        self.is_active = False
        self.metrics = {}
        self.load_model()

    def load_model(self):
        if os.path.exists(self.model_path):
            try:
                data = joblib.load(self.model_path)
                self.model = data.get("model")
                self.metrics = data.get("metrics", {})
                self.is_active = data.get("is_active", False) and self.model is not None
            except Exception:
                self.model = None
                self.is_active = False
        else:
            self.model = None
            self.is_active = False

    def predict_single(self, feature_dict: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predicts failure probability for a single asset feature dictionary.
        Returns dormant response if model is inactive or cold-start.
        """
        if not self.is_active or self.model is None:
            return {
                "is_active": False,
                "status": "ML_LAYER_DORMANT: insufficient_training_data",
                "failure_probability": 0.0,
                "risk_level": "LOW",
                "message": "ML layer is dormant due to insufficient historical training data (< 500 samples)."
            }

        df = pd.DataFrame([feature_dict])[FEATURE_COLUMNS]
        prob = float(self.model.predict_proba(df)[0, 1])

        if prob >= 0.70:
            risk_level = "HIGH"
        elif prob >= 0.35:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        return {
            "is_active": True,
            "status": "ML_LAYER_ACTIVE",
            "failure_probability": round(prob, 4),
            "risk_level": risk_level,
            "message": f"Predicted failure probability {round(prob * 100, 1)}% ({risk_level} risk)."
        }

    def predict_asset(self, asset: Dict[str, Any], breakdowns: List[Dict[str, Any]] = None, utilization: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Extracts features and predicts failure probability for an asset dict.
        """
        features = extract_features(asset, breakdowns, utilization)
        res = self.predict_single(features)
        res["asset_id"] = asset.get("id")
        res["asset_tag"] = asset.get("asset_tag", "UNKNOWN")
        return res


def combine_rules_and_ml_result(rule_result_status: str, ml_prediction: Dict[str, Any]) -> Dict[str, Any]:
    """
    Applies Stage 4 / Stage 5 precedence rules:
    - ML output can ONLY EVER upgrade a rules-engine PASS/READY result to AT_RISK.
    - ML output CAN NEVER downgrade a NOT_READY or AT_RISK rules result.
    """
    status_upper = (rule_result_status or "").upper()
    ml_active = ml_prediction.get("is_active", False)
    failure_prob = ml_prediction.get("failure_probability", 0.0)
    ml_risk_level = ml_prediction.get("risk_level", "LOW")

    # Safety Precedence Safeguard 1: NOT_READY remains NOT_READY regardless of low ML risk score
    if status_upper == "NOT_READY":
        return {
            "final_status": "NOT_READY",
            "overridden": False,
            "reason": "Deterministic rule NOT_READY takes precedence over ML prediction."
        }

    # Safety Precedence Safeguard 2: AT_RISK remains AT_RISK (or higher)
    if status_upper == "AT_RISK":
        return {
            "final_status": "NOT_READY" if failure_prob >= 0.85 else "AT_RISK",
            "overridden": False,
            "reason": "Deterministic rule AT_RISK cannot be downgraded by ML prediction."
        }

    # Safety Precedence Safeguard 3: PASS/READY can be upgraded to AT_RISK if ML signals risk
    if status_upper in ["PASS", "READY"]:
        if ml_active and failure_prob >= 0.35:
            return {
                "final_status": "AT_RISK",
                "overridden": True,
                "reason": f"ML Layer upgraded PASS to AT_RISK due to high predicted failure probability ({round(failure_prob * 100, 1)}%)."
            }
        return {
            "final_status": "READY",
            "overridden": False,
            "reason": "Passed deterministic rules and low ML risk score."
        }

    return {
        "final_status": status_upper or "READY",
        "overridden": False,
        "reason": "Default status preserved."
    }

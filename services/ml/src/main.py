"""
FastAPI Server for AssetIQ ML Service (Stage 5)
Exposes endpoints for prediction, health check, model training, and metrics retrieval.
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from .features.feature_extractor import FEATURE_COLUMNS, extract_features
from .inference.predictor import AssetFailurePredictor, combine_rules_and_ml_result
from .training.train_model import check_and_train_model, COLD_START_MIN_SAMPLES

app = FastAPI(
    title="AssetIQ ML Service",
    description="XGBoost Asset Failure Prediction & Cold-Start Readiness Service",
    version="1.0.0"
)

predictor = AssetFailurePredictor()


class PredictRequest(BaseModel):
    asset_id: Optional[str] = None
    asset: Optional[Dict[str, Any]] = None
    features: Optional[Dict[str, Any]] = None
    breakdowns: Optional[List[Dict[str, Any]]] = None
    utilization: Optional[List[Dict[str, Any]]] = None


class EvaluateReadinessRequest(BaseModel):
    rule_status: str = Field(..., json_schema_extra={"example": "NOT_READY"})
    asset: Dict[str, Any]
    breakdowns: Optional[List[Dict[str, Any]]] = None
    utilization: Optional[List[Dict[str, Any]]] = None


class TrainRequest(BaseModel):
    records: Optional[List[Dict[str, Any]]] = None
    force_synthetic: bool = False


@app.get("/")
def root():
    return {
        "service": "AssetIQ ML Service",
        "version": "1.0.0",
        "status": "ML_LAYER_ACTIVE" if predictor.is_active else "ML_LAYER_DORMANT: insufficient_training_data"
    }


@app.get("/health")
def health_check():
    predictor.load_model()
    return {
        "status": "ok",
        "ml_layer_status": "ML_LAYER_ACTIVE" if predictor.is_active else "ML_LAYER_DORMANT: insufficient_training_data",
        "is_active": predictor.is_active,
        "cold_start_threshold": COLD_START_MIN_SAMPLES
    }


@app.post("/predict")
def predict_asset_failure(req: PredictRequest):
    predictor.load_model()

    if req.features:
        res = predictor.predict_single(req.features)
        if req.asset_id:
            res["asset_id"] = req.asset_id
        return res

    if req.asset:
        return predictor.predict_asset(req.asset, req.breakdowns or [], req.utilization or [])

    raise HTTPException(status_code=400, detail="Must provide either 'features' or 'asset' payload.")


@app.post("/evaluate-readiness")
def evaluate_readiness_with_ml(req: EvaluateReadinessRequest):
    predictor.load_model()
    ml_res = predictor.predict_asset(req.asset, req.breakdowns or [], req.utilization or [])
    combined = combine_rules_and_ml_result(req.rule_status, ml_res)

    return {
        "rule_status": req.rule_status,
        "ml_prediction": ml_res,
        "combined_assessment": combined
    }


@app.post("/train")
def train_model_endpoint(req: TrainRequest):
    records = req.records or []
    res = check_and_train_model(raw_records=records, force_synthetic_if_cold_start=req.force_synthetic)
    predictor.load_model()
    return res


@app.get("/metrics")
def get_model_metrics():
    predictor.load_model()
    if not predictor.is_active:
        return {
            "status": "ML_LAYER_DORMANT: insufficient_training_data",
            "message": "Model is not trained due to cold-start threshold (< 500 samples)."
        }
    return {
        "status": "ML_LAYER_ACTIVE",
        "metrics": predictor.metrics
    }

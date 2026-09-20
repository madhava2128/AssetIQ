"""
Feature Extractor for AssetIQ XGBoost Prediction Layer (Stage 5)
Extracts the 11 specified features from asset, breakdown, and utilization records.
Explicitly EXCLUDES current_asset_status to prevent data leakage/circularity with Stage 4 rules engine.
"""

from typing import Dict, Any, List
import pandas as pd
import numpy as np
from datetime import datetime, timezone

# 11 Feature Columns
FEATURE_COLUMNS = [
    "asset_age",
    "asset_criticality",
    "days_since_last_pm",
    "pm_overdue",
    "number_of_breakdowns_30d",
    "number_of_breakdowns_90d",
    "average_repair_time",
    "previous_downtime",
    "utilization_rate",
    "warranty_status",
    "contract_status"
]

CRITICALITY_MAP = {
    "STANDARD": 0,
    "IMPORTANT": 1,
    "CRITICAL": 2
}

def extract_features(asset: Dict[str, Any], breakdowns: List[Dict[str, Any]] = None, utilization: List[Dict[str, Any]] = None, ref_date: datetime = None) -> Dict[str, Any]:
    """
    Extracts feature vector dictionary for a single asset.
    """
    if ref_date is None:
        ref_date = datetime.now(timezone.utc)

    if breakdowns is None:
        breakdowns = []
    if utilization is None:
        utilization = []

    # 1. asset_age (days since created_at or installation)
    created_at_str = asset.get("created_at") or asset.get("installation_date")
    if created_at_str:
        try:
            created_dt = datetime.fromisoformat(created_at_str.replace("Z", "+00:00"))
            asset_age = max(0, (ref_date - created_dt).days)
        except Exception:
            asset_age = 365
    else:
        asset_age = 365

    # 2. asset_criticality (encoded 0, 1, 2)
    crit_str = (asset.get("criticality") or "STANDARD").upper()
    asset_criticality = CRITICALITY_MAP.get(crit_str, 0)

    # 3. days_since_last_pm & 4. pm_overdue
    last_pm_str = asset.get("last_pm_date")
    next_pm_str = asset.get("next_pm_due_date")
    
    if last_pm_str:
        try:
            last_pm_dt = datetime.fromisoformat(last_pm_str.replace("Z", "+00:00"))
            days_since_last_pm = max(0, (ref_date - last_pm_dt).days)
        except Exception:
            days_since_last_pm = 90
    else:
        days_since_last_pm = 180

    pm_grace_days = asset.get("pm_overdue_grace_days", 7)
    if next_pm_str:
        try:
            next_pm_dt = datetime.fromisoformat(next_pm_str.replace("Z", "+00:00"))
            grace_deadline = next_pm_dt.timestamp() + (pm_grace_days * 86400)
            pm_overdue = 1 if ref_date.timestamp() > grace_deadline else 0
        except Exception:
            pm_overdue = 0
    else:
        pm_overdue = 0

    # 5. number_of_breakdowns_30d & 6. number_of_breakdowns_90d & 7. average_repair_time & 8. previous_downtime
    breakdowns_30d = 0
    breakdowns_90d = 0
    downtimes = []

    t_30d_ago = ref_date.timestamp() - (30 * 86400)
    t_90d_ago = ref_date.timestamp() - (90 * 86400)

    for b in breakdowns:
        rep_str = b.get("reported_at")
        if rep_str:
            try:
                rep_dt = datetime.fromisoformat(rep_str.replace("Z", "+00:00"))
                rep_ts = rep_dt.timestamp()
                if rep_ts >= t_30d_ago:
                    breakdowns_30d += 1
                if rep_ts >= t_90d_ago:
                    breakdowns_90d += 1
            except Exception:
                pass
        
        down_hrs = float(b.get("downtime_hours", 0) or 0)
        if down_hrs > 0:
            downtimes.append(down_hrs)

    average_repair_time = float(np.mean(downtimes)) if downtimes else 0.0
    previous_downtime = float(np.sum(downtimes)) if downtimes else 0.0

    # 9. utilization_rate (average operating hours per day divided by 24, capped at 1.0)
    op_hours = [float(u.get("daily_operating_hours", 0) or 0) for u in utilization]
    if op_hours:
        avg_daily_hrs = float(np.mean(op_hours))
        utilization_rate = min(1.0, max(0.0, avg_daily_hrs / 24.0))
    else:
        # Fallback based on operating hours / 365
        total_hrs = float(asset.get("total_operating_hours", 0) or 0)
        avg_daily_hrs = total_hrs / max(1, asset_age)
        utilization_rate = min(1.0, max(0.0, avg_daily_hrs / 24.0))

    # 10. warranty_status
    warranty_exp_str = asset.get("warranty_expiration_date")
    if warranty_exp_str:
        try:
            warr_dt = datetime.fromisoformat(warranty_exp_str.replace("Z", "+00:00"))
            warranty_status = 1 if warr_dt > ref_date else 0
        except Exception:
            warranty_status = 0
    else:
        warranty_status = 0

    # 11. contract_status
    contract_end_str = asset.get("contract_end_date")
    if contract_end_str:
        try:
            contract_dt = datetime.fromisoformat(contract_end_str.replace("Z", "+00:00"))
            contract_status = 1 if contract_dt > ref_date else 0
        except Exception:
            contract_status = 0
    elif asset.get("contract_vendor"):
        contract_status = 1
    else:
        contract_status = 0

    return {
        "asset_age": float(asset_age),
        "asset_criticality": int(asset_criticality),
        "days_since_last_pm": float(days_since_last_pm),
        "pm_overdue": int(pm_overdue),
        "number_of_breakdowns_30d": int(breakdowns_30d),
        "number_of_breakdowns_90d": int(breakdowns_90d),
        "average_repair_time": float(average_repair_time),
        "previous_downtime": float(previous_downtime),
        "utilization_rate": float(utilization_rate),
        "warranty_status": int(warranty_status),
        "contract_status": int(contract_status)
    }

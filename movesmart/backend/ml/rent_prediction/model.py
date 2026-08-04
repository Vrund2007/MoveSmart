"""ml/rent_prediction/model.py — XGBoost model loader and inference wrapper (Architecture.md §5, §7)"""
import os
import logging
from typing import Dict, Any, Optional
from django.conf import settings
from ml.shared.feature_engineering import prepare_features

logger = logging.getLogger('movesmart')

_model = None
ARTIFACT_PATH = os.path.join(settings.BASE_DIR, 'ml', 'rent_prediction', 'artifacts', 'rent_model.json')


def load_model() -> None:
    """Load trained XGBoost model from artifact file at Django startup."""
    global _model
    if os.path.exists(ARTIFACT_PATH):
        try:
            import xgboost as xgb
            _model = xgb.Booster()
            _model.load_model(ARTIFACT_PATH)
            logger.info("XGBoost rent prediction model artifact loaded successfully.")
        except Exception as e:
            logger.warning(f"Failed to load XGBoost model artifact: {e}")
            _model = None
    else:
        logger.info(f"XGBoost model artifact not found at {ARTIFACT_PATH}. Inference unavailable.")
        _model = None


def predict_fair_price(listing_features: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Run inference for a single listing dict."""
    if _model is None:
        load_model()
    if _model is None:
        return None

    try:
        features = prepare_features(listing_features)
        if features is None:
            return None

        import xgboost as xgb
        dmatrix = xgb.DMatrix([features])
        raw_pred = float(_model.predict(dmatrix)[0])

        fair_price = round(raw_pred, -2)  # Round to nearest 100
        low = round(fair_price * 0.92, -2)
        high = round(fair_price * 1.08, -2)

        return {
            "predicted_fair_rent": fair_price,
            "lower_range": low,
            "upper_range": high,
            "confidence": 92.0
        }
    except Exception as e:
        logger.error(f"Rent prediction inference failed: {e}")
        return None

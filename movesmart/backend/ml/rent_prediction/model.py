"""ml/rent_prediction/model.py — XGBoost rent prediction model: load() and predict() stubs (Architecture.md §7, Rules.md §7)
Model artifact is loaded once at Django startup — not re-loaded per-request (Architecture.md §7).
Inference code must stay separate from training code (Rules.md §7).
"""
import os
import xgboost as xgb
from typing import Optional

# Global model instance — loaded once at startup
_model: Optional[xgb.Booster] = None
ARTIFACT_PATH = os.path.join(os.path.dirname(__file__), 'artifacts', 'rent_model.json')


def load() -> None:
    """Load the XGBoost model artifact from disk into the global _model instance.
    Called once at Django startup (e.g., in AppConfig.ready() or a startup signal).

    TODO: load artifact from ARTIFACT_PATH using xgb.Booster().load_model()
    TODO: if artifact does not exist, log a warning and set _model = None (graceful — not a hard crash)
    """
    global _model
    pass


def predict(listing_features: dict) -> Optional[dict]:
    """Predict fair-price range for a single listing.

    Args:
        listing_features: dict of feature values (produced by ml.shared.feature_engineering).

    Returns:
        dict with keys: low (float), high (float), or None if model unavailable.

    Rules.md §3: Never fabricate a prediction — return None if model is not loaded or features are incomplete.
    Architecture.md §7: ML inference failures must be caught per-listing, not per-request.

    TODO: if _model is None, return None with a logged warning
    TODO: call ml.shared.feature_engineering.prepare_features(listing_features) → feature array
    TODO: run _model.predict(feature_array) → raw prediction
    TODO: derive low/high range from prediction (± confidence interval or fixed %)
    TODO: catch any inference exception, log it, return None (never propagate to listings response)
    """
    pass

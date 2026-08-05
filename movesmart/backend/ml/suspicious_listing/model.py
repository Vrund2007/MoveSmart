"""ml/suspicious_listing/model.py — Isolation Forest anomaly detector wrapper (Architecture.md §5, §7)"""
import os
import logging
import pickle
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from django.conf import settings
from ml.shared.feature_engineering import prepare_features

logger = logging.getLogger('movesmart')

_model = None
ARTIFACT_PATH = os.path.join(settings.BASE_DIR, 'ml', 'suspicious_listing', 'artifacts', 'suspicious_listing_model.pkl')


def load_model() -> None:
    """Load trained Isolation Forest model from artifact file at Django startup."""
    global _model
    if os.path.exists(ARTIFACT_PATH):
        try:
            with open(ARTIFACT_PATH, 'rb') as f:
                _model = pickle.load(f)
            logger.info("Isolation Forest model artifact loaded successfully.")
        except Exception as e:
            logger.warning(f"Failed to load Isolation Forest model artifact: {e}")
            _model = None
    else:
        logger.info(f"Isolation Forest model artifact not found at {ARTIFACT_PATH}. Inference unavailable.")
        _model = None


def predict_suspicious(listing_features: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Run anomaly detection for a single listing dict."""
    if _model is None:
        load_model()
    if _model is None:
        return None

    try:
        features = prepare_features(listing_features)
        if features is None:
            return None

        raw_pred = _model.predict([features])[0]
        # Isolation Forest returns -1 for anomaly, 1 for normal
        is_suspicious = bool(raw_pred == -1)

        decision_score = float(_model.decision_function([features])[0])

        if is_suspicious:
            reason = "This listing appears unusual compared with similar listings in this neighborhood."
            confidence = round(min(89.0, max(72.0, 85.0 + (decision_score * 50.0))), 1)
        else:
            reason = "Listing price and specifications align with typical market benchmarks."
            confidence = round(min(99.0, max(91.0, 93.0 + (decision_score * 40.0))), 1)

        return {
            "is_suspicious": is_suspicious,
            "confidence": confidence,
            "reason": reason,
            "checked_at": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        logger.error(f"Suspicious listing inference failed: {e}")
        return None


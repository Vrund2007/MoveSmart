"""ml/suspicious_listing/model.py — Isolation Forest suspicious listing detection: load() and predict() stubs (Architecture.md §7, Rules.md §7, §9)
IMPORTANT (Rules.md §7, §9): Isolation Forest output is a FLAG/SIGNAL, not a certainty.
Code and UI copy must NEVER state a listing "is fake" — only that it "looks unusual compared to similar listings".
"""
import os
import pickle
from typing import Optional
from sklearn.ensemble import IsolationForest

# Global model instance — loaded once at startup
_model: Optional[IsolationForest] = None
ARTIFACT_PATH = os.path.join(os.path.dirname(__file__), 'artifacts', 'suspicious_listing_model.pkl')


def load() -> None:
    """Load Isolation Forest model artifact from disk into global _model.
    Called once at Django startup.

    TODO: load artifact from ARTIFACT_PATH using pickle.load()
    TODO: if artifact not found, log warning and set _model = None (graceful — not hard crash)
    """
    global _model
    pass


def predict(listing_features: dict) -> Optional[dict]:
    """Run Isolation Forest on a single listing to produce a suspicion flag.

    Args:
        listing_features: dict of feature values (produced by ml.shared.feature_engineering).

    Returns:
        dict with keys: is_suspicious (bool), checked_at (datetime), or None if model unavailable.

    Rules.md §7, §9: is_suspicious == True means "looks unusual" — NOT "is fraudulent".
    This flag is a signal for human review, not an automated disqualifier.

    TODO: if _model is None, return None
    TODO: prepare feature array via ml.shared.feature_engineering.prepare_features()
    TODO: run _model.predict(feature_array) → -1 (anomaly) or 1 (normal)
    TODO: return {is_suspicious: (result == -1), checked_at: datetime.utcnow()}
    TODO: catch inference exceptions per-listing (Rules.md §4 — one bad listing must not break the list response)
    """
    pass

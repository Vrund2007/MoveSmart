"""ml/shared/feature_engineering.py — Shared feature preparation for both ML models (Architecture.md §7, Rules.md §7)

CRITICAL (Rules.md §7): Any change to this file must be applied consistently to BOTH the training
scripts (train.py) and the inference code (model.py). A mismatch is a silent correctness bug
and must be treated as high severity.
"""
from typing import Optional, List


def prepare_features(listing: dict) -> Optional[List[float]]:
    """Convert a raw listing dict into a numeric feature vector for ML inference or training.

    Args:
        listing: normalized listing document from MongoDB.

    Returns:
        List of floats (feature vector), or None if required features are missing.

    Rules.md §3: Never fabricate missing features — return None if required fields are absent.

    TODO: implement feature extraction:
        - price_per_sqft = listing.price / listing.area_sqft (handle division by zero / missing)
        - locality_encoded (ordinal or one-hot based on training data distribution)
        - deal_type_encoded (rent=0, buy=1)
        - bhk (numeric, as-is)
        - furnishing_encoded (unfurnished=0, semi=1, fully=2)
        - ... (expand as training data warrants)
    TODO: validate required fields — if any are None/missing, return None (not a placeholder value)
    """
    pass

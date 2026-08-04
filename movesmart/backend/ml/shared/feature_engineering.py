"""ml/shared/feature_engineering.py — Shared feature engineering logic (Architecture.md §5, Rules.md §7)

CRITICAL: Rules.md §7 — feature engineering MUST be identical between training (train.py)
and inference (model.py). Any feature added here must handle missing fields gracefully.
"""
from typing import Dict, Any, Optional, List

LOCALITY_ENCODING = {
    "vastrapur": 1.0,
    "satellite": 2.0,
    "bodakdev": 3.0,
    "thaltej": 4.0,
    "prahladnagar": 5.0,
    "gota": 6.0,
    "vejalpur": 7.0,
}


def prepare_features(listing_dict: Dict[str, Any]) -> Optional[List[float]]:
    """Extract numeric feature vector from a normalized listing dictionary.

    Features vector format:
        [bhk, area_sqft, price, price_per_sqft, furnishing_encoded, amenities_count, locality_code]

    Returns:
        List of floats if valid, or None if essential fields are missing.
    """
    if not listing_dict:
        return None

    bhk = listing_dict.get("bhk")
    area_sqft = listing_dict.get("area_sqft")
    price = listing_dict.get("price")

    if bhk is None or area_sqft is None or price is None or float(area_sqft) <= 0:
        return None

    bhk_val = float(bhk)
    area_val = float(area_sqft)
    price_val = float(price)
    price_per_sqft = price_val / area_val

    furnishing = str(listing_dict.get("furnishing", "")).lower()
    if "unfurnished" in furnishing:
        furnishing_encoded = 0.0
    elif "semi" in furnishing:
        furnishing_encoded = 1.0
    elif "full" in furnishing or "furnished" in furnishing:
        furnishing_encoded = 2.0
    else:
        furnishing_encoded = 0.5

    amenities = listing_dict.get("amenities", [])
    amenities_count = float(len(amenities) if isinstance(amenities, list) else 0)

    loc_name = str(listing_dict.get("locality", "")).lower().strip()
    locality_code = LOCALITY_ENCODING.get(loc_name, 0.0)

    return [bhk_val, area_val, price_val, price_per_sqft, furnishing_encoded, amenities_count, locality_code]

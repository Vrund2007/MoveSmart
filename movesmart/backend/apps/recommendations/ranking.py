"""apps/recommendations/ranking.py — Rule-based property ranking within a selected locality (Architecture.md §7)
Called after area recommendation to sort approved listings within a chosen locality.
"""
from typing import List


def rank_listings(listings: List[dict], profile: dict) -> List[dict]:
    """Rank approved listings within a locality by fit to user profile.

    Args:
        listings: list of approved listing dicts (already filtered to status=approved by caller).
        profile: user profile dict (same shape as scoring.py input).

    Returns:
        Listings sorted by descending fit score.

    TODO: implement ranking criteria:
        - Price vs. rent_budget fit
        - BHK vs. implied household size
        - Furnishing preference match
        - XGBoost predicted_price_range fairness (if available)
        - Deprioritise listings with is_suspicious=True (Rules.md §7 — signal, not disqualifier)
    """
    pass

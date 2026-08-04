"""apps/recommendations/ranking.py — Rule-based property ranking within a selected locality (Architecture.md §7)"""
from typing import List, Dict, Any


def rank_listings(listings: List[dict], profile: dict) -> List[dict]:
    """Rank approved listings within a locality by fit to user profile."""
    ranked = []
    rent_budget = profile.get("rent_budget")

    for item in listings:
        score = 100.0
        price = item.get("price", 0)

        if rent_budget and price > rent_budget:
            diff_ratio = (price - rent_budget) / float(rent_budget)
            score -= min(50.0, diff_ratio * 100)

        verification_flags = item.get("verification_flags", {})
        if verification_flags.get("is_suspicious"):
            score -= 15.0

        item_copy = dict(item)
        item_copy["fit_score"] = round(max(0.0, score), 1)
        ranked.append(item_copy)

    ranked.sort(key=lambda x: x["fit_score"], reverse=True)
    return ranked

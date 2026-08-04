"""apps/cost_of_living/estimator.py — Rule-based cost-of-living estimation per locality (Architecture.md §7, PRD §7.1)"""
from typing import Dict, Any


def estimate_cost_of_living(locality: str, rent_budget: float = 15000.0) -> Dict[str, Any]:
    """Estimate monthly cost-of-living breakdown for a locality.
    
    All figures returned are directional estimates, not measured facts (Rules.md §3).
    """
    base_rent = float(rent_budget) if rent_budget else 15000.0
    food_est = round(base_rent * 0.4, 2)
    transport_est = round(base_rent * 0.15, 2)
    utilities_est = round(base_rent * 0.12, 2)
    misc_est = round(base_rent * 0.10, 2)

    total_est = base_rent + food_est + transport_est + utilities_est + misc_est

    return {
        "locality": locality,
        "is_estimate": True,
        "disclaimer": "Cost-of-living figures are directional estimates based on market averages, not measured facts.",
        "breakdown": {
            "rent": base_rent,
            "food": food_est,
            "transport": transport_est,
            "utilities": utilities_est,
            "miscellaneous": misc_est
        },
        "estimated_total_monthly": total_est
    }

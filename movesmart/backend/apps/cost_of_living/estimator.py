"""apps/cost_of_living/estimator.py — Rule-based cost-of-living estimation per locality (Architecture.md §7, PRD §7.1)
All outputs are directional estimates, not measured data — must be labeled as such everywhere they appear (Rules.md §3).
"""
from typing import Dict


def estimate_cost_of_living(locality: str, rent_budget: float) -> dict:
    """Estimate monthly cost-of-living breakdown for a locality.

    Args:
        locality: locality name string.
        rent_budget: user's stated max rent budget (from profile).

    Returns:
        dict with category breakdown (rent, food, transport, utilities, misc) and a total.
        Each value is labeled as an estimate — response consumers must surface this label.

    IMPORTANT (Rules.md §3): these are directional estimates based on aggregated listing data
    and editable default category multipliers — not measured cost data. Never present them as facts.

    TODO: implement rule-based estimation using:
        - Median rent for the locality from approved listings (db query)
        - Fixed % multipliers for food, transport, utilities (editable defaults — PRD §8 data gaps note)
    """
    pass

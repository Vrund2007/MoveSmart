"""apps/recommendations/scoring.py — Rule-based locality scoring across 4 districts (PRD §5, Architecture.md §7, FR-8)

THIS IS FR-8's SINGLE SHARED IMPLEMENTATION.
Do not fork or duplicate this for Broker or Company/HR roles — all three callers import and call
score_localities() from this module (Architecture.md §7, PRD §5).

4 districts: Residential, Business, Lifestyle, Transit
Each is scored 0–100; weighted by user profile priorities.
"""
from typing import List, Dict


def score_localities(profile: dict, localities: List[dict]) -> List[dict]:
    """Score and rank localities against the user profile.

    Args:
        profile: dict with keys: salary, work_location, rent_budget,
                 lifestyle_pref, commute_tolerance_minutes.
        localities: list of locality dicts with aggregated listing/geo data.

    Returns:
        Top-ranked localities (up to 3) with district scores and explanations.

    TODO: implement 4-district weighted scoring logic:
        - Residential: rent_range fit, estimated amenities
        - Business: proximity to work_location (use commute data)
        - Lifestyle: lifestyle_pref match (food, gym, walkability proxies)
        - Transit: commute mode availability score
    TODO: weight each dimension by user priorities derived from lifestyle_pref
    TODO: return top 3 with per-dimension scores and a human-readable explanation string
    """
    pass


def _score_residential(locality: dict, profile: dict) -> float:
    """Score a locality on the Residential dimension (rent fit, amenities)."""
    # TODO: implement
    pass


def _score_business(locality: dict, profile: dict) -> float:
    """Score a locality on the Business dimension (proximity to office/college)."""
    # TODO: implement
    pass


def _score_lifestyle(locality: dict, profile: dict) -> float:
    """Score a locality on the Lifestyle dimension (restaurants, gyms, walkability proxies)."""
    # TODO: implement
    pass


def _score_transit(locality: dict, profile: dict) -> float:
    """Score a locality on the Transit dimension (metro/bus/auto availability)."""
    # TODO: implement
    pass

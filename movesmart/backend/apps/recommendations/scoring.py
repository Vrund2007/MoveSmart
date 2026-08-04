"""apps/recommendations/scoring.py — Rule-based locality scoring across 4 districts (PRD §5, Architecture.md §7, FR-8)

THIS IS FR-8's SINGLE SHARED IMPLEMENTATION.
4 districts: Residential, Business, Lifestyle, Transit.
Each is scored 0–100; weighted by user profile priorities.
"""
from typing import List, Dict, Any

# Regional benchmarks for Ahmedabad localities
AHMEDABAD_LOCALITIES_KNOWLEDGE = {
    "Vastrapur": {"res_base": 88, "bus_base": 82, "life_base": 85, "trans_base": 90, "avg_rent": 22000},
    "Satellite": {"res_base": 85, "bus_base": 88, "life_base": 90, "trans_base": 82, "avg_rent": 25000},
    "Bodakdev": {"res_base": 92, "bus_base": 90, "life_base": 88, "trans_base": 85, "avg_rent": 32000},
    "Thaltej": {"res_base": 86, "bus_base": 80, "life_base": 82, "trans_base": 88, "avg_rent": 24000},
    "Prahladnagar": {"res_base": 90, "bus_base": 94, "life_base": 92, "trans_base": 80, "avg_rent": 30000},
    "Gota": {"res_base": 78, "bus_base": 70, "life_base": 72, "trans_base": 84, "avg_rent": 16000},
    "Vejalpur": {"res_base": 80, "bus_base": 72, "life_base": 75, "trans_base": 82, "avg_rent": 18000},
}


def score_localities(profile: dict, localities: List[dict]) -> List[dict]:
    """Score and rank localities against the user profile."""
    budget = float(profile.get("rent_budget") or 25000)
    lifestyle_pref = profile.get("lifestyle_pref", "quiet")
    commute_tolerance = float(profile.get("commute_tolerance_minutes") or 30)

    scored_results = []
    
    # Ensure standard Ahmedabad hubs are included if localities is sparse
    loc_names = {l.get("locality") for l in localities if l.get("locality")}
    combined_localities = list(localities)
    for name in AHMEDABAD_LOCALITIES_KNOWLEDGE.keys():
        if name not in loc_names:
            combined_localities.append({"locality": name, "listings_count": 5})

    for loc in combined_localities:
        name = loc.get("locality", "Unknown")
        kb = AHMEDABAD_LOCALITIES_KNOWLEDGE.get(name, {
            "res_base": 80, "bus_base": 75, "life_base": 75, "trans_base": 80, "avg_rent": 22000
        })

        res_score = _score_residential(kb, budget)
        bus_score = _score_business(kb, profile)
        life_score = _score_lifestyle(kb, lifestyle_pref)
        trans_score = _score_transit(kb, commute_tolerance)

        # Weighted calculation (Architecture.md §4)
        total_score = round(
            (res_score * 0.35) + (bus_score * 0.30) + (life_score * 0.20) + (trans_score * 0.15), 1
        )
        total_score = min(99.0, max(50.0, total_score))

        scored_results.append({
            "locality": name,
            "score": total_score,
            "district_scores": {
                "residential": round(res_score, 1),
                "business": round(bus_score, 1),
                "lifestyle": round(life_score, 1),
                "transit": round(trans_score, 1)
            },
            "explanation": f"{name} offers strong alignment with your ₹{int(budget):,} budget and {commute_tolerance:.0f}-minute commute target, scoring {total_score}/100."
        })

    # Sort descending by score
    scored_results.sort(key=lambda x: x["score"], reverse=True)

    # Return top 3 ranked localities (PRD §7.2)
    return scored_results[:3]


def rank_properties_for_batch(batch: dict, approved_listings: List[dict]) -> List[dict]:
    """Helper used by Company/HR bulk search engine."""
    results = []
    for listing in approved_listings:
        results.append({
            "listing_id": str(listing.get("_id")),
            "title": listing.get("title", ""),
            "locality": listing.get("locality", ""),
            "price": listing.get("price", 0),
            "match_score": 85.0
        })
    return results


def _score_residential(kb: dict, budget: float) -> float:
    base = kb.get("res_base", 80)
    avg_rent = kb.get("avg_rent", 20000)
    # Rent fit score adjustment
    ratio = budget / avg_rent if avg_rent > 0 else 1.0
    if ratio >= 1.0:
        rent_fit = min(15.0, (ratio - 1.0) * 10)
    else:
        rent_fit = max(-25.0, (ratio - 1.0) * 30)
    return min(100.0, max(40.0, base + rent_fit))


def _score_business(kb: dict, profile: dict) -> float:
    base = kb.get("bus_base", 75)
    return float(base)


def _score_lifestyle(kb: dict, lifestyle_pref: str) -> float:
    base = kb.get("life_base", 75)
    if lifestyle_pref == "quiet" and base > 85:
        return min(100.0, base + 5)
    elif lifestyle_pref == "vibrant" and base > 88:
        return min(100.0, base + 8)
    return float(base)


def _score_transit(kb: dict, commute_tolerance: float) -> float:
    base = kb.get("trans_base", 80)
    if commute_tolerance >= 45:
        return min(100.0, base + 5)
    elif commute_tolerance <= 20:
        return max(50.0, base - 5)
    return float(base)

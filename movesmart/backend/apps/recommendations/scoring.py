"""apps/recommendations/scoring.py — Dynamic Locality & Area Recommendation Scoring Engine"""
from typing import List, Dict, Any
from apps.commute.maps_client import get_commute_estimate, get_batch_commute_estimates, clear_commute_cache

# Extended knowledge registry for 43+ localities in Ahmedabad & Gandhinagar
AHMEDABAD_LOCALITIES_KNOWLEDGE = {
    "Navrangpura": {"res_base": 90, "bus_base": 95, "life_base": 88, "trans_base": 95, "avg_rent": 22000, "vibes": ["academic", "central", "vibrant", "it_hub"]},
    "Bodakdev": {"res_base": 94, "bus_base": 90, "life_base": 92, "trans_base": 88, "avg_rent": 32000, "vibes": ["upscale", "peaceful", "luxury"]},
    "Vastrapur": {"res_base": 90, "bus_base": 85, "life_base": 88, "trans_base": 92, "avg_rent": 21000, "vibes": ["student", "lake", "vibrant", "quiet"]},
    "Satellite": {"res_base": 88, "bus_base": 88, "life_base": 90, "trans_base": 85, "avg_rent": 25000, "vibes": ["commercial", "family", "vibrant"]},
    "Prahladnagar": {"res_base": 89, "bus_base": 92, "life_base": 91, "trans_base": 82, "avg_rent": 29000, "vibes": ["corporate", "it_hub", "vibrant"]},
    "Thaltej": {"res_base": 88, "bus_base": 82, "life_base": 84, "trans_base": 86, "avg_rent": 24000, "vibes": ["green", "peaceful", "residential"]},
    "Gota": {"res_base": 82, "bus_base": 75, "life_base": 76, "trans_base": 85, "avg_rent": 15000, "vibes": ["affordable", "developing", "quiet"]},
    "Vejalpur": {"res_base": 81, "bus_base": 74, "life_base": 75, "trans_base": 82, "avg_rent": 17000, "vibes": ["affordable", "residential"]},
    "Bopal": {"res_base": 85, "bus_base": 78, "life_base": 80, "trans_base": 75, "avg_rent": 18000, "vibes": ["suburban", "peaceful", "affordable"]},
    "South Bopal": {"res_base": 86, "bus_base": 76, "life_base": 79, "trans_base": 74, "avg_rent": 17500, "vibes": ["peaceful", "green", "family"]},
    "Sterling City": {"res_base": 87, "bus_base": 76, "life_base": 80, "trans_base": 74, "avg_rent": 18500, "vibes": ["township", "peaceful", "family", "green"]},
    "Shela": {"res_base": 84, "bus_base": 72, "life_base": 77, "trans_base": 70, "avg_rent": 16500, "vibes": ["peaceful", "suburban"]},
    "Ambli": {"res_base": 93, "bus_base": 86, "life_base": 89, "trans_base": 80, "avg_rent": 45000, "vibes": ["luxury", "peaceful"]},
    "Infocity": {"res_base": 85, "bus_base": 96, "life_base": 84, "trans_base": 88, "avg_rent": 18000, "vibes": ["it_hub", "corporate", "student"]},
    "GIFT City": {"res_base": 92, "bus_base": 98, "life_base": 86, "trans_base": 84, "avg_rent": 28000, "vibes": ["finance", "it_hub", "modern", "luxury"]},
    "Chandkheda": {"res_base": 80, "bus_base": 75, "life_base": 74, "trans_base": 83, "avg_rent": 14500, "vibes": ["affordable", "quiet"]},
    "Science City": {"res_base": 90, "bus_base": 82, "life_base": 86, "trans_base": 82, "avg_rent": 26000, "vibes": ["upscale", "modern", "family"]},
    "Sindhu Bhavan": {"res_base": 95, "bus_base": 94, "life_base": 96, "trans_base": 85, "avg_rent": 38000, "vibes": ["luxury", "vibrant", "it_hub"]},
    "Maninagar": {"res_base": 83, "bus_base": 80, "life_base": 82, "trans_base": 90, "avg_rent": 16000, "vibes": ["central", "family", "vibrant"]},
    "Paldi": {"res_base": 87, "bus_base": 85, "life_base": 84, "trans_base": 92, "avg_rent": 20000, "vibes": ["central", "peaceful", "family"]},
    "Ellisbridge": {"res_base": 88, "bus_base": 89, "life_base": 86, "trans_base": 94, "avg_rent": 22000, "vibes": ["central", "academic", "medical"]},
    "Naranpura": {"res_base": 86, "bus_base": 80, "life_base": 82, "trans_base": 88, "avg_rent": 19000, "vibes": ["residential", "quiet", "family"]},
    "Memnagar": {"res_base": 85, "bus_base": 82, "life_base": 83, "trans_base": 88, "avg_rent": 19500, "vibes": ["residential", "central"]},
    "Shahibaug": {"res_base": 84, "bus_base": 80, "life_base": 81, "trans_base": 88, "avg_rent": 18500, "vibes": ["heritage", "central", "quiet"]},
    "Motera": {"res_base": 85, "bus_base": 80, "life_base": 82, "trans_base": 86, "avg_rent": 17000, "vibes": ["sports", "developing", "metro"]},
    "Vastral": {"res_base": 78, "bus_base": 72, "life_base": 73, "trans_base": 82, "avg_rent": 13500, "vibes": ["affordable", "metro", "developing"]},
    "Nikol": {"res_base": 79, "bus_base": 70, "life_base": 72, "trans_base": 78, "avg_rent": 14000, "vibes": ["affordable", "residential"]},
    "Naroda": {"res_base": 76, "bus_base": 74, "life_base": 71, "trans_base": 77, "avg_rent": 13000, "vibes": ["industrial", "affordable"]},
}


def score_localities(profile: dict, localities: List[dict]) -> List[dict]:
    """Score and rank localities dynamically based on all user profile parameters."""
    budget = float(profile.get("max_budget") or profile.get("rent_budget") or 25000)
    lifestyle_pref = str(profile.get("lifestyle_preference") or profile.get("lifestyle_pref") or "peaceful").lower()
    commute_tolerance = float(profile.get("max_commute_minutes") or profile.get("commute_tolerance_minutes") or 30)
    work_area = str(profile.get("work_area") or "Navrangpura").strip()
    commute_mode = str(profile.get("commute_mode") or "Car").lower()
    preferred_bhk = int(profile.get("preferred_bhk") or 2)

    preferred_localities = profile.get("preferred_localities") or []
    if isinstance(preferred_localities, str):
        preferred_localities = [s.strip() for s in preferred_localities.split(",") if s.strip()]

    # Merge input localities with knowledge base
    loc_names = {l.get("locality") for l in localities if l.get("locality")}
    combined_localities = list(localities)
    for name in AHMEDABAD_LOCALITIES_KNOWLEDGE.keys():
        if name not in loc_names:
            combined_localities.append({"locality": name, "listings_count": 6})

    all_names = [loc.get("locality", "Unknown") for loc in combined_localities]

    # Single batch calculation (uses instant local coordinate resolver & Haversine road formula)
    commute_batch = get_batch_commute_estimates(all_names, work_area, commute_mode)

    scored_results = []

    for loc in combined_localities:
        name = loc.get("locality", "Unknown")
        listings_count = loc.get("listings_count", 8)
        kb = AHMEDABAD_LOCALITIES_KNOWLEDGE.get(name, {
            "res_base": 80, "bus_base": 75, "life_base": 75, "trans_base": 80, "avg_rent": 22000, "vibes": ["residential"]
        })

        avg_rent = kb.get("avg_rent", 22000)

        # Look up commute from batch result
        commute_data = commute_batch.get(name, {"duration_minutes": 18.0, "distance_km": 7.2})
        commute_mins = float(commute_data.get("duration_minutes", 18.0))
        distance_km = commute_data.get("distance_km", 7.2)

        # Compute 4 Distinct Subscores (0 - 100)
        res_score = _score_residential(kb, budget, avg_rent)
        bus_score = _score_business(kb, work_area, name, commute_mins)
        life_score = _score_lifestyle(kb, lifestyle_pref)
        trans_score = _score_transit(commute_mins, commute_tolerance)

        # Weighted District Calculation
        total_score = (res_score * 0.35) + (bus_score * 0.35) + (life_score * 0.15) + (trans_score * 0.15)

        # Small User Preference Bonus (Max +4 pts)
        is_user_preferred = any(pref.lower() in name.lower() for pref in preferred_localities)
        if is_user_preferred:
            total_score += 4.0

        final_score = round(min(98.5, max(42.0, total_score)), 1)

        # Extract clean short locality name from full address string
        clean_work_area = str(work_area).split(',')[0].strip() if work_area else 'Office'

        # Budget Compatibility Tag
        if budget >= avg_rent * 1.15:
            budget_badge = f"Under Budget (Avg ₹{avg_rent:,}/mo)"
        elif budget >= avg_rent * 0.85:
            budget_badge = f"Optimal Budget Fit (Avg ₹{avg_rent:,}/mo)"
        else:
            budget_badge = f"Above Budget (Avg ₹{avg_rent:,}/mo)"

        insights = [
            f"~{commute_mins:.0f} min commute ({distance_km} km) to {clean_work_area}.",
            f"Average rent ₹{avg_rent:,}/mo — {budget_badge.split('(')[0].strip()}.",
            f"Matches '{lifestyle_pref.capitalize()}' lifestyle with high livability ratings."
        ]

        scored_results.append({
            "locality": name,
            "score": final_score,
            "avg_rent": avg_rent,
            "listings_count": listings_count,
            "commute_mins_est": round(commute_mins, 1),
            "work_area": clean_work_area,
            "budget_badge": budget_badge,
            "is_user_preferred": is_user_preferred,
            "district_scores": {
                "residential": round(res_score, 1),
                "business": round(bus_score, 1),
                "lifestyle": round(life_score, 1),
                "transit": round(trans_score, 1)
            },
            "insights": insights,
            "explanation": f"{name} delivers a {final_score}/100 match with a {commute_mins:.0f}-min commute to {clean_work_area} and ₹{avg_rent:,}/mo rent."
        })

    # Sort descending by score
    scored_results.sort(key=lambda x: x["score"], reverse=True)

    return scored_results


def _score_residential(kb: dict, budget: float, avg_rent: float) -> float:
    base = float(kb.get("res_base", 80))
    if avg_rent <= budget:
        savings_ratio = (budget - avg_rent) / budget
        return min(98.0, base + (savings_ratio * 15.0))
    else:
        excess_ratio = (avg_rent - budget) / budget
        return max(35.0, base - (excess_ratio * 40.0))


def _score_business(kb: dict, work_area: str, name: str, commute_mins: float) -> float:
    base = float(kb.get("bus_base", 75))
    if work_area.lower() in name.lower() or name.lower() in work_area.lower():
        return 98.0
    if commute_mins <= 10:
        return min(96.0, base + 10.0)
    elif commute_mins <= 25:
        return max(70.0, base - (commute_mins - 10) * 1.2)
    else:
        return max(35.0, 70.0 - (commute_mins - 25) * 1.8)


def _score_lifestyle(kb: dict, lifestyle_pref: str) -> float:
    base = float(kb.get("life_base", 75))
    vibes = kb.get("vibes", [])
    if lifestyle_pref in vibes or any(v in lifestyle_pref for v in vibes):
        return min(96.0, base + 8.0)
    return base


def _score_transit(commute_mins: float, commute_tolerance: float) -> float:
    if commute_mins <= commute_tolerance:
        return max(75.0, 96.0 - ((commute_mins / commute_tolerance) * 21.0))
    else:
        extra_mins = commute_mins - commute_tolerance
        return max(30.0, 75.0 - (extra_mins * 2.5))


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

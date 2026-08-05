"""apps/commute/maps_client.py — Geoapify Route Matrix API Client (Geoapify Migration)"""
import requests
import logging
from typing import Any
from django.conf import settings

logger = logging.getLogger('movesmart')

# Ahmedabad Locality Coordinate Registry [lng, lat]
AHMEDABAD_COORDS = {
    "bodakdev":     [72.5234, 23.0456],
    "vastrapur":    [72.5345, 23.0345],
    "satellite":    [72.5189, 23.0289],
    "thaltej":      [72.5123, 23.0567],
    "prahladnagar": [72.5089, 23.0123],
    "gota":         [72.5389, 23.0989],
    "vejalpur":     [72.5212, 23.0012],
    "bopal":        [72.4678, 23.0345],
    "south bopal":  [72.4756, 23.0312],
    "shela":        [72.4560, 23.0278],
    "ambli":        [72.4890, 23.0412],
    "navrangpura":  [72.5612, 23.0367],
    "gift city":    [72.6732, 23.1567],
    "infocity":     [72.6567, 23.1345],
    "chandkheda":   [72.5789, 23.1234],
}

# Regional fallback distance matrix (used if Geoapify API unavailable)
AHMEDABAD_COMMUTE_GRAPH = {
    ("bodakdev", "navrangpura"):     {"duration_minutes": 16.0, "distance_km": 6.8},
    ("vastrapur", "navrangpura"):    {"duration_minutes": 12.0, "distance_km": 4.5},
    ("satellite", "navrangpura"):    {"duration_minutes": 14.0, "distance_km": 5.2},
    ("thaltej", "navrangpura"):      {"duration_minutes": 18.0, "distance_km": 7.5},
    ("prahladnagar", "navrangpura"): {"duration_minutes": 22.0, "distance_km": 9.1},
    ("infocity", "gift city"):       {"duration_minutes": 12.0, "distance_km": 5.5},
    ("chandkheda", "gift city"):     {"duration_minutes": 20.0, "distance_km": 8.5},
}

# In-memory cache: { (work_area_key, mode): { locality_name: {duration_minutes, distance_km} } }
_commute_cache: dict = {}


class CommuteAPIError(Exception):
    """Raised when Geoapify API call fails."""
    pass


def _resolve_coords(loc_input: Any) -> list:
    """Resolve location to [lng, lat] coordinates."""
    if isinstance(loc_input, dict):
        if "lng" in loc_input and "lat" in loc_input:
            return [float(loc_input["lng"]), float(loc_input["lat"])]
        if "lon" in loc_input and "lat" in loc_input:
            return [float(loc_input["lon"]), float(loc_input["lat"])]
    name_str = str(loc_input.get('name') if isinstance(loc_input, dict) else loc_input).lower().split(',')[0].strip()
    return AHMEDABAD_COORDS.get(name_str, [72.5714, 23.0225])


def _map_mode(mode: str) -> str:
    """Map user commute mode string to Geoapify routing mode."""
    m = str(mode).lower()
    if 'bus' in m or 'transit' in m or 'public' in m:
        return 'transit'
    if 'walk' in m:
        return 'walk'
    if 'bike' in m or 'cycle' in m:
        return 'bicycle'
    return 'drive'


def get_batch_commute_estimates(locality_names: list, destination: Any, mode: str = "driving") -> dict:
    """
    Batch call to Geoapify Route Matrix — sends ALL localities as sources and the
    user's office as the single target. Returns { locality_name: {"duration_minutes", "distance_km"} }.
    Results are cached per (destination_key, mode) so subsequent calls are instant.
    """
    api_key = getattr(settings, 'GEOAPIFY_API_KEY', '435363f7628a447084da302c1cb4d029')
    geo_mode = _map_mode(mode)

    dest_key = str(destination.get('name') if isinstance(destination, dict) else destination).lower().split(',')[0].strip()
    cache_key = (dest_key, geo_mode)

    if cache_key in _commute_cache:
        return _commute_cache[cache_key]

    dest_coords = _resolve_coords(destination)

    # Build sources list — only localities with known coordinates
    loc_list = []   # [(original_name, [lng, lat])]
    for name in locality_names:
        coords = AHMEDABAD_COORDS.get(name.lower(), None)
        if coords:
            loc_list.append((name, coords))
        else:
            # Try partial match
            matched = next((v for k, v in AHMEDABAD_COORDS.items() if k in name.lower() or name.lower() in k), None)
            loc_list.append((name, matched or [72.5714, 23.0225]))

    results = {}

    if api_key and loc_list:
        url = f"https://api.geoapify.com/v1/routematrix?apiKey={api_key}"
        payload = {
            "mode": geo_mode,
            "sources": [{"location": coords} for _, coords in loc_list],
            "targets": [{"location": dest_coords}]
        }
        try:
            resp = requests.post(url, json=payload, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                matrix_rows = data.get("sources_to_targets", [])
                for i, (name, _) in enumerate(loc_list):
                    if i < len(matrix_rows) and matrix_rows[i]:
                        row = matrix_rows[i][0]
                        if row and "time" in row:
                            results[name] = {
                                "duration_minutes": round(row["time"] / 60.0, 1),
                                "distance_km": round(row.get("distance", 0) / 1000.0, 1),
                                "source": "geoapify_batch"
                            }
            else:
                logger.warning(f"Geoapify batch API returned status {resp.status_code}")
        except Exception as exc:
            logger.warning(f"Geoapify batch API failed: {exc}")

    # Fallback: fill any missing results from graph or estimated benchmark
    for name, _ in loc_list:
        if name not in results:
            orig_key = name.lower()
            match = AHMEDABAD_COMMUTE_GRAPH.get((orig_key, dest_key)) or AHMEDABAD_COMMUTE_GRAPH.get((dest_key, orig_key))
            if match:
                results[name] = {**match, "source": "regional_graph_fallback"}
            else:
                # Estimate by straight-line distance from coords
                from math import sqrt
                loc_coords = AHMEDABAD_COORDS.get(orig_key, [72.5714, 23.0225])
                dx = (loc_coords[0] - dest_coords[0]) * 88.5
                dy = (loc_coords[1] - dest_coords[1]) * 111.0
                dist_km = round(sqrt(dx**2 + dy**2), 1)
                duration = round(dist_km * 2.8, 1)  # ~21.4 km/h average city speed
                results[name] = {
                    "duration_minutes": max(2.0, duration),
                    "distance_km": max(0.5, dist_km),
                    "source": "estimated_linear"
                }

    # Cache for this session
    _commute_cache[cache_key] = results
    return results


def clear_commute_cache():
    """Clear the commute cache (call when user updates office location)."""
    global _commute_cache
    _commute_cache = {}


def get_commute_estimate(origin: Any, destination: Any, mode: str = "driving") -> dict:
    """Single-locality estimate — uses batch function for efficiency (cached)."""
    name = str(origin.get('name') if isinstance(origin, dict) else origin)
    batch = get_batch_commute_estimates([name], destination, mode)
    result = batch.get(name, {"duration_minutes": 18.0, "distance_km": 7.2, "source": "estimated_benchmark"})
    return {
        "origin_locality": name,
        "destination": str(destination),
        "mode": mode,
        **result
    }

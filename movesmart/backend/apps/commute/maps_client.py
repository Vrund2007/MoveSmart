"""apps/commute/maps_client.py — Wrapper around Google Maps Distance Matrix API (Architecture.md §1, §7, Rules.md §4)"""
import requests
import logging
from django.conf import settings

logger = logging.getLogger('movesmart')


class CommuteAPIError(Exception):
    """Raised when the Maps API call fails or returns a non-200 status."""
    pass


def get_commute_estimate(origin: str, destination: dict, mode: str = "driving") -> dict:
    """Call Maps API to get commute duration and distance."""
    api_key = getattr(settings, 'MAPS_API_KEY', None)
    if not api_key:
        raise CommuteAPIError("Google Maps API key is not configured.")

    dest_str = f"{destination.get('lat')},{destination.get('lng')}" if isinstance(destination, dict) else str(destination)
    url = f"https://maps.googleapis.com/maps/api/distancematrix/json?origins={origin}&destinations={dest_str}&mode={mode}&key={api_key}"

    try:
        resp = requests.get(url, timeout=5)
        if resp.status_code != 200:
            raise CommuteAPIError(f"Maps API HTTP {resp.status_code}")
        
        data = resp.json()
        if data.get("status") != "OK":
            raise CommuteAPIError(f"Maps API status error: {data.get('status')}")

        element = data["rows"][0]["elements"][0]
        if element.get("status") != "OK":
            raise CommuteAPIError(f"Element status error: {element.get('status')}")

        duration_sec = element["duration"]["value"]
        distance_meters = element["distance"]["value"]

        return {
            "origin_locality": origin,
            "destination": destination,
            "mode": mode,
            "duration_minutes": round(duration_sec / 60.0, 1),
            "distance_km": round(distance_meters / 1000.0, 1)
        }
    except Exception as exc:
        logger.error(f"Maps API request failed: {exc}")
        raise CommuteAPIError(str(exc))

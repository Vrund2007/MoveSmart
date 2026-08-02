"""apps/commute/maps_client.py — Wrapper around Google Maps Distance Matrix API (Architecture.md §1, §7, Rules.md §4)
API key is read from Django settings (set from env) — never exposed to frontend (Rules.md §5).
"""
from django.conf import settings


def get_commute_estimate(origin: str, destination: dict, mode: str) -> dict:
    """Call Maps API to get commute duration and distance.

    Args:
        origin: locality name string.
        destination: {lat, lng} dict (user's office/college coordinates).
        mode: one of 'driving' | 'transit' | 'walking' | 'auto'.

    Returns:
        dict with keys: duration_minutes, distance_km, mode.

    Raises:
        CommuteAPIError: on Maps API failure — caller must handle gracefully (Rules.md §4).

    TODO: implement HTTP call to Google Maps Distance Matrix API using settings.MAPS_API_KEY
    TODO: map 'auto' mode to nearest available Maps API equivalent
    TODO: raise CommuteAPIError with a message on any non-200 or quota error
    """
    pass


class CommuteAPIError(Exception):
    """Raised when the Maps API call fails or returns a non-200 status."""
    pass

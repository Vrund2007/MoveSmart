"""apps/commute/views.py — DRF view for commute estimation (Architecture.md §4.1, PRD §7.1)"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .maps_client import get_commute_estimate


class CommuteView(APIView):
    """GET /api/commute?from=<locality>&to=<office_coords>&mode=<mode>"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # TODO: parse from, to, mode query params
        # TODO: check db.commute_cache for cached result (database.md §3.8) before calling Maps API
        # TODO: if not cached, call maps_client.get_commute_estimate() — wrapped in try/except (Rules.md §4)
        # TODO: on Maps API failure, return explicit "commute data temporarily unavailable" — not 0 or empty
        # TODO: cache result in MongoDB with expires_at TTL
        # TODO: return duration_minutes, distance_km, mode
        pass

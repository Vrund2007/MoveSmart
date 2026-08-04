"""apps/commute/views.py — DRF view for commute estimation (Architecture.md §4.1, PRD §7.1)"""
from datetime import datetime, timedelta, timezone
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from apps.common.responses import api_response
from db import commute_cache_repo
from .maps_client import get_commute_estimate, CommuteAPIError


class CommuteView(APIView):
    """GET /api/commute?from=<locality>&to=<office_coords>&mode=<mode>"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        origin = request.query_params.get('from')
        destination = request.query_params.get('to')
        mode = request.query_params.get('mode', 'driving')

        if not origin or not destination:
            return api_response(message="'from' and 'to' query parameters are required.", status_code=status.HTTP_400_BAD_REQUEST)

        # Check cache
        cached = commute_cache_repo.get_cached_commute(origin, destination, mode)
        if cached:
            return api_response(data=cached, message="Commute estimate retrieved from cache.")

        try:
            estimate = get_commute_estimate(origin, destination, mode)
            # Add cache expiration (7 days)
            estimate["expires_at"] = datetime.now(timezone.utc) + timedelta(days=7)
            commute_cache_repo.set_cached_commute(estimate)
            return api_response(data=estimate, message="Commute estimate computed.")
        except CommuteAPIError:
            return api_response(
                data={"available": False},
                message="Commute data temporarily unavailable.",
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE
            )

"""apps/recommendations/views.py — DRF views for area and property recommendations (Architecture.md §4.1, §7, FR-8)"""
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from apps.common.responses import api_response
from db import listings_repo
from apps.accounts import repository
from .scoring import score_localities
from .ranking import rank_listings



class AreaRecommendationsView(APIView):
    """POST /api/recommendations/areas — score and rank localities for any caller role."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_doc = repository.get_user_by_id(request.user.id) if hasattr(request.user, 'id') and request.user.id else None
        role_profile = user_doc.get("role_profile", {}) if user_doc else {}

        profile = {**role_profile, **(request.data or {})}

        approved_listings = listings_repo.get_approved_listings()
        
        # Aggregate unique localities from approved listings
        localities_map = {}
        for l in approved_listings:
            loc = l.get("locality")
            if loc and loc not in localities_map:
                localities_map[loc] = {"locality": loc, "listings_count": 1}
            elif loc:
                localities_map[loc]["listings_count"] += 1

        localities_list = list(localities_map.values())
        if not localities_list:
            localities_list = [
                {"locality": "Vejalpur", "listings_count": 10},
                {"locality": "Bodakdev", "listings_count": 8},
                {"locality": "Satellite", "listings_count": 12}
            ]

        results = score_localities(profile, localities_list)
        return api_response(data=results, message="Area recommendations computed.")


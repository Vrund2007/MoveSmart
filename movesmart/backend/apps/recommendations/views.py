"""apps/recommendations/views.py — DRF views for area and property recommendations (Architecture.md §4.1, §7, FR-8)
Shared by: Find Accommodation, Broker AI-assisted matching, Company/HR bulk search (same endpoint contract).
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .scoring import score_localities
from .ranking import rank_listings


class AreaRecommendationsView(APIView):
    """POST /api/recommendations/areas — score and rank localities for any caller role.
    Same contract regardless of whether called by Find Accommodation, Broker (client matching), or
    Company/HR (bulk search scoped to office location) — satisfying FR-8 (one engine, not duplicated).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # TODO: validate payload via ProfilePayloadSerializer (salary, work_location, rent_budget, lifestyle_pref, commute_tolerance)
        # TODO: load candidate localities from approved listings aggregated from db.listings_repo (FR-3)
        # TODO: call scoring.score_localities(profile, localities) → returns top 3 with explanations
        # TODO: return ranked localities
        pass

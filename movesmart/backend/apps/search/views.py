"""apps/search/views.py — DRF views for Global Search (Phase 13)"""
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from apps.common.responses import api_response
from db import search_repo


class GlobalSearchView(APIView):
    """GET /api/search?q=query — Unified global platform search."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query_str = request.query_params.get("q", "").strip()
        results = search_repo.global_search(query_str, str(request.user.id), request.user.role)
        return api_response(data=results, message="Global search query completed.")

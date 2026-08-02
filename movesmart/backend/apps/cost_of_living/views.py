"""apps/cost_of_living/views.py — DRF view for cost-of-living estimation (Architecture.md §4.1, PRD §7.1)"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .estimator import estimate_cost_of_living


class CostOfLivingView(APIView):
    """GET /api/cost-of-living?locality=X — rule-based itemized cost estimate for a locality."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # TODO: parse locality from query params
        # TODO: call estimator.estimate_cost_of_living(locality, rent_budget)
        # TODO: return itemized breakdown clearly labeled as estimates (Rules.md §3)
        pass

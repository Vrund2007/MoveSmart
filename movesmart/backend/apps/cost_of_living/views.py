"""apps/cost_of_living/views.py — DRF view for cost-of-living breakdown (Architecture.md §4.1, PRD §7.1)"""
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from apps.common.responses import api_response
from .estimator import estimate_cost_of_living


class CostOfLivingView(APIView):
    """GET /api/cost-of-living?locality=<locality>&rent_budget=<budget>"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        locality = request.query_params.get('locality', 'General')
        rent_budget = request.query_params.get('rent_budget', 15000)

        try:
            budget_val = float(rent_budget)
        except ValueError:
            budget_val = 15000.0

        estimate_data = estimate_cost_of_living(locality, budget_val)
        return api_response(data=estimate_data, message="Cost of living breakdown estimated successfully.")

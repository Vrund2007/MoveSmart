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
        locality = request.query_params.get('locality', 'Navrangpura')
        rent_budget = request.query_params.get('rent_budget', 0)
        bhk = request.query_params.get('bhk', 2)
        household_type = request.query_params.get('household_type', 'bachelor')
        lifestyle = request.query_params.get('lifestyle', 'balanced')
        commute_mode = request.query_params.get('commute_mode', 'bike')

        try:
            budget_val = float(rent_budget) if rent_budget else 0.0
        except ValueError:
            budget_val = 0.0

        estimate_data = estimate_cost_of_living(
            locality=locality,
            rent_budget=budget_val,
            bhk=bhk,
            household_type=household_type,
            lifestyle=lifestyle,
            commute_mode=commute_mode
        )
        return api_response(data=estimate_data, message="Cost of living breakdown estimated successfully.")


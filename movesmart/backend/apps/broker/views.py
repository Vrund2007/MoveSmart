"""apps/broker/views.py — DRF views for broker leads and commissions (new v2.0, Architecture.md §4.3, FR-7)"""
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.accounts.permissions import IsBroker


class LeadsView(APIView):
    """GET /api/leads?broker=me — Broker's lead pipeline from enquiries across managed listings."""
    permission_classes = [IsBroker]

    def get(self, request):
        # TODO: call db.leads_repo.get_leads_for_broker(broker_id) — own leads only (FR-7)
        pass


class LeadDetailView(APIView):
    """PATCH /api/leads/:id — update lead_status (new|contacted|converted|lost)."""
    permission_classes = [IsBroker]

    def patch(self, request, lead_id):
        # TODO: validate via LeadStatusSerializer
        # TODO: verify lead.broker_id == current user (FR-7)
        # TODO: call db.leads_repo.update_lead_status(lead_id, status)
        pass


class CommissionsView(APIView):
    """POST /api/commissions — manual commission entry for converted lead.
    GET /api/commissions?broker=me — broker's own commission records only (FR-7).
    """
    permission_classes = [IsBroker]

    def post(self, request):
        # TODO: validate via CommissionCreateSerializer — lead_id must reference a 'converted' lead (database.md §3.6)
        # TODO: call db.commissions_repo.create_commission()
        pass

    def get(self, request):
        # TODO: call db.commissions_repo.get_commissions_for_broker(broker_id) — own records only (FR-7)
        pass

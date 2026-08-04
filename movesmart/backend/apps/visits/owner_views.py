"""apps/visits/owner_views.py — DRF views for owner-side visit management (Phase 10)"""
from rest_framework.views import APIView
from rest_framework import status
from apps.common.responses import api_response
from apps.accounts.permissions import IsOwner
from db import visits_repo
from .serializers import VisitStatusUpdateSerializer


class OwnerVisitsView(APIView):
    """GET /api/owner/visits — list all visit requests for owner's properties."""
    permission_classes = [IsOwner]

    def get(self, request):
        visits = visits_repo.get_owner_visits(request.user.id)
        return api_response(data=visits, message="Visit requests retrieved.")


class OwnerVisitDetailView(APIView):
    """PUT /api/owner/visits/:visit_id/status — confirm, reject, complete, or cancel a visit."""
    permission_classes = [IsOwner]

    def put(self, request, visit_id):
        serializer = VisitStatusUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error.",
                                status_code=status.HTTP_400_BAD_REQUEST)

        status_val = serializer.validated_data["status"]
        notes = serializer.validated_data.get("notes")

        success = visits_repo.owner_update_visit_status(visit_id, request.user.id, status_val, notes)
        if not success:
            return api_response(message="Visit not found or update failed.",
                                status_code=status.HTTP_400_BAD_REQUEST)

        updated = visits_repo.get_owner_visit_by_id(visit_id, request.user.id)
        return api_response(data=updated, message=f"Visit {status_val}.")

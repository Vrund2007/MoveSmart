"""apps/visits/views.py — DRF views for property visit scheduling"""
from rest_framework.views import APIView
from rest_framework import status
from apps.common.responses import api_response
from apps.accounts.permissions import IsFindAccommodation
from db import visits_repo
from .serializers import VisitCreateSerializer, VisitStatusUpdateSerializer


class VisitsView(APIView):
    """GET /api/visits — list seeker property visits.
    POST /api/visits — schedule a new visit.
    """
    permission_classes = [IsFindAccommodation]

    def get(self, request):
        listing_id = request.query_params.get('listing_id')
        if listing_id:
            visits = visits_repo.get_seeker_visits_for_listing(request.user.id, listing_id)
        else:
            visits = visits_repo.get_seeker_visits(request.user.id)
        return api_response(data=visits, message="Visits retrieved successfully.")

    def post(self, request):
        serializer = VisitCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        data["seeker_id"] = request.user.id
        visit_id = visits_repo.create_visit(data)
        created = visits_repo.get_visit_by_id(visit_id, request.user.id)

        return api_response(data=created, message="Property visit requested successfully.", status_code=status.HTTP_201_CREATED)


class VisitDetailView(APIView):
    """GET /api/visits/:id — visit detail.
    PUT /api/visits/:id/status — update visit status (cancel/reschedule).
    """
    permission_classes = [IsFindAccommodation]

    def get(self, request, visit_id):
        visit = visits_repo.get_visit_by_id(visit_id, request.user.id)
        if not visit:
            return api_response(message="Visit not found.", status_code=status.HTTP_404_NOT_FOUND)
        return api_response(data=visit, message="Visit detail retrieved.")

    def put(self, request, visit_id):
        serializer = VisitStatusUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        status_val = serializer.validated_data['status']
        notes = serializer.validated_data.get('notes')

        try:
            success = visits_repo.update_visit_status(visit_id, request.user.id, status_val, notes)
            if not success:
                return api_response(message="Visit not found or failed to update.", status_code=status.HTTP_400_BAD_REQUEST)
        except ValueError as val_err:
            return api_response(message=str(val_err), status_code=status.HTTP_400_BAD_REQUEST)

        updated = visits_repo.get_visit_by_id(visit_id, request.user.id)
        return api_response(data=updated, message=f"Visit status updated to {status_val}.")

"""apps/calendar/views.py — DRF views for Universal Calendar (Phase 13)"""
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from apps.common.responses import api_response
from db import calendar_repo
from .serializers import CalendarEventCreateSerializer


class CalendarEventsView(APIView):
    """GET /api/calendar/events — list user calendar events.
    POST /api/calendar/events — create calendar event.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        etype = request.query_params.get("type")
        events = calendar_repo.get_user_calendar_events(str(request.user.id), event_type=etype)
        return api_response(data=events, message="Calendar events retrieved.")

    def post(self, request):
        serializer = CalendarEventCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        e_data = serializer.validated_data
        e_data["user_id"] = str(request.user.id)
        e_data["role"] = request.user.role

        created = calendar_repo.create_calendar_event(e_data)
        return api_response(data=created, message="Calendar event created.", status_code=status.HTTP_201_CREATED)


class CalendarEventDetailView(APIView):
    """DELETE /api/calendar/events/:id — delete event."""
    permission_classes = [IsAuthenticated]

    def delete(self, request, event_id):
        success = calendar_repo.delete_calendar_event(event_id, str(request.user.id))
        if not success:
            return api_response(message="Calendar event not found.", status_code=status.HTTP_404_NOT_FOUND)
        return api_response(message="Calendar event deleted successfully.")

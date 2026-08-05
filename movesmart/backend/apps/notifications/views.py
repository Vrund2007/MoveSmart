"""apps/notifications/views.py — DRF views for Notification Center (Phase 13)"""
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from apps.common.responses import api_response
from db import notifications_repo


class NotificationsView(APIView):
    """GET /api/notifications — list notifications and unread count.
    POST /api/notifications — create a notification.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ntype = request.query_params.get("type")
        unread_only = request.query_params.get("unread") == "true"

        notifications = notifications_repo.get_user_notifications(
            user_id=str(request.user.id),
            notification_type=ntype,
            unread_only=unread_only
        )
        unread_count = notifications_repo.get_unread_count(str(request.user.id))

        return api_response(
            data={"notifications": notifications, "unread_count": unread_count},
            message="Notifications retrieved."
        )

    def post(self, request):
        from .serializers import NotificationCreateSerializer
        serializer = NotificationCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        created = notifications_repo.create_notification(serializer.validated_data)
        return api_response(data=created, message="Notification created.", status_code=status.HTTP_201_CREATED)


class NotificationReadView(APIView):
    """PATCH /api/notifications/:id/read — mark single notification read."""
    permission_classes = [IsAuthenticated]

    def patch(self, request, notification_id):
        success = notifications_repo.mark_as_read(notification_id, str(request.user.id))
        if not success:
            return api_response(message="Notification not found.", status_code=status.HTTP_404_NOT_FOUND)
        return api_response(message="Notification marked as read.")


class NotificationMarkAllReadView(APIView):
    """POST /api/notifications/mark-all-read — mark all read."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        notifications_repo.mark_all_read(str(request.user.id))
        return api_response(message="All notifications marked as read.")


class NotificationDetailView(APIView):
    """DELETE /api/notifications/:id — delete notification."""
    permission_classes = [IsAuthenticated]

    def delete(self, request, notification_id):
        success = notifications_repo.delete_notification(notification_id, str(request.user.id))
        if not success:
            return api_response(message="Notification not found.", status_code=status.HTTP_404_NOT_FOUND)
        return api_response(message="Notification deleted successfully.")

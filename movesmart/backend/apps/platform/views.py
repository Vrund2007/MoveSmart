"""apps/platform/views.py — DRF views for Platform Settings & Feedback Center (Phase 14)"""
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from apps.common.responses import api_response
from apps.accounts.permissions import IsAdmin
from db import platform_settings_repo, feedback_repo, audit_repo


class PlatformSettingsView(APIView):
    """GET / PUT /api/admin/settings — Global platform configuration."""
    permission_classes = [IsAdmin]

    def get(self, request):
        settings_data = platform_settings_repo.get_platform_settings()
        return api_response(data=settings_data, message="Platform settings retrieved.")

    def put(self, request):
        updated = platform_settings_repo.update_platform_settings(request.data)

        audit_repo.log_admin_action(
            actor_id=str(request.user.id),
            actor_email=request.user.email,
            action="settings_update",
            target_type="setting",
            target_id="global_config",
            details="Global platform settings updated"
        )
        return api_response(data=updated, message="Platform settings updated successfully.")


class FeedbackListView(APIView):
    """GET /api/admin/feedback — List feedback submissions (Admin).
    POST /api/platform/feedback — Submit feedback (Public / Authenticated).
    """
    def get_permissions(self):
        if self.request.method == "POST":
            return [AllowAny()]
        return [IsAdmin()]

    def get(self, request):
        status_filter = request.query_params.get("status")
        feedback_list = feedback_repo.get_all_feedback(status_filter=status_filter)
        return api_response(data=feedback_list, message="Feedback submissions retrieved.")

    def post(self, request):
        f_data = request.data
        if request.user and getattr(request.user, "is_authenticated", False):
            f_data["user_id"] = str(request.user.id)
            f_data.setdefault("email", request.user.email)

        created = feedback_repo.create_feedback(f_data)
        return api_response(data=created, message="Feedback submitted successfully.", status_code=status.HTTP_201_CREATED)


class FeedbackDetailView(APIView):
    """PATCH /api/admin/feedback/:id — Update feedback status (Resolve / Archive)."""
    permission_classes = [IsAdmin]

    def patch(self, request, feedback_id):
        new_status = request.data.get("status")
        note = request.data.get("resolution_note")

        if not new_status:
            return api_response(message="status field is required.", status_code=status.HTTP_400_BAD_REQUEST)

        success = feedback_repo.update_feedback_status(feedback_id, new_status, note)
        if not success:
            return api_response(message="Feedback entry not found or invalid status.", status_code=status.HTTP_400_BAD_REQUEST)

        return api_response(message=f"Feedback status updated to '{new_status}'.")

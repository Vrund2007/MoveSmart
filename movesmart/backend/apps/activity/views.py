"""apps/activity/views.py — DRF views for Activity Timeline & Audit Logs (Phase 13)"""
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from apps.common.responses import api_response
from db import activity_repo


class ActivityLogsView(APIView):
    """GET /api/activity — list recent activity timeline for user."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        logs = activity_repo.get_user_activity_logs(str(request.user.id))
        return api_response(data=logs, message="Activity logs retrieved.")

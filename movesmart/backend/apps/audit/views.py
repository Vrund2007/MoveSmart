"""apps/audit/views.py — DRF views for Audit Logs (Phase 14)"""
from rest_framework.views import APIView
from apps.common.responses import api_response
from apps.accounts.permissions import IsAdmin
from db import audit_repo


class AuditLogsView(APIView):
    """GET /api/admin/audit-logs — List system audit logs for Super Admin."""
    permission_classes = [IsAdmin]

    def get(self, request):
        action_filter = request.query_params.get("action")
        logs = audit_repo.get_audit_logs(action=action_filter)
        return api_response(data=logs, message="Audit logs retrieved.")

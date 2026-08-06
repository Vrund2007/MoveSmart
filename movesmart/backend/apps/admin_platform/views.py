"""apps/admin_platform/views.py — DRF views for Super Admin Platform (Phase 14)"""
import csv
from io import StringIO
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework import status
from apps.common.responses import api_response
from apps.accounts.permissions import IsAdmin
from django.contrib.auth.hashers import make_password
from db import admin_platform_repo, listings_repo, audit_repo, users_repo
from .serializers import BulkListingActionSerializer, UserStatusUpdateSerializer


class AdminDashboardView(APIView):
    """GET /api/admin/dashboard — Aggregated Super Admin Dashboard metrics."""
    permission_classes = [IsAdmin]

    def get(self, request):
        summary = admin_platform_repo.get_admin_dashboard_summary()
        return api_response(data=summary, message="Admin dashboard summary retrieved.")


class AdminUsersView(APIView):
    """GET / POST /api/admin/users — List user registry or create Admin user account."""
    permission_classes = [IsAdmin]

    def get(self, request):
        role = request.query_params.get("role")
        search = request.query_params.get("search")
        account_status = request.query_params.get("status")

        users = admin_platform_repo.get_all_users(role=role, search=search, account_status=account_status)
        return api_response(data=users, message="User registry retrieved.")

    def post(self, request):
        email = str(request.data.get("email") or "").strip()
        password = str(request.data.get("password") or "").strip()
        name = str(request.data.get("name") or "Admin User").strip()

        if not email or not password:
            return api_response(message="Email and password are required.", status_code=status.HTTP_400_BAD_REQUEST)

        existing = users_repo.get_user_by_email(email)
        if existing:
            return api_response(message="An account with this email already exists.", status_code=status.HTTP_409_CONFLICT)

        password_hash = make_password(password)
        new_admin = users_repo.create_admin_user(email=email, password_hash=password_hash, name=name)

        audit_repo.log_admin_action(
            actor_id=str(request.user.id),
            actor_email=request.user.email,
            action="admin_account_create",
            target_type="user",
            target_id=new_admin["_id"],
            details=f"New Admin account '{email}' created by Super Admin"
        )
        return api_response(data=new_admin, message="Admin account created successfully.", status_code=status.HTTP_201_CREATED)


class AdminUserDetailView(APIView):
    """PATCH / DELETE /api/admin/users/:id — Suspend, activate, or delete user."""
    permission_classes = [IsAdmin]

    def patch(self, request, user_id):
        serializer = UserStatusUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        new_status = serializer.validated_data["account_status"]
        success = admin_platform_repo.update_user_status(user_id, new_status)
        if not success:
            return api_response(message="User not found.", status_code=status.HTTP_404_NOT_FOUND)

        # Audit log
        audit_repo.log_admin_action(
            actor_id=str(request.user.id),
            actor_email=request.user.email,
            action="user_status_change",
            target_type="user",
            target_id=user_id,
            details=f"User status updated to '{new_status}'"
        )
        return api_response(message=f"User status updated to '{new_status}'.")

    def delete(self, request, user_id):
        success = admin_platform_repo.delete_user(user_id)
        if not success:
            return api_response(message="User not found.", status_code=status.HTTP_404_NOT_FOUND)

        audit_repo.log_admin_action(
            actor_id=str(request.user.id),
            actor_email=request.user.email,
            action="user_delete",
            target_type="user",
            target_id=user_id,
            details="User account deleted by Super Admin"
        )
        return api_response(message="User account deleted successfully.")


class AdminListingsView(APIView):
    """GET /api/admin/listings — List properties for moderation."""
    permission_classes = [IsAdmin]

    def get(self, request):
        status_param = request.query_params.get("status", "pending_review")
        listings = listings_repo.get_listings_by_status(status_param)
        return api_response(data=listings, message="Property moderation queue retrieved.")


class AdminListingBulkView(APIView):
    """POST /api/admin/listings/bulk — Bulk approve / reject / archive listings."""
    permission_classes = [IsAdmin]

    def post(self, request):
        serializer = BulkListingActionSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        updated_count = admin_platform_repo.bulk_update_listing_status(
            data["listing_ids"],
            data["decision"],
            data.get("reason")
        )

        audit_repo.log_admin_action(
            actor_id=str(request.user.id),
            actor_email=request.user.email,
            action="bulk_listing_update",
            target_type="listing",
            target_id=f"count:{updated_count}",
            details=f"Bulk {data['decision']} applied to {updated_count} listings."
        )

        return api_response(data={"updated_count": updated_count}, message=f"Bulk {data['decision']} executed on {updated_count} listings.")


class AdminBrokersView(APIView):
    """GET /api/admin/brokers — List registered brokers with metrics."""
    permission_classes = [IsAdmin]

    def get(self, request):
        brokers = admin_platform_repo.get_all_brokers()
        return api_response(data=brokers, message="Broker directory retrieved.")


class AdminCompaniesView(APIView):
    """GET /api/admin/companies — List corporate HR accounts with metrics."""
    permission_classes = [IsAdmin]

    def get(self, request):
        companies = admin_platform_repo.get_all_companies()
        return api_response(data=companies, message="HR Companies directory retrieved.")


class AdminAIMonitoringView(APIView):
    """GET /api/admin/ai-monitoring — Fetch privacy-safe AI and ML health metrics."""
    permission_classes = [IsAdmin]

    def get(self, request):
        metrics = admin_platform_repo.get_ai_ml_metrics()
        return api_response(data=metrics, message="AI/ML monitoring metrics retrieved.")


class AdminAnalyticsExportView(APIView):
    """GET /api/admin/analytics/export — Download platform analytics CSV."""
    permission_classes = [IsAdmin]

    def get(self, request):
        summary = admin_platform_repo.get_admin_dashboard_summary()
        u_metrics = summary.get("user_metrics", {})
        l_metrics = summary.get("listing_metrics", {})

        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(["MoveSmart Platform Analytics", f"Generated by: {request.user.email}"])
        writer.writerow([])
        writer.writerow(["User Metric", "Count"])
        for k, v in u_metrics.items():
            writer.writerow([k, v])

        writer.writerow([])
        writer.writerow(["Listing Metric", "Count"])
        for k, v in l_metrics.items():
            writer.writerow([k, v])

        response = HttpResponse(output.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="admin_platform_analytics.csv"'
        return response

"""apps/reports/views.py — DRF views for Universal Platform Reports (Phase 13)"""
import csv
from io import StringIO
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from apps.common.responses import api_response
from db import reports_repo, company_reports_repo, listings_repo, visits_repo


class UniversalReportsView(APIView):
    """GET /api/reports — Platform report generator across all roles."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        role = request.user.role
        user_id = str(request.user.id)
        report_type = request.query_params.get("type", "overview")

        data = {}
        if role == "broker":
            data = reports_repo.generate_performance_analytics(user_id)
        elif role == "company_hr":
            data = company_reports_repo.generate_employee_relocation_report(user_id)
        elif role == "property_owner":
            listings = listings_repo.get_listings_by_owner(user_id)
            data = {"total_properties": len(listings), "listings": listings}
        else:
            visits = visits_repo.get_seeker_visits(user_id)
            data = {"total_visits": len(visits), "visits": visits}

        return api_response(data={"role": role, "report_type": report_type, "content": data}, message="Report generated.")


class UniversalReportExportView(APIView):
    """GET /api/reports/export — Download report as CSV."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        role = request.user.role
        user_id = str(request.user.id)

        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(["MoveSmart Platform Report", f"Role: {role}", f"User: {request.user.email}"])

        if role == "broker":
            analytics = reports_repo.generate_performance_analytics(user_id)
            writer.writerow(["Metric", "Value"])
            writer.writerow(["Performance Score", analytics.get("performance_score")])
            writer.writerow(["Lead Conversion Rate (%)", analytics.get("lead_conversion_rate")])
            writer.writerow(["Total Revenue (INR)", analytics.get("total_revenue")])
        else:
            writer.writerow(["Status", "Count"])
            writer.writerow(["Active", "1"])

        response = HttpResponse(output.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{role}_platform_report.csv"'
        return response

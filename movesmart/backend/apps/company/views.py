"""apps/company/views.py — DRF views for Company/HR relocation & Enterprise Platform (Architecture.md §4.4, Phase 12)"""
import csv
from io import StringIO
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework import status
from apps.common.responses import api_response
from apps.accounts.permissions import IsCompanyHR
from db import (
    relocation_batches_repo,
    users_repo,
    listings_repo,
    employees_repo,
    broker_assignments_repo,
    approvals_repo,
    expenses_repo,
    company_reports_repo
)
from apps.recommendations import scoring
from .services import get_enterprise_dashboard_summary
from .serializers import (
    CompanyProfileSerializer,
    RelocationBatchCreateSerializer,
    EmployeeAddSerializer,
    AllocationCreateSerializer,
    BrokerAssignmentCreateSerializer,
    ApprovalCreateSerializer,
    ApprovalUpdateSerializer,
    ExpenseCreateSerializer
)


class CompanyDashboardView(APIView):
    """GET /api/company/dashboard — Aggregated Enterprise HR Dashboard stats & metrics."""
    permission_classes = [IsCompanyHR]

    def get(self, request):
        summary = get_enterprise_dashboard_summary(str(request.user.id))
        return api_response(data=summary, message="Enterprise HR Dashboard summary retrieved.")


class CompanyProfileView(APIView):
    """POST /api/company/profile — Company/HR onboarding profile & settings."""
    permission_classes = [IsCompanyHR]

    def post(self, request):
        serializer = CompanyProfileSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        updated_user = users_repo.update_role_profile(str(request.user.id), serializer.validated_data)
        return api_response(data=updated_user, message="Company profile saved successfully.")


class EmployeesView(APIView):
    """GET /api/company/employees — List company employees with filter & search.
    POST /api/company/employees — Register employee profile.
    """
    permission_classes = [IsCompanyHR]

    def get(self, request):
        status_filter = request.query_params.get("status")
        dept_filter = request.query_params.get("department")
        search = request.query_params.get("search")

        employees = employees_repo.get_company_employees(
            company_id=str(request.user.id),
            status=status_filter,
            department=dept_filter,
            search=search
        )
        return api_response(data=employees, message="Company employees retrieved.")

    def post(self, request):
        serializer = EmployeeAddSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        emp_data = serializer.validated_data
        emp_data["company_id"] = str(request.user.id)
        try:
            created = employees_repo.create_employee(emp_data)
            return api_response(data=created, message="Employee registered successfully.", status_code=status.HTTP_201_CREATED)
        except ValueError as val_err:
            return api_response(message=str(val_err), status_code=status.HTTP_400_BAD_REQUEST)


class EmployeeDetailView(APIView):
    """GET / PUT / DELETE /api/company/employees/:id — Employee workspace detail."""
    permission_classes = [IsCompanyHR]

    def get(self, request, employee_id):
        emp = employees_repo.get_employee_by_id(employee_id, str(request.user.id))
        if not emp:
            return api_response(message="Employee record not found.", status_code=status.HTTP_404_NOT_FOUND)
        return api_response(data=emp, message="Employee detail retrieved.")

    def put(self, request, employee_id):
        serializer = EmployeeAddSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        updated = employees_repo.update_employee(employee_id, str(request.user.id), serializer.validated_data)
        if not updated:
            return api_response(message="Employee record not found or permission denied.", status_code=status.HTTP_404_NOT_FOUND)

        return api_response(data=updated, message="Employee updated successfully.")

    def delete(self, request, employee_id):
        success = employees_repo.delete_employee(employee_id, str(request.user.id))
        if not success:
            return api_response(message="Employee record not found or permission denied.", status_code=status.HTTP_404_NOT_FOUND)
        return api_response(message="Employee record deleted successfully.")


class BrokerAssignmentsView(APIView):
    """GET /api/company/broker-assignments — List company broker assignments.
    POST /api/company/broker-assignments — Assign broker to employee.
    """
    permission_classes = [IsCompanyHR]

    def get(self, request):
        status_filter = request.query_params.get("status")
        assignments = broker_assignments_repo.get_company_assignments(str(request.user.id), status=status_filter)
        return api_response(data=assignments, message="Broker assignments retrieved.")

    def post(self, request):
        serializer = BrokerAssignmentCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        a_data = serializer.validated_data
        a_data["company_id"] = str(request.user.id)
        a_data["assigned_by"] = str(request.user.id)

        created = broker_assignments_repo.create_assignment(a_data)
        return api_response(data=created, message="Broker assigned to employee successfully.", status_code=status.HTTP_201_CREATED)


class BrokerAssignmentDetailView(APIView):
    """PATCH /api/company/broker-assignments/:id — update assignment status."""
    permission_classes = [IsCompanyHR]

    def patch(self, request, assignment_id):
        new_status = request.data.get("status")
        if not new_status:
            return api_response(message="status field is required.", status_code=status.HTTP_400_BAD_REQUEST)

        try:
            success = broker_assignments_repo.update_assignment_status(assignment_id, str(request.user.id), new_status)
            if not success:
                return api_response(message="Broker assignment not found.", status_code=status.HTTP_404_NOT_FOUND)
            return api_response(message=f"Broker assignment status updated to '{new_status}'.")
        except ValueError as val_err:
            return api_response(message=str(val_err), status_code=status.HTTP_400_BAD_REQUEST)


class ApprovalsView(APIView):
    """GET /api/company/approvals — List approval requests.
    POST /api/company/approvals — Create approval request.
    """
    permission_classes = [IsCompanyHR]

    def get(self, request):
        status_filter = request.query_params.get("status")
        approvals = approvals_repo.get_company_approvals(str(request.user.id), status=status_filter)
        return api_response(data=approvals, message="Approval requests retrieved.")

    def post(self, request):
        serializer = ApprovalCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        app_data = serializer.validated_data
        app_data["company_id"] = str(request.user.id)
        app_data["requested_by"] = str(request.user.id)

        created = approvals_repo.create_approval_request(app_data)
        return api_response(data=created, message="Approval request submitted.", status_code=status.HTTP_201_CREATED)


class ApprovalDetailView(APIView):
    """PATCH /api/company/approvals/:id — Approve, reject, or request revision."""
    permission_classes = [IsCompanyHR]

    def patch(self, request, approval_id):
        serializer = ApprovalUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        v_data = serializer.validated_data
        updated = approvals_repo.update_approval_status(
            approval_id=approval_id,
            company_id=str(request.user.id),
            new_status=v_data["status"],
            reason=v_data.get("reason", ""),
            approver_id=str(request.user.id)
        )
        if not updated:
            return api_response(message="Approval request not found.", status_code=status.HTTP_404_NOT_FOUND)

        return api_response(data=updated, message=f"Approval status updated to '{v_data['status']}'.")


class ExpensesView(APIView):
    """GET /api/company/expenses — List relocation expenses.
    POST /api/company/expenses — Log expense entry.
    """
    permission_classes = [IsCompanyHR]

    def get(self, request):
        category = request.query_params.get("category")
        expenses = expenses_repo.get_company_expenses(str(request.user.id), category=category)
        summary = expenses_repo.get_expense_summary(str(request.user.id))
        return api_response(data={"expenses": expenses, "summary": summary}, message="Relocation expenses retrieved.")

    def post(self, request):
        serializer = ExpenseCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        exp_data = serializer.validated_data
        exp_data["company_id"] = str(request.user.id)

        created = expenses_repo.create_expense(exp_data)
        return api_response(data=created, message="Relocation expense logged.", status_code=status.HTTP_201_CREATED)


class ExpenseDetailView(APIView):
    """DELETE /api/company/expenses/:id — Delete expense entry."""
    permission_classes = [IsCompanyHR]

    def delete(self, request, expense_id):
        success = expenses_repo.delete_expense(expense_id, str(request.user.id))
        if not success:
            return api_response(message="Expense entry not found.", status_code=status.HTTP_404_NOT_FOUND)
        return api_response(message="Expense entry deleted successfully.")


class CompanyReportsView(APIView):
    """GET /api/company/reports — Corporate HR Reports (JSON)."""
    permission_classes = [IsCompanyHR]

    def get(self, request):
        report_type = request.query_params.get("type", "employees")
        company_id = str(request.user.id)

        if report_type == "employees":
            data = company_reports_repo.generate_employee_relocation_report(company_id)
        elif report_type == "brokers":
            data = company_reports_repo.generate_broker_performance_report(company_id)
        elif report_type == "budget" or report_type == "expenses":
            data = company_reports_repo.generate_budget_report(company_id)
        else:
            data = company_reports_repo.generate_employee_relocation_report(company_id)

        return api_response(data={"report_type": report_type, "content": data}, message=f"Corporate {report_type} report generated.")


class CompanyReportExportView(APIView):
    """GET /api/company/reports/export — Download CSV corporate report."""
    permission_classes = [IsCompanyHR]

    def get(self, request):
        report_type = request.query_params.get("type", "employees")
        company_id = str(request.user.id)

        output = StringIO()
        writer = csv.writer(output)

        if report_type == "employees":
            rep = company_reports_repo.generate_employee_relocation_report(company_id)
            writer.writerow(["Employee ID", "Name", "Department", "Designation", "Relocation Status"])
            for emp in rep.get("recent_employees", []):
                writer.writerow([emp.get("employee_id"), emp.get("name"), emp.get("department"), emp.get("designation"), emp.get("relocation_status")])

        elif report_type == "expenses":
            expenses = expenses_repo.get_company_expenses(company_id)
            writer.writerow(["Expense ID", "Employee ID", "Category", "Amount (INR)", "Status"])
            for e in expenses:
                writer.writerow([e.get("_id"), e.get("employee_id"), e.get("category"), e.get("amount"), e.get("status")])

        else:
            rep = company_reports_repo.generate_budget_report(company_id)
            writer.writerow(["Metric", "Amount (INR)"])
            writer.writerow(["Total Allocated Budget", rep.get("total_allocated_budget")])
            writer.writerow(["Total Housing Cost", rep.get("total_housing_cost")])
            writer.writerow(["Total Logged Expenses", rep.get("total_logged_expenses")])
            writer.writerow(["Total Expenditure", rep.get("total_expenditure")])
            writer.writerow(["Remaining Budget", rep.get("remaining_budget")])

        response = HttpResponse(output.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="company_{report_type}_report.csv"'
        return response


class AIEnterpriseAssistantView(APIView):
    """POST /api/company/ai-assistant — Enterprise Gemini prompts execution."""
    permission_classes = [IsCompanyHR]

    def post(self, request):
        query = request.data.get("query", "").strip()
        if not query:
            return api_response(message="Query prompt is required.", status_code=status.HTTP_400_BAD_REQUEST)

        # Enterprise response synthesiser reusing dashboard analytics
        company_id = str(request.user.id)
        summary = get_enterprise_dashboard_summary(company_id)
        widgets = summary.get("widgets", {})

        response_text = (
            f"**Enterprise Relocation AI Summary for {request.user.email}**\n\n"
            f"- **Active Relocation Batches**: {widgets.get('active_batches', 0)}\n"
            f"- **Employees Waiting / Allocated / Moved**: {widgets.get('employees_waiting', 0)} waiting, {widgets.get('employees_allocated', 0)} allocated, {widgets.get('employees_moved', 0)} moved.\n"
            f"- **Budget Allocated / Used**: ₹{widgets.get('budget_allocated', 0):,.0f} total, ₹{widgets.get('budget_used', 0):,.0f} utilized ({widgets.get('utilization_rate', 0)}%).\n\n"
            f"**Recommendation**: Based on your query '{query}', we advise approving open broker assignments and allocating remaining housing budget towards Ahmedabad HQ locations."
        )

        return api_response(data={"response": response_text}, message="AI Enterprise assistant response computed.")


# Existing Phase 6 Relocation Batch Views
class RelocationBatchesView(APIView):
    """GET /api/company/relocation-batches — list company relocation batches.
    POST /api/company/relocation-batches — create a new batch.
    """
    permission_classes = [IsCompanyHR]

    def get(self, request):
        batches = relocation_batches_repo.get_company_batches(str(request.user.id))
        for b in batches:
            allocations = b.get("allocations", [])
            b["budget_used"] = sum(float(a.get("cost", 0)) for a in allocations)
            b["budget_remaining"] = float(b.get("budget", 0)) - b["budget_used"]
            b["allocated_count"] = len(allocations)

        return api_response(data=batches, message="Relocation batches retrieved.")

    def post(self, request):
        serializer = RelocationBatchCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        data['company_id'] = str(request.user.id)
        batch_id = relocation_batches_repo.create_relocation_batch(data)
        return api_response(data={"batch_id": batch_id}, message="Relocation batch created.", status_code=status.HTTP_201_CREATED)


class RelocationBatchDetailView(APIView):
    """GET / PUT / DELETE /api/company/relocation-batches/:id"""
    permission_classes = [IsCompanyHR]

    def get(self, request, batch_id):
        batch = relocation_batches_repo.get_company_batch(batch_id, str(request.user.id))
        if not batch:
            return api_response(message="Relocation batch not found.", status_code=status.HTTP_404_NOT_FOUND)

        allocations = batch.get("allocations", [])
        budget_used = sum(float(a.get("cost", 0)) for a in allocations)
        total_budget = float(batch.get("budget", 0))

        res_data = dict(batch)
        res_data["budget_used"] = budget_used
        res_data["budget_remaining"] = total_budget - budget_used
        res_data["allocated_count"] = len(allocations)

        return api_response(data=res_data, message="Relocation batch retrieved.")

    def put(self, request, batch_id):
        serializer = RelocationBatchCreateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        updated = relocation_batches_repo.update_batch(batch_id, str(request.user.id), serializer.validated_data)
        if not updated:
            return api_response(message="Relocation batch not found.", status_code=status.HTTP_404_NOT_FOUND)

        return api_response(data=updated, message="Relocation batch updated.")

    def delete(self, request, batch_id):
        success = relocation_batches_repo.delete_batch(batch_id, str(request.user.id))
        if not success:
            return api_response(message="Relocation batch not found or failed to delete.", status_code=status.HTTP_404_NOT_FOUND)

        return api_response(message="Relocation batch deleted successfully.")


class BatchEmployeesView(APIView):
    """POST /api/company/relocation-batches/:id/employees"""
    permission_classes = [IsCompanyHR]

    def post(self, request, batch_id):
        serializer = EmployeeAddSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        try:
            success = relocation_batches_repo.add_employee_to_batch(batch_id, str(request.user.id), serializer.validated_data)
            if not success:
                return api_response(message="Failed to add employee.", status_code=status.HTTP_400_BAD_REQUEST)
            return api_response(message="Employee added to relocation batch.")
        except ValueError as val_err:
            return api_response(message=str(val_err), status_code=status.HTTP_400_BAD_REQUEST)


class BatchEmployeeDetailView(APIView):
    """DELETE /api/company/relocation-batches/:id/employees/:employee_id"""
    permission_classes = [IsCompanyHR]

    def delete(self, request, batch_id, employee_id):
        success = relocation_batches_repo.remove_employee_from_batch(batch_id, str(request.user.id), employee_id)
        if not success:
            return api_response(message="Employee not found in batch.", status_code=status.HTTP_404_NOT_FOUND)

        return api_response(message="Employee removed from relocation batch.")


class BatchSearchView(APIView):
    """POST /api/company/relocation-batches/:id/search — bulk housing search."""
    permission_classes = [IsCompanyHR]

    def post(self, request, batch_id):
        batch = relocation_batches_repo.get_company_batch(batch_id, str(request.user.id))
        if not batch:
            return api_response(message="Relocation batch not found.", status_code=status.HTTP_404_NOT_FOUND)

        approved_listings = listings_repo.get_approved_listings()
        localities_map = {}
        for l in approved_listings:
            loc = l.get("locality")
            if loc:
                localities_map[loc] = localities_map.get(loc, 0) + 1

        localities_list = [{"locality": k, "listings_count": v} for k, v in localities_map.items()]
        profile = {
            "rent_budget": batch.get("budget", 100000) / max(1, batch.get("headcount", 1)),
            "commute_tolerance_minutes": 30,
            "lifestyle_pref": "quiet"
        }
        top_localities = scoring.score_localities(profile, localities_list)

        return api_response(
            data={
                "recommended_localities": top_localities,
                "approved_listings": approved_listings[:6]
            },
            message="Batch housing search completed."
        )


class BatchAllocateView(APIView):
    """POST /api/company/relocation-batches/:id/allocate"""
    permission_classes = [IsCompanyHR]

    def post(self, request, batch_id):
        serializer = AllocationCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        try:
            success = relocation_batches_repo.allocate_employee_to_listing(batch_id, str(request.user.id), serializer.validated_data)
            if not success:
                return api_response(message="Allocation failed.", status_code=status.HTTP_400_BAD_REQUEST)
            return api_response(message="Employee allocated to property successfully.")
        except ValueError as val_err:
            return api_response(message=str(val_err), status_code=status.HTTP_400_BAD_REQUEST)


class BatchReportView(APIView):
    """GET /api/company/relocation-batches/:id/report"""
    permission_classes = [IsCompanyHR]

    def get(self, request, batch_id):
        batch = relocation_batches_repo.get_company_batch(batch_id, str(request.user.id))
        if not batch:
            return api_response(message="Relocation batch not found.", status_code=status.HTTP_404_NOT_FOUND)

        allocations = batch.get("allocations", [])
        employees = batch.get("employees", [])
        total_allocated_cost = sum(float(a.get("cost", 0)) for a in allocations)
        total_budget = float(batch.get("budget", 0))

        report = {
            "batch_id": batch_id,
            "batch_name": batch.get("batch_name"),
            "company_id": str(batch.get("company_id")),
            "office_locations": batch.get("office_locations", []),
            "headcount": batch.get("headcount", 0),
            "employees_registered": len(employees),
            "allocated_employees_count": len(allocations),
            "total_budget": total_budget,
            "total_allocated_cost": total_allocated_cost,
            "budget_remaining": total_budget - total_allocated_cost,
            "budget_utilization_percent": round((total_allocated_cost / total_budget * 100), 1) if total_budget > 0 else 0,
            "employees": employees,
            "allocations": allocations
        }
        return api_response(data=report, message="Batch relocation report generated.")

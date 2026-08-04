"""apps/company/views.py — DRF views for Company/HR relocation batches (Architecture.md §4.4, FR-8)"""
from rest_framework.views import APIView
from rest_framework import status
from apps.common.responses import api_response
from apps.accounts.permissions import IsCompanyHR
from db import relocation_batches_repo, users_repo, listings_repo
from apps.recommendations import scoring
from .serializers import (
    CompanyProfileSerializer,
    RelocationBatchCreateSerializer,
    EmployeeAddSerializer,
    AllocationCreateSerializer
)


class CompanyProfileView(APIView):
    """POST /api/company/profile — Company/HR onboarding profile."""
    permission_classes = [IsCompanyHR]

    def post(self, request):
        serializer = CompanyProfileSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        updated_user = users_repo.update_role_profile(request.user.id, serializer.validated_data)
        return api_response(data=updated_user, message="Company profile saved successfully.")


class RelocationBatchesView(APIView):
    """GET /api/company/relocation-batches — list company relocation batches.
    POST /api/company/relocation-batches — create a new batch.
    """
    permission_classes = [IsCompanyHR]

    def get(self, request):
        batches = relocation_batches_repo.get_company_batches(request.user.id)
        # Compute budget summary server-side for each batch
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
        data['company_id'] = request.user.id
        batch_id = relocation_batches_repo.create_relocation_batch(data)
        return api_response(data={"batch_id": batch_id}, message="Relocation batch created.", status_code=status.HTTP_201_CREATED)


class RelocationBatchDetailView(APIView):
    """GET /api/company/relocation-batches/:id — batch detail with computed budget metrics.
    PUT /api/company/relocation-batches/:id — update batch.
    DELETE /api/company/relocation-batches/:id — delete batch.
    """
    permission_classes = [IsCompanyHR]

    def get(self, request, batch_id):
        batch = relocation_batches_repo.get_company_batch(batch_id, request.user.id)
        if not batch:
            return api_response(message="Relocation batch not found.", status_code=status.HTTP_404_NOT_FOUND)

        allocations = batch.get("allocations", [])
        budget_used = sum(float(a.get("cost", 0)) for a in allocations)
        total_budget = float(batch.get("budget", 0))
        budget_remaining = total_budget - budget_used

        res_data = dict(batch)
        res_data["budget_used"] = budget_used
        res_data["budget_remaining"] = budget_remaining
        res_data["allocated_count"] = len(allocations)

        return api_response(data=res_data, message="Relocation batch retrieved.")

    def put(self, request, batch_id):
        serializer = RelocationBatchCreateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        updated = relocation_batches_repo.update_batch(batch_id, request.user.id, serializer.validated_data)
        if not updated:
            return api_response(message="Relocation batch not found.", status_code=status.HTTP_404_NOT_FOUND)

        return api_response(data=updated, message="Relocation batch updated.")

    def delete(self, request, batch_id):
        success = relocation_batches_repo.delete_batch(batch_id, request.user.id)
        if not success:
            return api_response(message="Relocation batch not found or failed to delete.", status_code=status.HTTP_404_NOT_FOUND)

        return api_response(message="Relocation batch deleted successfully.")


class BatchEmployeesView(APIView):
    """POST /api/company/relocation-batches/:id/employees — add employee to batch."""
    permission_classes = [IsCompanyHR]

    def post(self, request, batch_id):
        serializer = EmployeeAddSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        try:
            success = relocation_batches_repo.add_employee_to_batch(batch_id, request.user.id, serializer.validated_data)
            if not success:
                return api_response(message="Failed to add employee.", status_code=status.HTTP_400_BAD_REQUEST)
            return api_response(message="Employee added to relocation batch.")
        except ValueError as val_err:
            return api_response(message=str(val_err), status_code=status.HTTP_400_BAD_REQUEST)


class BatchEmployeeDetailView(APIView):
    """DELETE /api/company/relocation-batches/:id/employees/:employee_id — remove employee from batch."""
    permission_classes = [IsCompanyHR]

    def delete(self, request, batch_id, employee_id):
        success = relocation_batches_repo.remove_employee_from_batch(batch_id, request.user.id, employee_id)
        if not success:
            return api_response(message="Employee not found in batch.", status_code=status.HTTP_404_NOT_FOUND)

        return api_response(message="Employee removed from relocation batch.")


class BatchSearchView(APIView):
    """POST /api/company/relocation-batches/:id/search — bulk housing search using shared scoring engine (FR-8)."""
    permission_classes = [IsCompanyHR]

    def post(self, request, batch_id):
        batch = relocation_batches_repo.get_company_batch(batch_id, request.user.id)
        if not batch:
            return api_response(message="Relocation batch not found.", status_code=status.HTTP_404_NOT_FOUND)

        approved_listings = listings_repo.get_approved_listings()
        
        # Calculate locality recommendation scores reusing scoring.py
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
    """POST /api/company/relocation-batches/:id/allocate — assign employee to approved housing."""
    permission_classes = [IsCompanyHR]

    def post(self, request, batch_id):
        serializer = AllocationCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        try:
            success = relocation_batches_repo.allocate_employee_to_listing(batch_id, request.user.id, serializer.validated_data)
            if not success:
                return api_response(message="Allocation failed.", status_code=status.HTTP_400_BAD_REQUEST)
            return api_response(message="Employee allocated to property successfully.")
        except ValueError as val_err:
            return api_response(message=str(val_err), status_code=status.HTTP_400_BAD_REQUEST)


class BatchReportView(APIView):
    """GET /api/company/relocation-batches/:id/report — JSON relocation summary report."""
    permission_classes = [IsCompanyHR]

    def get(self, request, batch_id):
        batch = relocation_batches_repo.get_company_batch(batch_id, request.user.id)
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

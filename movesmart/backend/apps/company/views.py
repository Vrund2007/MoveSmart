"""apps/company/views.py — DRF views for Company/HR relocation batches (new v2.0, Architecture.md §4.4, FR-8)"""
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.accounts.permissions import IsCompanyHR


class CompanyProfileView(APIView):
    """POST /api/company/profile — Company/HR onboarding profile."""
    permission_classes = [IsCompanyHR]

    def post(self, request):
        # TODO: validate via CompanyProfileSerializer
        # TODO: update company_hr role_profile (company_name, office_locations) in db.users_repo
        pass


class RelocationBatchesView(APIView):
    """POST /api/company/relocation-batches — create a new batch.
    GET not explicitly scoped here; Company dashboard fetches own batches.
    """
    permission_classes = [IsCompanyHR]

    def post(self, request):
        # TODO: validate via RelocationBatchSerializer
        # TODO: write to db.relocation_batches_repo.create_batch() with company_id from JWT
        pass


class RelocationBatchDetailView(APIView):
    """GET /api/company/relocation-batches/:id — batch detail including budget-used (computed server-side)."""
    permission_classes = [IsCompanyHR]

    def get(self, request, batch_id):
        # TODO: verify batch.company_id == current user (FR-7)
        # TODO: compute budget_used = sum(allocations[].cost) server-side — never stored (database.md §3.7)
        # TODO: return batch + employees + allocations + budget_used + budget_remaining
        pass


class BatchSearchView(APIView):
    """POST /api/company/relocation-batches/:id/search — bulk housing search using shared scoring engine (FR-8)."""
    permission_classes = [IsCompanyHR]

    def post(self, request, batch_id):
        # TODO: verify batch ownership (FR-7)
        # TODO: call apps.recommendations.scoring.score_localities() — SAME shared service as Find Accommodation (FR-8)
        # TODO: filter to approved listings only (FR-3, via db.listings_repo.get_approved_listings)
        # TODO: return ranked housing candidates per employee constraint
        pass


class BatchAllocateView(APIView):
    """POST /api/company/relocation-batches/:id/allocate — assign employees to housing."""
    permission_classes = [IsCompanyHR]

    def post(self, request, batch_id):
        # TODO: validate via AllocationSerializer (employee_id → listing_id pairs)
        # TODO: update relocation_batches.allocations[] in MongoDB (embedded array — database.md §3.7)
        pass


class BatchReportView(APIView):
    """GET /api/company/relocation-batches/:id/report — JSON/CSV export of allocation summary."""
    permission_classes = [IsCompanyHR]

    def get(self, request, batch_id):
        # TODO: verify batch ownership (FR-7)
        # TODO: return structured JSON summary: who allocated where, at what cost (no PDF — PRD §7.4)
        pass

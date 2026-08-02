"""apps/admin_review/views.py — Admin listing approval queue (new v2.0, Architecture.md §4.5, FR-4, FR-5)
NOTE: 'admin_review' is the app name (not Django's built-in admin site) — see Architecture.md §2.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.accounts.permissions import IsAdmin


class ReviewQueueView(APIView):
    """GET /api/admin/listings?status=pending_review — list pending listings for Admin review."""
    permission_classes = [IsAdmin]

    def get(self, request):
        # TODO: call db.listings_repo.get_listings_by_status('pending_review')
        # TODO: return listing list with owner info for Admin review
        pass


class ReviewActionView(APIView):
    """PATCH /api/admin/listings/:id/review — approve or reject a listing (FR-4, FR-5).
    Only admin-role can call this — enforced by IsAdmin permission class, not just routing.
    There is no code path that writes status='approved' outside this endpoint (FR-4).
    On rejection, rejection_reason is required and stored on the listing for submitter visibility (FR-5).
    """
    permission_classes = [IsAdmin]

    def patch(self, request, listing_id):
        # TODO: validate via ReviewActionSerializer (decision: 'approved'|'rejected', reason required if rejected — FR-5)
        # TODO: call db.listings_repo.set_listing_status(listing_id, decision, reason)
        # TODO: on approval, listing becomes visible to all public browse/search endpoints
        pass

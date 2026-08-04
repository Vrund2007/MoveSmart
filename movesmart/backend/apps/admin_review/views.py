"""apps/admin_review/views.py — Admin listing approval queue (Architecture.md §4.5, FR-4, FR-5)"""
from rest_framework.views import APIView
from rest_framework import status
from apps.common.responses import api_response
from apps.accounts.permissions import IsAdmin
from db import listings_repo
from .serializers import ReviewActionSerializer


class ReviewQueueView(APIView):
    """GET /api/admin/listings?status=pending_review — list pending listings for Admin review."""
    permission_classes = [IsAdmin]

    def get(self, request):
        status_param = request.query_params.get('status', 'pending_review')
        listings = listings_repo.get_listings_by_status(status_param)
        return api_response(data=listings, message="Review queue fetched successfully.")


class ReviewActionView(APIView):
    """PATCH /api/admin/listings/:id/review — approve or reject a listing (FR-4, FR-5)."""
    permission_classes = [IsAdmin]

    def patch(self, request, listing_id):
        serializer = ReviewActionSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        decision = data['decision']
        reason = data.get('reason')

        listings_repo.set_listing_status(listing_id, decision, reason)
        updated = listings_repo.get_listing_by_id(listing_id, include_non_approved=True)

        return api_response(data=updated, message=f"Listing status updated to {decision}.")

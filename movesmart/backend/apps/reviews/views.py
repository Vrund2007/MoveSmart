"""apps/reviews/views.py — DRF views for tenant reviews"""
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from apps.common.responses import api_response
from apps.accounts.permissions import IsOwner
from db import reviews_repo, listings_repo
from .serializers import ReviewCreateSerializer, ReviewReplySerializer


class OwnerReviewsView(APIView):
    """GET /api/owner/reviews — all reviews across owner's properties.
    POST /api/owner/reviews — create a review (authenticated users only).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Owner sees all reviews for their properties."""
        reviews = reviews_repo.get_owner_reviews(request.user.id)
        avg = reviews_repo.get_average_rating(request.user.id)
        return api_response(data={"reviews": reviews, "average_rating": avg},
                            message="Reviews retrieved.")

    def post(self, request):
        """Any authenticated user can submit a review for a property."""
        serializer = ReviewCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error.",
                                status_code=status.HTTP_400_BAD_REQUEST)
        data = serializer.validated_data
        for field in ["move_in_date", "move_out_date"]:
            if data.get(field):
                data[field] = str(data[field])
        rid = reviews_repo.create_review(data)
        created = reviews_repo.get_review_by_id(rid)
        return api_response(data=created, message="Review submitted.",
                            status_code=status.HTTP_201_CREATED)


class ReviewPropertyView(APIView):
    """GET /api/owner/reviews/property/:property_id — reviews for a specific listing."""
    permission_classes = [IsOwner]

    def get(self, request, property_id):
        # Verify ownership
        listing = listings_repo.get_listing_by_id(property_id, include_non_approved=True)
        if not listing or listing.get("owner_id") != request.user.id:
            return api_response(message="Property not found.", status_code=status.HTTP_404_NOT_FOUND)
        reviews = reviews_repo.get_reviews_for_property(property_id)
        return api_response(data=reviews, message="Property reviews retrieved.")


class ReviewReplyView(APIView):
    """POST /api/owner/reviews/:review_id/reply — owner adds reply."""
    permission_classes = [IsOwner]

    def post(self, request, review_id):
        serializer = ReviewReplySerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error.",
                                status_code=status.HTTP_400_BAD_REQUEST)
        reply = serializer.validated_data["reply"]
        review = reviews_repo.get_review_by_id(review_id)
        if not review:
            return api_response(message="Review not found.", status_code=status.HTTP_404_NOT_FOUND)

        # Verify owner owns the property
        listing = listings_repo.get_listing_by_id(review["property_id"], include_non_approved=True)
        if not listing or listing.get("owner_id") != request.user.id:
            return api_response(message="Not authorised.", status_code=status.HTTP_403_FORBIDDEN)

        reviews_repo.add_owner_reply(review_id, reply)
        updated = reviews_repo.get_review_by_id(review_id)
        return api_response(data=updated, message="Reply added.")

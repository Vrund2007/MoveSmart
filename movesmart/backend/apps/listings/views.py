"""apps/listings/views.py — DRF views for listings browse, create, manage (Architecture.md §4.1–§4.3, FR-3, FR-7)"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny


class ListingsView(APIView):
    """GET /api/listings — browse approved listings (status=approved always, FR-3).
    POST /api/listings — Owner/Broker create listing (status: pending_review set server-side, FR-3).
    """

    def get(self, request):
        # TODO: parse filters: locality, bhk, budget, deal_type from query params
        # TODO: call db.listings_repo.get_approved_listings(filters) — status=approved enforced in repo (FR-3)
        # TODO: run XGBoost rent prediction per listing (ml.rent_prediction.model.predict)
        # TODO: run Isolation Forest per listing (ml.suspicious_listing.model.predict)
        # TODO: return enriched listing list
        pass

    def post(self, request):
        # TODO: check user role is 'property_owner' or 'broker' (IsOwnerOrBroker permission)
        # TODO: validate via ListingCreateSerializer
        # TODO: set status='pending_review' in serializer (not from request — FR-3, FR-4)
        # TODO: set owner_id from JWT user; submitted_by_broker_id if broker
        # TODO: write to MongoDB via db.listings_repo.create_listing()
        pass


class ListingDetailView(APIView):
    """GET/PUT/DELETE /api/listings/:id — single listing detail, edit, delete."""

    def get(self, request, listing_id):
        # TODO: fetch listing by ID; apply status=approved filter unless Owner/Broker viewing own listing
        pass

    def put(self, request, listing_id):
        # TODO: verify owner_id == current user (FR-7)
        # TODO: validate via ListingUpdateSerializer
        # TODO: update in MongoDB; if resubmitting rejected listing, clear rejection_reason and set status=pending_review (FR-5)
        pass

    def delete(self, request, listing_id):
        # TODO: verify owner_id == current user (FR-7)
        # TODO: delete from MongoDB via db.listings_repo.delete_listing()
        pass


class ListingAnalyticsView(APIView):
    """GET /api/listings/:id/analytics — view/enquiry counts for Owner/Broker."""

    def get(self, request, listing_id):
        # TODO: verify caller is owner or broker of this listing (FR-7)
        # TODO: return view_count, enquiry_count from listing document (database.md §3.2)
        pass


class SavedListingsView(APIView):
    """POST /api/saved-listings, GET /api/saved-listings — bookmark management."""

    def post(self, request):
        # TODO: validate listing_id; call db.saved_items_repo.save_listing()
        pass

    def get(self, request):
        # TODO: call db.saved_items_repo.get_saved_listings(user_id)
        pass


class SavedListingDetailView(APIView):
    """DELETE /api/saved-listings/:id — remove bookmark."""

    def delete(self, request, saved_id):
        # TODO: verify user owns this saved item (FR-7 implied)
        # TODO: call db.saved_items_repo.unsave_listing()
        pass

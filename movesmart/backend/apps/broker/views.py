"""apps/broker/views.py — DRF views for Broker / Agent Module (Architecture.md §4.3, PRD §7)"""
from rest_framework.views import APIView
from rest_framework import status
from apps.common.responses import api_response
from apps.accounts.permissions import IsBroker
from db import listings_repo, leads_repo, commissions_repo
from apps.recommendations.scoring import score_localities
from .serializers import (
    BrokerListingCreateSerializer,
    LeadStatusSerializer,
    CommissionCreateSerializer,
    ClientMatchSerializer
)


class BrokerListingsView(APIView):
    """GET /api/broker/listings — view broker-managed inventory.
    POST /api/broker/listings — submit listing on behalf of property owner.
    """
    permission_classes = [IsBroker]

    def get(self, request):
        listings = listings_repo.get_listings_by_broker(request.user.id)
        return api_response(data=listings, message="Broker managed inventory retrieved.")

    def post(self, request):
        serializer = BrokerListingCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        listing_data = serializer.validated_data
        listing_data["submitted_by_broker_id"] = request.user.id
        listing_data["status"] = "pending_review"  # Broker cannot bypass review (FR-4)
        listing_data["source"] = "platform"

        created = listings_repo.create_listing(listing_data)
        return api_response(data=created, message="Listing submitted for Admin review.", status_code=status.HTTP_201_CREATED)


class BrokerListingDetailView(APIView):
    """PUT /api/broker/listings/:id — update broker listing (resets rejected status to pending_review).
    DELETE /api/broker/listings/:id — delete broker listing.
    """
    permission_classes = [IsBroker]

    def put(self, request, listing_id):
        existing = listings_repo.get_listing_by_id(listing_id, include_non_approved=True)
        if not existing:
            return api_response(message="Listing not found.", status_code=status.HTTP_404_NOT_FOUND)

        if existing.get("submitted_by_broker_id") != request.user.id:
            return api_response(message="Permission denied. You can only manage your own listings.", status_code=status.HTTP_403_FORBIDDEN)

        serializer = BrokerListingCreateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        update_data = serializer.validated_data
        if existing.get("status") == "rejected":
            updated = listings_repo.resubmit_listing(listing_id, update_data)
        else:
            updated = listings_repo.update_listing(listing_id, update_data)

        return api_response(data=updated, message="Listing updated.")

    def delete(self, request, listing_id):
        existing = listings_repo.get_listing_by_id(listing_id, include_non_approved=True)
        if not existing:
            return api_response(message="Listing not found.", status_code=status.HTTP_404_NOT_FOUND)

        if existing.get("submitted_by_broker_id") != request.user.id:
            return api_response(message="Permission denied.", status_code=status.HTTP_403_FORBIDDEN)

        success = listings_repo.delete_listing(listing_id)
        if not success:
            return api_response(message="Failed to delete listing.", status_code=status.HTTP_400_BAD_REQUEST)

        return api_response(message="Listing deleted successfully.")


class LeadsView(APIView):
    """GET /api/leads?broker=me — Broker's lead pipeline."""
    permission_classes = [IsBroker]

    def get(self, request):
        leads = leads_repo.get_broker_leads(request.user.id)
        return api_response(data=leads, message="Broker leads retrieved.")


class LeadDetailView(APIView):
    """PATCH /api/leads/:id — update lead_status (new -> contacted -> converted | lost)."""
    permission_classes = [IsBroker]

    def patch(self, request, lead_id):
        serializer = LeadStatusSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        new_status = serializer.validated_data['lead_status']
        try:
            success = leads_repo.update_lead_status(lead_id, request.user.id, new_status)
            if not success:
                return api_response(message="Lead not found or permission denied.", status_code=status.HTTP_404_NOT_FOUND)
            return api_response(message=f"Lead status updated to {new_status}.")
        except ValueError as val_err:
            return api_response(message=str(val_err), status_code=status.HTTP_400_BAD_REQUEST)


class CommissionsView(APIView):
    """POST /api/commissions — log commission for converted lead.
    GET /api/commissions — broker's own commission records.
    """
    permission_classes = [IsBroker]

    def post(self, request):
        serializer = CommissionCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        data['broker_id'] = request.user.id
        try:
            created = commissions_repo.create_commission(data)
            return api_response(data=created, message="Commission recorded.", status_code=status.HTTP_201_CREATED)
        except ValueError as val_err:
            return api_response(message=str(val_err), status_code=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        commissions = commissions_repo.get_broker_commissions(request.user.id)
        return api_response(data=commissions, message="Commissions retrieved.")


class CommissionDetailView(APIView):
    """PATCH /api/commissions/:id — update payment status ('pending' -> 'paid')."""
    permission_classes = [IsBroker]

    def patch(self, request, commission_id):
        new_status = request.data.get("payment_status")
        if new_status not in ["pending", "paid"]:
            return api_response(message="payment_status must be 'pending' or 'paid'.", status_code=status.HTTP_400_BAD_REQUEST)

        success = commissions_repo.update_payment_status(commission_id, request.user.id, new_status)
        if not success:
            return api_response(message="Commission record not found or permission denied.", status_code=status.HTTP_404_NOT_FOUND)

        return api_response(message=f"Commission payment status updated to {new_status}.")


class ClientMatchView(APIView):
    """POST /api/broker/client-match — Match client requirements with localities & approved listings.
    REUSES apps/recommendations/scoring.py (FR-8).
    """
    permission_classes = [IsBroker]

    def post(self, request):
        serializer = ClientMatchSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        profile = serializer.validated_data
        approved = listings_repo.get_approved_listings()

        localities_map = {}
        for l in approved:
            loc = l.get("locality")
            if loc:
                localities_map[loc] = localities_map.get(loc, 0) + 1

        localities_list = [{"locality": k, "listings_count": v} for k, v in localities_map.items()]
        top_localities = score_localities(profile, localities_list)

        # Match top approved listings within target localities
        top_locality_names = {item["locality"] for item in top_localities}
        matched_listings = [
            l for l in approved if l.get("locality") in top_locality_names and l.get("price", 0) <= profile["rent_budget"] * 1.2
        ]

        return api_response(
            data={
                "recommended_localities": top_localities,
                "matched_properties": matched_listings[:5]
            },
            message="Client match recommendations computed successfully."
        )

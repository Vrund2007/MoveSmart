"""apps/enquiries/views.py — DRF views for structured enquiries (Architecture.md §4.1/§4.2, PRD §7.1)"""
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from apps.common.responses import api_response
from db import enquiries_repo, listings_repo, leads_repo
from .serializers import EnquiryCreateSerializer


class EnquiriesView(APIView):
    """POST /api/enquiries — Find Accommodation user sends enquiry to Owner/Broker.
    GET /api/enquiries?listing_owner=me — Owner retrieves own listing enquiries (FR-7).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = EnquiryCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        listing_id = data['listing_id']
        listing = listings_repo.get_listing_by_id(listing_id, include_non_approved=False)
        if not listing:
            return api_response(message="Listing not found or not approved.", status_code=status.HTTP_404_NOT_FOUND)

        recipient_id = listing.get('submitted_by_broker_id') or listing.get('owner_id')
        enquiry_payload = {
            "listing_id": listing_id,
            "from_user_id": request.user.id,
            "to_owner_or_broker_id": recipient_id,
            "message": data['message']
        }

        enquiry_id = enquiries_repo.create_enquiry(enquiry_payload)

        # If managed by a broker, create a lead record
        if listing.get('submitted_by_broker_id'):
            leads_repo.create_lead(listing['submitted_by_broker_id'], enquiry_id, lead_status='new')

        return api_response(data={"enquiry_id": enquiry_id}, message="Enquiry sent successfully.", status_code=status.HTTP_201_CREATED)

    def get(self, request):
        enquiries = enquiries_repo.get_enquiries_for_recipient(request.user.id)
        return api_response(data=enquiries, message="Enquiries retrieved successfully.")

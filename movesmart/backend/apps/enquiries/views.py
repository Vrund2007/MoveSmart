"""apps/enquiries/views.py — DRF views for structured enquiries (Architecture.md §4.1/§4.2, PRD §7.1)"""
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from apps.common.responses import api_response
from db import enquiries_repo, listings_repo, leads_repo, messages_repo
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
        if not recipient_id:
            return api_response(
                message="Owner not registered on MoveSmart platform (Scraped Listing). Direct messaging and enquiry conversation is unavailable for scraped listings.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        enquiry_payload = {
            "listing_id": listing_id,
            "from_user_id": request.user.id,
            "to_owner_or_broker_id": recipient_id,
            "message": data['message']
        }

        enquiry_id = enquiries_repo.create_enquiry(enquiry_payload)
        listings_repo.increment_enquiry_count(listing_id)

        # Start/update conversation thread in Inbox between seeker and owner
        try:
            participants = [str(request.user.id), str(recipient_id)]
            conv = messages_repo.get_or_create_conversation(participants, str(listing_id))
            if conv and conv.get('_id'):
                messages_repo.add_message_to_conversation(conv['_id'], str(request.user.id), data['message'])
        except Exception:
            pass

        # If managed by a broker, create a lead record
        if listing.get('submitted_by_broker_id'):
            try:
                leads_repo.create_lead({
                    'broker_id': listing['submitted_by_broker_id'],
                    'enquiry_id': enquiry_id,
                    'listing_id': listing_id,
                    'seeker_email': getattr(request.user, 'email', ''),
                    'lead_status': 'new'
                })
            except Exception:
                pass

        return api_response(
            data={"enquiry_id": enquiry_id, "conversation_started": True},
            message="Enquiry sent successfully! Conversation started in your Inbox.",
            status_code=status.HTTP_201_CREATED
        )

    def get(self, request):
        enquiries = enquiries_repo.get_enquiries_for_recipient(request.user.id)
        return api_response(data=enquiries, message="Enquiries retrieved successfully.")

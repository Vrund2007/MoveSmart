"""apps/enquiries/views.py — DRF views for structured enquiries (new v2.0, Architecture.md §4.1/§4.2, PRD §7.1)"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


class EnquiriesView(APIView):
    """POST /api/enquiries — Find Accommodation user sends enquiry to Owner/Broker.
    GET /api/enquiries?listing_owner=me — Owner retrieves own listing enquiries (FR-7).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # TODO: validate via EnquiryCreateSerializer
        # TODO: resolve to_owner_or_broker_id from listing.owner_id / submitted_by_broker_id at creation
        # TODO: write to db.enquiries_repo.create_enquiry()
        # TODO: increment listing.enquiry_count counter in MongoDB
        # TODO: if listing is managed by a broker, also create a lead record in db.leads_repo (lead_status='new')
        pass

    def get(self, request):
        # TODO: only return enquiries for listings owned by the current user (FR-7)
        # TODO: call db.enquiries_repo.get_enquiries_for_owner(user_id)
        pass

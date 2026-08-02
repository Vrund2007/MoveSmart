"""apps/enquiries/serializers.py — DRF serializers for enquiries (database.md §3.4)"""
from rest_framework import serializers


class EnquiryCreateSerializer(serializers.Serializer):
    """Validates POST /api/enquiries payload from a Find Accommodation user."""
    listing_id = serializers.CharField()
    message = serializers.CharField(max_length=2000)
    # NOTE: from_user_id and to_owner_or_broker_id are resolved server-side from JWT and listing, not provided by client

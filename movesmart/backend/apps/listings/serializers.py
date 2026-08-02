"""apps/listings/serializers.py — DRF serializers for listings (Architecture.md §2, FR-3, FR-5)"""
from rest_framework import serializers

LISTING_STATUS_CHOICES = ['pending_review', 'approved', 'rejected']
DEAL_TYPE_CHOICES = ['rent', 'buy']


class ListingCreateSerializer(serializers.Serializer):
    """Validates incoming listing data from Owner/Broker (POST /api/listings).
    NOTE (FR-3): 'status' is NOT a field here — it is forced to 'pending_review'
    in the view before writing to MongoDB. Do not allow clients to set status.
    """
    title = serializers.CharField()
    description = serializers.CharField(required=False, allow_blank=True)
    deal_type = serializers.ChoiceField(choices=DEAL_TYPE_CHOICES)
    price = serializers.FloatField(min_value=0)
    bhk = serializers.IntegerField(min_value=0)
    area_sqft = serializers.FloatField(required=False)
    locality = serializers.CharField()
    coordinates = serializers.DictField()  # TODO: GeoJSON Point {type, coordinates: [lng, lat]}
    furnishing = serializers.CharField(required=False, allow_blank=True)
    amenities = serializers.ListField(child=serializers.CharField(), required=False)
    images = serializers.ListField(child=serializers.URLField(), required=False)


class ListingUpdateSerializer(ListingCreateSerializer):
    """Validates listing edit data (PUT /api/listings/:id).
    All fields optional for partial updates.
    On resubmission of a rejected listing, view clears rejection_reason and resets status to pending_review (FR-5).
    """
    # TODO: make all fields optional (partial=True on instantiation)
    pass


class ListingResponseSerializer(serializers.Serializer):
    """Shapes the listing response object returned to clients."""
    # TODO: all listing fields including status, rejection_reason (for owner/broker only), verification_flags, predicted_price_range
    pass

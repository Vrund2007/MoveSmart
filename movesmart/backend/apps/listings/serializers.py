"""apps/listings/serializers.py — DRF serializers for listings (Architecture.md §2, FR-3, FR-5)"""
from rest_framework import serializers

LISTING_STATUS_CHOICES = ['pending_review', 'approved', 'rejected']
DEAL_TYPE_CHOICES = ['rent', 'buy', 'sale']


class ListingCreateSerializer(serializers.Serializer):
    """Validates incoming listing data from Owner/Broker (POST /api/listings).
    
    NOTE (FR-3): 'status' is NOT set by the client — forced to 'pending_review' in view.
    """
    title = serializers.CharField(required=False, allow_blank=True, default="Property Listing")
    description = serializers.CharField(required=False, allow_blank=True, default="")
    deal_type = serializers.CharField(required=False, allow_blank=True, default="rent")
    price = serializers.FloatField(required=False, min_value=0, default=0.0)
    deposit = serializers.FloatField(required=False, allow_null=True, default=0.0)
    bhk = serializers.IntegerField(required=False, min_value=0, default=2)
    bathrooms = serializers.IntegerField(required=False, allow_null=True, default=2)
    area_sqft = serializers.FloatField(required=False, allow_null=True, default=0.0)
    floor = serializers.IntegerField(required=False, allow_null=True, default=1)
    total_floors = serializers.IntegerField(required=False, allow_null=True, default=5)
    locality = serializers.CharField(required=False, allow_blank=True, default="Ahmedabad")
    address = serializers.CharField(required=False, allow_blank=True, default="")
    available_from = serializers.CharField(required=False, allow_blank=True, allow_null=True, default="")
    coordinates = serializers.DictField(required=False, allow_null=True, default=dict)
    furnishing = serializers.CharField(required=False, allow_blank=True, default="Furnished")
    amenities = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    images = serializers.ListField(child=serializers.CharField(), required=False, default=list)



class ListingUpdateSerializer(serializers.Serializer):
    """Validates listing edit data (PUT /api/listings/:id). All fields optional."""
    title = serializers.CharField(required=False)
    description = serializers.CharField(required=False, allow_blank=True)
    deal_type = serializers.ChoiceField(choices=DEAL_TYPE_CHOICES, required=False)
    price = serializers.FloatField(min_value=0, required=False)
    deposit = serializers.FloatField(required=False, allow_null=True)
    bhk = serializers.IntegerField(min_value=0, required=False)
    bathrooms = serializers.IntegerField(required=False, allow_null=True)
    area_sqft = serializers.FloatField(required=False, allow_null=True)
    locality = serializers.CharField(required=False)
    address = serializers.CharField(required=False, allow_blank=True)
    coordinates = serializers.DictField(required=False)
    furnishing = serializers.CharField(required=False, allow_blank=True)
    amenities = serializers.ListField(child=serializers.CharField(), required=False)
    images = serializers.ListField(child=serializers.CharField(), required=False)


class ListingResponseSerializer(serializers.Serializer):
    """Shapes the listing response object returned to clients."""
    _id = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField(required=False, allow_blank=True)
    deal_type = serializers.ChoiceField(choices=DEAL_TYPE_CHOICES)
    price = serializers.FloatField()
    deposit = serializers.FloatField(required=False, allow_null=True)
    bhk = serializers.IntegerField()
    bathrooms = serializers.IntegerField(required=False, allow_null=True)
    area_sqft = serializers.FloatField(required=False, allow_null=True)
    locality = serializers.CharField()
    address = serializers.CharField(required=False, allow_blank=True)
    coordinates = serializers.DictField(required=False)
    furnishing = serializers.CharField(required=False, allow_blank=True)
    amenities = serializers.ListField(child=serializers.CharField(), required=False)
    images = serializers.ListField(child=serializers.CharField(), required=False)
    status = serializers.ChoiceField(choices=LISTING_STATUS_CHOICES)
    rejection_reason = serializers.CharField(required=False, allow_null=True)
    verification_flags = serializers.DictField(required=False, allow_null=True)
    predicted_price_range = serializers.DictField(required=False, allow_null=True)
    view_count = serializers.IntegerField(default=0)
    enquiry_count = serializers.IntegerField(default=0)

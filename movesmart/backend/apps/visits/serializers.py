"""apps/visits/serializers.py — DRF serializers for property visits"""
from rest_framework import serializers

VISIT_STATUS_CHOICES = ['requested', 'confirmed', 'completed', 'cancelled']


class VisitCreateSerializer(serializers.Serializer):
    """Validates POST /api/visits payload."""
    listing_id = serializers.CharField(required=True)
    scheduled_date = serializers.CharField(required=True)  # YYYY-MM-DD
    time_slot = serializers.CharField(required=False, default="10:00 AM - 11:00 AM")
    notes = serializers.CharField(required=False, allow_blank=True, default="")


class VisitStatusUpdateSerializer(serializers.Serializer):
    """Validates PUT /api/visits/:id/status payload."""
    status = serializers.ChoiceField(choices=VISIT_STATUS_CHOICES, required=True)
    notes = serializers.CharField(required=False, allow_blank=True)

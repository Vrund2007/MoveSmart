"""apps/admin_platform/serializers.py — DRF serializers for Super Admin Platform (Phase 14)"""
from rest_framework import serializers

DECISION_CHOICES = ['approved', 'rejected', 'archived']
STATUS_CHOICES = ['active', 'suspended']


class BulkListingActionSerializer(serializers.Serializer):
    """Validates POST /api/admin/listings/bulk payload."""
    listing_ids = serializers.ListField(child=serializers.CharField(), min_length=1)
    decision = serializers.ChoiceField(choices=DECISION_CHOICES)
    reason = serializers.CharField(required=False, allow_blank=True)


class UserStatusUpdateSerializer(serializers.Serializer):
    """Validates PATCH /api/admin/users/:id payload."""
    account_status = serializers.ChoiceField(choices=STATUS_CHOICES)

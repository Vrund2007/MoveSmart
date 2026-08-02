"""apps/admin_review/serializers.py — DRF serializers for Admin review actions (FR-4, FR-5)"""
from rest_framework import serializers


class ReviewActionSerializer(serializers.Serializer):
    """Validates PATCH /api/admin/listings/:id/review payload.
    decision: 'approved' or 'rejected'
    reason: required when decision == 'rejected' (FR-5); not applicable for approval.
    """
    DECISION_CHOICES = ['approved', 'rejected']
    decision = serializers.ChoiceField(choices=DECISION_CHOICES)
    reason = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        # TODO: if decision == 'rejected', require reason to be non-empty (FR-5)
        return data

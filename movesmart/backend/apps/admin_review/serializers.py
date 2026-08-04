"""apps/admin_review/serializers.py — DRF serializers for Admin review actions (FR-4, FR-5)"""
from rest_framework import serializers


class ReviewActionSerializer(serializers.Serializer):
    """Validates PATCH /api/admin/listings/:id/review payload."""
    DECISION_CHOICES = ['approved', 'rejected']
    decision = serializers.ChoiceField(choices=DECISION_CHOICES)
    reason = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def validate(self, data):
        if data.get('decision') == 'rejected':
            reason = data.get('reason')
            if not reason or not reason.strip():
                raise serializers.ValidationError({"reason": "A reason is required when rejecting a listing."})
        return data

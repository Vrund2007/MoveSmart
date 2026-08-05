"""apps/notifications/serializers.py — DRF serializers for notifications (Phase 13)"""
from rest_framework import serializers

NOTIFICATION_TYPES = ['property', 'visit', 'message', 'approval', 'ai', 'reminder', 'system']
PRIORITY_CHOICES = ['low', 'medium', 'high', 'urgent']


class NotificationCreateSerializer(serializers.Serializer):
    """Validates POST /api/notifications payload."""
    recipient_id = serializers.CharField(required=True)
    title = serializers.CharField(max_length=200)
    message = serializers.CharField(max_length=1000)
    type = serializers.ChoiceField(choices=NOTIFICATION_TYPES, default='system')
    priority = serializers.ChoiceField(choices=PRIORITY_CHOICES, default='medium')
    reference_type = serializers.CharField(required=False, allow_null=True)
    reference_id = serializers.CharField(required=False, allow_null=True)

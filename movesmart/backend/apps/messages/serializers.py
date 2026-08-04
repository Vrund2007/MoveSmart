"""apps/messages/serializers.py — DRF serializers for user-to-user messaging"""
from rest_framework import serializers


class ConversationCreateSerializer(serializers.Serializer):
    """Validates POST /api/messages/conversations payload."""
    recipient_id = serializers.CharField(required=True)
    listing_id = serializers.CharField(required=False, allow_blank=True, default=None)
    initial_message = serializers.CharField(required=False, allow_blank=True, default="Hi, I am interested in this listing.")


class MessageAddSerializer(serializers.Serializer):
    """Validates POST /api/messages/conversations/:id/messages payload."""
    text = serializers.CharField(required=True, min_length=1)

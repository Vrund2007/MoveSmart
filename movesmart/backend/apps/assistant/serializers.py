"""apps/assistant/serializers.py — DRF serializers for AI assistant."""
from rest_framework import serializers


class ChatSerializer(serializers.Serializer):
    """Validates POST /api/assistant/chat payload."""
    message = serializers.CharField(max_length=1000)

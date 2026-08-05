"""apps/calendar/serializers.py — DRF serializers for universal calendar (Phase 13)"""
from rest_framework import serializers

EVENT_TYPE_CHOICES = ['visit', 'meeting', 'move_date', 'relocation_event', 'task', 'appointment']


class CalendarEventCreateSerializer(serializers.Serializer):
    """Validates POST /api/calendar/events payload."""
    title = serializers.CharField(max_length=200)
    event_type = serializers.ChoiceField(choices=EVENT_TYPE_CHOICES, default='task')
    start_time = serializers.CharField(required=False)
    end_time = serializers.CharField(required=False)
    description = serializers.CharField(required=False, allow_blank=True)
    location = serializers.CharField(required=False, allow_blank=True)
    reference_id = serializers.CharField(required=False, allow_null=True)

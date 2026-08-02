"""apps/broker/serializers.py — DRF serializers for broker leads and commissions (database.md §3.5, §3.6)"""
from rest_framework import serializers

LEAD_STATUS_CHOICES = ['new', 'contacted', 'converted', 'lost']


class LeadStatusSerializer(serializers.Serializer):
    """Validates PATCH /api/leads/:id payload."""
    lead_status = serializers.ChoiceField(choices=LEAD_STATUS_CHOICES)


class CommissionCreateSerializer(serializers.Serializer):
    """Validates POST /api/commissions payload (database.md §3.6).
    lead_id must reference a lead with status == 'converted' — enforced in view.
    """
    lead_id = serializers.CharField()
    amount = serializers.FloatField(min_value=0)
    payment_status = serializers.ChoiceField(choices=['pending', 'received'])
    deal_date = serializers.DateField()

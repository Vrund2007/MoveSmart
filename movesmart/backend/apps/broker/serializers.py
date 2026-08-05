"""apps/broker/serializers.py — DRF serializers for broker module (database.md §3.4, §3.5, Phase 11)"""
from rest_framework import serializers

LEAD_STATUS_CHOICES = ['new', 'qualified', 'contacted', 'visit_scheduled', 'negotiation', 'converted', 'lost']
PRIORITY_CHOICES = ['low', 'medium', 'high', 'urgent']
TASK_STATUS_CHOICES = ['todo', 'in_progress', 'completed']
LIFESTYLE_CHOICES = ['quiet', 'vibrant', 'transit']
CLIENT_STATUS_CHOICES = ['active', 'inactive', 'archived']


class BrokerListingCreateSerializer(serializers.Serializer):
    """Validates POST /api/broker/listings payload."""
    title = serializers.CharField(max_length=200)
    description = serializers.CharField(required=False, allow_blank=True)
    deal_type = serializers.ChoiceField(choices=['rent', 'buy', 'commercial'], default='rent')
    price = serializers.FloatField(min_value=0)
    bhk = serializers.IntegerField(min_value=1)
    area_sqft = serializers.FloatField(required=False, allow_null=True)
    locality = serializers.CharField(max_length=100)
    owner_id = serializers.CharField(required=True)
    coordinates = serializers.JSONField(required=False)
    furnishing = serializers.CharField(required=False, default='semi-furnished')
    amenities = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    images = serializers.ListField(child=serializers.CharField(), required=False, default=list)


class ClientSerializer(serializers.Serializer):
    """Validates POST/PUT /api/broker/clients payload."""
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    phone = serializers.CharField(max_length=30, required=False, allow_blank=True)
    budget = serializers.FloatField(min_value=0, default=0)
    preferred_locations = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    property_preferences = serializers.JSONField(required=False, default=dict)
    lifestyle = serializers.ChoiceField(choices=LIFESTYLE_CHOICES, default='vibrant')
    status = serializers.ChoiceField(choices=CLIENT_STATUS_CHOICES, default='active')
    favorite = serializers.BooleanField(default=False)
    tags = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    notes = serializers.ListField(child=serializers.CharField(), required=False, default=list)


class LeadStatusSerializer(serializers.Serializer):
    """Validates PATCH /api/leads/:id payload."""
    lead_status = serializers.ChoiceField(choices=LEAD_STATUS_CHOICES, required=False)
    priority = serializers.ChoiceField(choices=PRIORITY_CHOICES, required=False)
    note = serializers.CharField(required=False, allow_blank=True)
    tags = serializers.ListField(child=serializers.CharField(), required=False)


class TaskSerializer(serializers.Serializer):
    """Validates POST/PATCH /api/broker/tasks payload."""
    title = serializers.CharField(max_length=200)
    description = serializers.CharField(required=False, allow_blank=True, default='')
    priority = serializers.ChoiceField(choices=PRIORITY_CHOICES, default='medium')
    status = serializers.ChoiceField(choices=TASK_STATUS_CHOICES, default='todo')
    due_date = serializers.CharField(required=False)
    related_client_id = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    related_listing_id = serializers.CharField(required=False, allow_null=True, allow_blank=True)


class CommissionCreateSerializer(serializers.Serializer):
    """Validates POST /api/commissions payload (database.md §3.5)."""
    lead_id = serializers.CharField(required=True)
    listing_id = serializers.CharField(required=False, allow_null=True)
    amount = serializers.FloatField(min_value=0)
    payment_status = serializers.ChoiceField(choices=['pending', 'paid'], default='pending')
    deal_date = serializers.CharField(required=False)


class ClientMatchSerializer(serializers.Serializer):
    """Validates POST /api/broker/client-match payload."""
    rent_budget = serializers.FloatField(min_value=0, default=25000)
    commute_tolerance_minutes = serializers.IntegerField(min_value=5, default=30)
    lifestyle_pref = serializers.CharField(required=False, default='quiet')
    work_or_college_location = serializers.CharField(required=False, default='Ahmedabad')

"""apps/company/serializers.py — DRF serializers for Company/HR relocation (database.md §3.6)"""
from rest_framework import serializers

BATCH_STATUS_CHOICES = ['draft', 'active', 'completed']


class CompanyProfileSerializer(serializers.Serializer):
    """Validates POST /api/company/profile payload."""
    company_name = serializers.CharField(max_length=200)
    office_locations = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    hr_contact = serializers.CharField(required=False, allow_blank=True)
    department = serializers.CharField(required=False, allow_blank=True)


class RelocationBatchCreateSerializer(serializers.Serializer):
    """Validates POST /api/company/relocation-batches payload (database.md §3.6)."""
    batch_name = serializers.CharField(max_length=200)
    office_locations = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    headcount = serializers.IntegerField(min_value=1, default=1)
    budget = serializers.FloatField(min_value=0, default=100000)
    status = serializers.ChoiceField(choices=BATCH_STATUS_CHOICES, default='active')


class EmployeeAddSerializer(serializers.Serializer):
    """Validates POST /api/company/relocation-batches/:id/employees payload."""
    employee_id = serializers.CharField(required=False, allow_blank=True)
    name = serializers.CharField(max_length=100)
    budget = serializers.FloatField(min_value=0, default=25000)
    constraints = serializers.DictField(required=False, default=dict)
    preferences = serializers.DictField(required=False, default=dict)


class AllocationCreateSerializer(serializers.Serializer):
    """Validates POST /api/company/relocation-batches/:id/allocate payload."""
    employee_id = serializers.CharField(required=True)
    listing_id = serializers.CharField(required=True)
    cost = serializers.FloatField(min_value=0, required=False)

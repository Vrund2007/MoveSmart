"""apps/company/serializers.py — DRF serializers for Company/HR relocation (database.md §3.7)"""
from rest_framework import serializers

BATCH_STATUS_CHOICES = ['open', 'in_progress', 'completed']


class OfficeLocationSerializer(serializers.Serializer):
    name = serializers.CharField()
    coordinates = serializers.DictField()  # TODO: GeoJSON Point


class RelocationBatchSerializer(serializers.Serializer):
    """Validates POST /api/company/relocation-batches payload (database.md §3.7)."""
    office_locations = OfficeLocationSerializer(many=True)
    headcount = serializers.IntegerField(min_value=1)
    budget = serializers.FloatField(min_value=0)
    employees = serializers.ListField(required=False)
    # NOTE: allocations[] are NOT provided at creation — added via BatchAllocateView later


class AllocationSerializer(serializers.Serializer):
    """Validates POST /api/company/relocation-batches/:id/allocate payload."""
    allocations = serializers.ListField()
    # TODO: each item: {employee_id (batch-local string), listing_id, cost}


class CompanyProfileSerializer(serializers.Serializer):
    """Validates POST /api/company/profile payload."""
    company_name = serializers.CharField()
    office_locations = OfficeLocationSerializer(many=True)

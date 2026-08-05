"""apps/company/serializers.py — DRF serializers for Company/HR relocation (database.md §3.6, Phase 12)"""
from rest_framework import serializers

BATCH_STATUS_CHOICES = ['draft', 'active', 'completed']
RELOCATION_STATUS_CHOICES = ['initiated', 'broker_assigned', 'property_shortlisted', 'visit_scheduled', 'approved', 'moved']
APPROVAL_STATUS_CHOICES = ['pending', 'approved', 'rejected', 'needs_revision']
APPROVAL_TYPE_CHOICES = ['broker_assignment', 'housing_allocation', 'budget_exception', 'employee_confirmation', 'company_confirmation']
EXPENSE_CATEGORY_CHOICES = ['Housing', 'Broker Fee', 'Transportation', 'Temporary Stay', 'Documentation', 'Miscellaneous']


class CompanyProfileSerializer(serializers.Serializer):
    """Validates POST /api/company/profile payload."""
    company_name = serializers.CharField(max_length=200)
    office_locations = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    hr_contact = serializers.CharField(required=False, allow_blank=True)
    department = serializers.CharField(required=False, allow_blank=True)
    working_hours = serializers.CharField(required=False, default='9:00 AM - 6:00 PM')
    relocation_policy = serializers.CharField(required=False, allow_blank=True, default='Standard Corporate Relocation Policy')


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
    email = serializers.EmailField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    department = serializers.CharField(required=False, default='Engineering')
    designation = serializers.CharField(required=False, default='Team Member')
    office_location = serializers.CharField(required=False, default='Ahmedabad HQ')
    housing_budget = serializers.FloatField(min_value=0, default=30000)
    lifestyle_preference = serializers.CharField(required=False, default='quiet')
    commute_preference_minutes = serializers.IntegerField(default=30)
    relocation_status = serializers.ChoiceField(choices=RELOCATION_STATUS_CHOICES, default='initiated')


class AllocationCreateSerializer(serializers.Serializer):
    """Validates POST /api/company/relocation-batches/:id/allocate payload."""
    employee_id = serializers.CharField(required=True)
    listing_id = serializers.CharField(required=True)
    cost = serializers.FloatField(min_value=0, required=False)


class BrokerAssignmentCreateSerializer(serializers.Serializer):
    """Validates POST /api/company/broker-assignments payload."""
    broker_id = serializers.CharField(required=True)
    employee_id = serializers.CharField(required=True)
    notes = serializers.CharField(required=False, allow_blank=True)


class ApprovalCreateSerializer(serializers.Serializer):
    """Validates POST /api/company/approvals payload."""
    employee_id = serializers.CharField(required=True)
    approval_type = serializers.ChoiceField(choices=APPROVAL_TYPE_CHOICES, default='housing_allocation')
    reason = serializers.CharField(required=False, allow_blank=True)
    details = serializers.JSONField(required=False, default=dict)


class ApprovalUpdateSerializer(serializers.Serializer):
    """Validates PATCH /api/company/approvals/:id payload."""
    status = serializers.ChoiceField(choices=APPROVAL_STATUS_CHOICES)
    reason = serializers.CharField(required=False, allow_blank=True)


class ExpenseCreateSerializer(serializers.Serializer):
    """Validates POST /api/company/expenses payload."""
    employee_id = serializers.CharField(required=False, default='General')
    category = serializers.ChoiceField(choices=EXPENSE_CATEGORY_CHOICES, default='Miscellaneous')
    amount = serializers.FloatField(min_value=0)
    status = serializers.ChoiceField(choices=['pending', 'approved', 'reimbursed'], default='approved')
    notes = serializers.CharField(required=False, allow_blank=True)

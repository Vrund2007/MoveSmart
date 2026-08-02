"""apps/accounts/serializers.py — DRF serializers for accounts (Architecture.md §2, FR-1, FR-2)
NOTE (FR-2): RoleSerializer's choices MUST exclude 'admin' from the public-facing PATCH /api/auth/role
endpoint. This is a server-side enforcement, not just a UI omission — the serializer rejects 'admin'
even if it is submitted directly via API call (e.g., by curl), satisfying FR-2 as a real control.
"""
from rest_framework import serializers

# Valid public roles — 'admin' is intentionally omitted (FR-2)
PUBLIC_ROLE_CHOICES = [
    'find_accommodation',
    'property_owner',
    'broker',
    'company_hr',
]


class RegisterSerializer(serializers.Serializer):
    """Validates email + password for POST /api/auth/register."""
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    # TODO: add confirm_password field and cross-field validation


class LoginSerializer(serializers.Serializer):
    """Validates credentials for POST /api/auth/login."""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class RoleSerializer(serializers.Serializer):
    """Validates role for PATCH /api/auth/role.
    'admin' is excluded from choices — enforced here, not just in the UI (FR-2).
    """
    role = serializers.ChoiceField(choices=PUBLIC_ROLE_CHOICES)


class FindAccommodationProfileSerializer(serializers.Serializer):
    """Validates role_profile fields for Find Accommodation users (database.md §3.1)."""
    # TODO: salary, work_or_college_location {name, coordinates}, rent_budget, lifestyle_pref, commute_tolerance_minutes
    pass


class PropertyOwnerProfileSerializer(serializers.Serializer):
    """Validates role_profile fields for Property Owner users (database.md §3.1)."""
    # TODO: contact_phone, business_name (optional)
    pass


class BrokerProfileSerializer(serializers.Serializer):
    """Validates role_profile fields for Broker users (database.md §3.1)."""
    # TODO: contact_phone, agency_name (optional)
    pass


class CompanyHRProfileSerializer(serializers.Serializer):
    """Validates role_profile fields for Company/HR users (database.md §3.1)."""
    # TODO: company_name, office_locations[] {name, coordinates}
    pass

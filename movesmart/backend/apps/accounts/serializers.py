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
    """Validates email + password + confirm_password for POST /api/auth/register."""
    name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    confirm_password = serializers.CharField(min_length=8, write_only=True)

    def validate_email(self, value):
        return value.lower().strip()

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data


class LoginSerializer(serializers.Serializer):
    """Validates credentials for POST /api/auth/login."""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate_email(self, value):
        return value.lower().strip()


class RoleSerializer(serializers.Serializer):
    """Validates role for PATCH /api/auth/role.
    'admin' is excluded from choices — enforced here, not just in the UI (FR-2).
    """
    role = serializers.ChoiceField(choices=PUBLIC_ROLE_CHOICES)


# ── Role-specific profile serializers (database.md §3.1) ──────────────────────

class _CoordinatesSerializer(serializers.Serializer):
    name = serializers.CharField()
    coordinates = serializers.ListField(
        child=serializers.FloatField(), min_length=2, max_length=2
    )  # [lng, lat]


class FindAccommodationProfileSerializer(serializers.Serializer):
    """role_profile fields for find_accommodation users (database.md §3.1)."""
    salary = serializers.FloatField(required=False, allow_null=True)
    work_or_college_location = _CoordinatesSerializer(required=False, allow_null=True)
    rent_budget = serializers.FloatField(required=False, allow_null=True)
    lifestyle_pref = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    commute_tolerance_minutes = serializers.IntegerField(required=False, allow_null=True)


class PropertyOwnerProfileSerializer(serializers.Serializer):
    """role_profile fields for property_owner users (database.md §3.1)."""
    contact_phone = serializers.CharField(max_length=20)
    business_name = serializers.CharField(max_length=200, required=False, allow_blank=True)


class BrokerProfileSerializer(serializers.Serializer):
    """role_profile fields for broker users (database.md §3.1)."""
    contact_phone = serializers.CharField(max_length=20)
    agency_name = serializers.CharField(max_length=200, required=False, allow_blank=True)


class CompanyHRProfileSerializer(serializers.Serializer):
    """role_profile fields for company_hr users (database.md §3.1)."""
    company_name = serializers.CharField(max_length=200)
    office_locations = serializers.ListField(
        child=_CoordinatesSerializer(), required=False, default=list
    )


PROFILE_SERIALIZER_MAP = {
    'find_accommodation': FindAccommodationProfileSerializer,
    'property_owner':     PropertyOwnerProfileSerializer,
    'broker':             BrokerProfileSerializer,
    'company_hr':         CompanyHRProfileSerializer,
}

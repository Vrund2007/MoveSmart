"""apps/accounts/permissions.py — Role-based DRF permission classes (new v2.0, Architecture.md §4.0, §4.5, FR-4, FR-7)
These classes are the server-side gate for role-specific endpoints.
IsAdmin in particular is what enforces FR-4 (only admin may approve/reject listings).
"""
from rest_framework.permissions import BasePermission


class IsOwner(BasePermission):
    """Allows access only to users with role == 'property_owner' (FR-7)."""

    def has_permission(self, request, view):
        # TODO: check request.user.role == 'property_owner'
        pass


class IsBroker(BasePermission):
    """Allows access only to users with role == 'broker' (FR-7)."""

    def has_permission(self, request, view):
        # TODO: check request.user.role == 'broker'
        pass


class IsCompanyHR(BasePermission):
    """Allows access only to users with role == 'company_hr' (FR-7)."""

    def has_permission(self, request, view):
        # TODO: check request.user.role == 'company_hr'
        pass


class IsAdmin(BasePermission):
    """Allows access only to users with role == 'admin'.
    This is the server-side guard for PATCH /api/admin/listings/:id/review (FR-4).
    Admin accounts can only be provisioned manually — never via the public registration flow (FR-2).
    """

    def has_permission(self, request, view):
        # TODO: check request.user.role == 'admin'
        pass


class IsOwnerOrBroker(BasePermission):
    """Allows access to users with role == 'property_owner' or 'broker'."""

    def has_permission(self, request, view):
        # TODO: check request.user.role in ('property_owner', 'broker')
        pass

"""apps/accounts/permissions.py — Role-based DRF permission classes (Architecture.md §4.0, §4.5, FR-4, FR-7)

Server-side permission guards for role-specific routes.
"""
from rest_framework.permissions import BasePermission
from apps.common.constants import UserRoles


class IsFindAccommodation(BasePermission):
    """Allows access only to authenticated users with role == 'find_accommodation'."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and getattr(request.user, 'is_authenticated', False)
            and getattr(request.user, 'role', None) == UserRoles.FIND_ACCOMMODATION
        )


class IsOwner(BasePermission):
    """Allows access only to users with role == 'property_owner' (FR-7)."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and getattr(request.user, 'is_authenticated', False)
            and getattr(request.user, 'role', None) == UserRoles.PROPERTY_OWNER
        )


class IsBroker(BasePermission):
    """Allows access only to users with role == 'broker' (FR-7)."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and getattr(request.user, 'is_authenticated', False)
            and getattr(request.user, 'role', None) == UserRoles.BROKER
        )


class IsCompanyHR(BasePermission):
    """Allows access only to users with role == 'company_hr' (FR-7)."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and getattr(request.user, 'is_authenticated', False)
            and getattr(request.user, 'role', None) == UserRoles.COMPANY_HR
        )


class IsAdmin(BasePermission):
    """Allows access only to users with role == 'admin' (FR-4).
    
    Admin accounts can only be provisioned manually — never via public registration (FR-2).
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and getattr(request.user, 'is_authenticated', False)
            and getattr(request.user, 'role', None) == UserRoles.ADMIN
        )


class IsOwnerOrBroker(BasePermission):
    """Allows access to users with role == 'property_owner' or 'broker'."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and getattr(request.user, 'is_authenticated', False)
            and getattr(request.user, 'role', None) in (UserRoles.PROPERTY_OWNER, UserRoles.BROKER)
        )

"""apps/accounts/services.py — Service layer for authentication and role management.

Contains business logic for user registration, authentication, role assignment, and onboarding profile updates.
"""
from typing import Dict, Any, Tuple
from django.contrib.auth.hashers import make_password, check_password
from rest_framework_simplejwt.tokens import RefreshToken
import pymongo.errors
from . import repository


class AccountServiceError(Exception):
    """Base exception for account service errors."""
    pass


class DuplicateEmailError(AccountServiceError):
    """Raised when an email already exists in MongoDB."""
    pass


class InvalidCredentialsError(AccountServiceError):
    """Raised when authentication fails."""
    pass


class RoleImmutableError(AccountServiceError):
    """Raised when trying to alter an already-set role (FR-1)."""
    pass


def issue_tokens(user_id: str) -> Dict[str, str]:
    """Issue JWT access and refresh tokens for a user ID."""
    refresh = RefreshToken()
    refresh['user_id'] = str(user_id)
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }


def register_user(email: str, password: str) -> Tuple[Dict[str, Any], Dict[str, str]]:
    """Register a new user in MongoDB.
    
    Returns:
        Tuple of (user_dict, tokens_dict)
    """
    password_hash = make_password(password)
    try:
        user_doc = repository.create_user_record(email=email, password_hash=password_hash)
    except pymongo.errors.DuplicateKeyError:
        raise DuplicateEmailError("An account with this email address already exists.")

    tokens = issue_tokens(user_doc['_id'])
    return user_doc, tokens


def authenticate_user(email: str, password: str) -> Tuple[Dict[str, Any], Dict[str, str]]:
    """Authenticate user with email and password.
    
    Returns:
        Tuple of (safe_user_dict, tokens_dict)
    """
    user_doc = repository.get_user_by_email(email=email)
    if not user_doc or not check_password(password, user_doc.get('password_hash', '')):
        raise InvalidCredentialsError("Invalid email or password.")

    safe_user = {k: v for k, v in user_doc.items() if k != 'password_hash'}
    safe_user['_id'] = str(safe_user['_id'])

    tokens = issue_tokens(safe_user['_id'])
    return safe_user, tokens


def assign_role(user_id: str, role: str) -> Dict[str, Any]:
    """Set role for a user. Rejects if role is already assigned (FR-1)."""
    try:
        return repository.set_user_role(user_id=user_id, role=role)
    except ValueError as exc:
        raise RoleImmutableError(str(exc)) from exc


def update_profile(user_id: str, profile_data: dict) -> Dict[str, Any]:
    """Update role_profile subdocument for a user."""
    return repository.update_user_role_profile(user_id=user_id, profile_data=profile_data)

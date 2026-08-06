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


def register_user(email: str, password: str, name: str = "") -> Tuple[Dict[str, Any], Dict[str, str]]:
    """Register a new user in MongoDB.
    
    Returns:
        Tuple of (user_dict, tokens_dict)
    """
    clean_email = email.lower().strip()
    existing = repository.get_user_by_email(clean_email)
    if existing:
        raise DuplicateEmailError(f"An account with email '{clean_email}' already exists.")

    password_hash = make_password(password)
    try:
        user_doc = repository.create_user_record(email=clean_email, password_hash=password_hash, name=name)
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


def change_password(user_id: str, old_password: str, new_password: str) -> bool:
    """Verify old password and set new password_hash for user."""
    user = repository.get_user_by_id(user_id)
    if not user:
        raise AccountServiceError("User not found.")

    user_with_pass = repository.get_user_by_email(user.get('email', ''))
    if not user_with_pass or not check_password(old_password, user_with_pass.get('password_hash', '')):
        raise InvalidCredentialsError("Incorrect current password.")

    if len(new_password) < 6:
        raise AccountServiceError("New password must be at least 6 characters long.")

    new_hash = make_password(new_password)
    return repository.update_user_password(user_id=user_id, new_password_hash=new_hash)


def delete_account(user_id: str, password: str) -> bool:
    """Verify user password and permanently delete user account."""
    user = repository.get_user_by_id(user_id)
    if not user:
        raise AccountServiceError("User not found.")

    user_with_pass = repository.get_user_by_email(user.get('email', ''))
    if not user_with_pass or not check_password(password, user_with_pass.get('password_hash', '')):
        raise InvalidCredentialsError("Incorrect password. Account deletion aborted.")

    return repository.delete_user_record(user_id=user_id)


def google_auth_user(email: str, name: str = "", picture: str = "", google_id: str = "", role: str = None) -> Tuple[Dict[str, Any], Dict[str, str]]:
    """Authenticate or register user via Google OAuth."""
    user_doc = repository.get_user_by_email(email=email)
    if not user_doc:
        password_hash = make_password(f"google_oauth_{google_id}_{email}")
        user_doc = repository.create_user_record(email=email, password_hash=password_hash)
        if role and role in ['seeker', 'owner', 'broker']:
            try:
                repository.set_user_role(user_id=str(user_doc['_id']), role=role)
            except Exception:
                pass
            user_doc = repository.get_user_by_email(email=email)

    safe_user = {k: v for k, v in user_doc.items() if k != 'password_hash'}
    safe_user['_id'] = str(safe_user['_id'])

    tokens = issue_tokens(safe_user['_id'])
    return safe_user, tokens


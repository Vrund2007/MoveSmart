"""apps/accounts/repository.py — Data repository layer for accounts app.

Wraps db.users_repo to isolate PyMongo database queries (Architecture.md §2, database.md §3.1).
"""
from typing import Optional, Dict, Any
from db import users_repo


def create_user_record(email: str, password_hash: str) -> Dict[str, Any]:
    """Insert a new user document into MongoDB users collection."""
    return users_repo.create_user(email=email, password_hash=password_hash)


def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Fetch user by email (includes password_hash for authentication only)."""
    return users_repo.get_user_by_email(email=email)


def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Fetch user document by _id (strips password_hash)."""
    return users_repo.get_user_by_id(user_id=user_id)


def set_user_role(user_id: str, role: str) -> Dict[str, Any]:
    """Set role once on the user document (FR-1). Immutable thereafter."""
    return users_repo.set_role(user_id=user_id, role=role)


def update_user_role_profile(user_id: str, profile_data: dict) -> Dict[str, Any]:
    """Update role_profile subdocument for a user."""
    return users_repo.update_role_profile(user_id=user_id, profile_data=profile_data)

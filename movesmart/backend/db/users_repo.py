"""db/users_repo.py — PyMongo access layer for users collection (database.md §3.1, Architecture.md §2)
All user reads/writes go through this module — never direct collection access from app views.
password_hash must never be returned by any function here (Rules.md §3).
"""
from .connection import get_db


def create_user(email: str, password_hash: str) -> dict:
    """Insert a new user document (email + password_hash only at creation).
    Returns the created user dict (without password_hash).
    TODO: insert into db['users']; set created_at, updated_at
    """
    pass


def get_user_by_email(email: str) -> dict:
    """Fetch user by email for login. Returns full document including password_hash (for verification only).
    Callers must never return password_hash in an API response.
    TODO: db['users'].find_one({'email': email})
    """
    pass


def get_user_by_id(user_id: str) -> dict:
    """Fetch user by _id. Returns user without password_hash.
    TODO: db['users'].find_one({'_id': ObjectId(user_id)}, {'password_hash': 0})
    """
    pass


def set_role(user_id: str, role: str) -> None:
    """Set users.role field once. 'admin' must not be reachable via this function from the public API (FR-2).
    TODO: db['users'].update_one({'_id': ObjectId(user_id)}, {'$set': {'role': role, 'updated_at': ...}})
    """
    pass


def update_role_profile(user_id: str, profile_data: dict) -> None:
    """Update role_profile subdocument for a user.
    TODO: db['users'].update_one({'_id': ...}, {'$set': {'role_profile': profile_data, 'updated_at': ...}})
    """
    pass

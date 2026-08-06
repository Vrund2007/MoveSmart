"""db/users_repo.py — PyMongo access layer for users collection (database.md §3.1, Architecture.md §2)
All user reads/writes go through this module — never direct collection access from app views.
password_hash must never be returned by any function here except get_user_by_email (for login only).
"""
from datetime import datetime, timezone
from bson import ObjectId
from .connection import get_db


def _now() -> datetime:
    return datetime.now(timezone.utc)


def create_user(email: str, password_hash: str, name: str = "") -> dict:
    """Insert a new user document. Role is unset at creation — set via PATCH /api/auth/role.
    Returns the created user dict WITHOUT password_hash (Rules.md §3).
    Raises pymongo.errors.DuplicateKeyError if email already exists.
    """
    db = get_db()
    now = _now()
    clean_email = email.lower().strip()
    user_name = name.strip() if name and name.strip() else clean_email.split('@')[0].capitalize()
    doc = {
        'email': clean_email,
        'name': user_name,
        'password_hash': password_hash,
        'role': None,          # set by PATCH /api/auth/role (FR-1)
        'role_profile': {},
        'created_at': now,
        'updated_at': now,
    }
    result = db['users'].insert_one(doc)
    doc['_id'] = result.inserted_id
    # never return password_hash (Rules.md §3)
    return _serialize_user(doc)


def create_admin_user(email: str, password_hash: str, name: str = "Admin") -> dict:
    """Insert a new admin user document into MongoDB."""
    db = get_db()
    now = _now()
    doc = {
        'email': email.lower().strip(),
        'name': name.strip(),
        'password_hash': password_hash,
        'role': 'admin',
        'role_profile': {'admin_level': 'superadmin'},
        'account_status': 'active',
        'created_at': now,
        'updated_at': now,
    }
    result = db['users'].insert_one(doc)
    doc['_id'] = result.inserted_id
    return _serialize_user(doc)


def get_user_by_email(email: str) -> dict | None:
    """Fetch user by email — includes password_hash for login verification ONLY.
    Callers must never include password_hash in any API response.
    """
    db = get_db()
    return db['users'].find_one({'email': email.lower().strip()})


def get_user_by_id(user_id: str) -> dict | None:
    """Fetch user by _id. Returns user WITHOUT password_hash (Rules.md §3)."""
    db = get_db()
    doc = db['users'].find_one(
        {'_id': ObjectId(user_id)},
        {'password_hash': 0}
    )
    if doc:
        doc = _serialize_user(doc)
    return doc


def set_role(user_id: str, role: str) -> dict:
    """Set users.role once. Raises ValueError if role is already set (FR-1).
    'admin' must not be reachable via this function from the public API (FR-2) —
    callers must validate role via RoleSerializer before calling this.
    Returns updated user (without password_hash).
    """
    db = get_db()
    existing = db['users'].find_one({'_id': ObjectId(user_id)}, {'role': 1})
    if not existing:
        raise ValueError(f"User {user_id} not found")
    if existing.get('role') is not None:
        raise ValueError("Role is already set and is immutable (FR-1)")

    db['users'].update_one(
        {'_id': ObjectId(user_id)},
        {'$set': {'role': role, 'updated_at': _now()}}
    )
    return get_user_by_id(user_id)


def update_role_profile(user_id: str, profile_data: dict) -> dict:
    """Update role_profile subdocument for a user (merges profile_data with existing role_profile). Returns updated user."""
    db = get_db()
    existing_user = db['users'].find_one({'_id': ObjectId(user_id)}, {'role_profile': 1})
    current_profile = (existing_user.get('role_profile') or {}) if existing_user else {}
    
    # Clean null/empty keys if not explicitly provided
    clean_data = {k: v for k, v in profile_data.items() if v is not None}
    merged_profile = {**current_profile, **clean_data}

    db['users'].update_one(
        {'_id': ObjectId(user_id)},
        {'$set': {'role_profile': merged_profile, 'updated_at': _now()}}
    )
    return get_user_by_id(user_id)


def unlock_feature(user_id: str, feature: str) -> dict:
    """Add feature ('recommendations' or 'commute') to user's unlocked_features set."""
    db = get_db()
    db['users'].update_one(
        {'_id': ObjectId(user_id)},
        {
            '$addToSet': {'unlocked_features': feature},
            '$set': {'updated_at': _now()}
        }
    )
    return get_user_by_id(user_id)


def update_password(user_id: str, new_password_hash: str) -> bool:
    """Update password_hash for a user ID in MongoDB."""
    db = get_db()
    res = db['users'].update_one(
        {'_id': ObjectId(user_id)},
        {'$set': {'password_hash': new_password_hash, 'updated_at': _now()}}
    )
    return res.modified_count > 0


def delete_user_by_id(user_id: str) -> bool:
    """Permanently delete user document and related bookmarks/data from MongoDB."""
    db = get_db()
    obj_id = ObjectId(user_id)
    # Remove user's saved listings and notifications if any
    db['saved_listings'].delete_many({'user_id': user_id})
    db['notifications'].delete_many({'user_id': user_id})
    res = db['users'].delete_one({'_id': obj_id})
    return res.deleted_count > 0


def _serialize_user(doc: dict) -> dict:
    """Convert ObjectId → str and strip password_hash for safe serialization."""
    doc = dict(doc)
    doc.pop('password_hash', None)
    if '_id' in doc:
        doc['_id'] = str(doc['_id'])
    doc.setdefault('unlocked_features', [])
    return doc

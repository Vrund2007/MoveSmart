"""db/saved_items_repo.py — PyMongo access layer for saved_items collection (database.md §3.3)"""
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from bson import ObjectId
from .connection import get_db
from . import listings_repo


def _serialize(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return doc
    doc = dict(doc)
    doc["_id"] = str(doc["_id"])
    doc["user_id"] = str(doc["user_id"])
    doc["listing_id"] = str(doc["listing_id"])
    return doc


def save_item(user_id: str, listing_id: str) -> Dict[str, Any]:
    """Save a listing bookmark for a user. Prevents duplicate saves."""
    db = get_db()
    try:
        u_oid = ObjectId(user_id)
        l_oid = ObjectId(listing_id)
    except Exception:
        raise ValueError("Invalid user_id or listing_id format.")

    # Check duplicate
    existing = db["saved_items"].find_one({
        "user_id": u_oid,
        "listing_id": l_oid
    })
    if existing:
        return _serialize(existing)

    now = datetime.now(timezone.utc)
    doc = {
        "user_id": u_oid,
        "listing_id": l_oid,
        "created_at": now,
        "saved_at": now
    }
    result = db["saved_items"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize(doc)


def get_user_saved_items(user_id: str) -> List[Dict[str, Any]]:
    """Get all saved items for a user, populated with listing details."""
    db = get_db()
    try:
        u_oid = ObjectId(user_id)
    except Exception:
        return []

    cursor = db["saved_items"].find({"user_id": u_oid}).sort("created_at", -1)
    saved_items = []
    for item in cursor:
        serialized_item = _serialize(item)
        listing = listings_repo.get_listing_by_id(serialized_item["listing_id"], include_non_approved=True)
        serialized_item["listing"] = listing
        saved_items.append(serialized_item)

    return saved_items


def remove_saved_item(saved_id: str, user_id: str) -> bool:
    """Remove a saved item bookmark."""
    db = get_db()
    try:
        s_oid = ObjectId(saved_id)
        u_oid = ObjectId(user_id)
    except Exception:
        return False

    result = db["saved_items"].delete_one({
        "_id": s_oid,
        "user_id": u_oid
    })
    return result.deleted_count > 0

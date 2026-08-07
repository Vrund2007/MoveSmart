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
        u_oid = ObjectId(user_id) if (user_id and ObjectId.is_valid(user_id)) else user_id
        l_oid = ObjectId(listing_id) if (listing_id and ObjectId.is_valid(listing_id)) else listing_id
    except Exception:
        raise ValueError("Invalid user_id or listing_id format.")

    # Check duplicate (check both ObjectId and string representation)
    existing = db["saved_items"].find_one({
        "$or": [
            {"user_id": u_oid, "listing_id": l_oid},
            {"user_id": str(user_id), "listing_id": str(listing_id)}
        ]
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
    if not user_id:
        return []

    u_oid = ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id
    cursor = db["saved_items"].find({
        "$or": [
            {"user_id": u_oid},
            {"user_id": str(user_id)}
        ]
    }).sort("created_at", -1)

    saved_items = []
    orphaned_ids = []

    for item in cursor:
        serialized_item = _serialize(item)
        listing = listings_repo.get_listing_by_id(serialized_item["listing_id"], include_non_approved=True)
        if listing:
            serialized_item["listing"] = listing
            saved_items.append(serialized_item)
        else:
            orphaned_ids.append(item["_id"])

    # Auto-purge orphaned saved items whose original listing was deleted
    if orphaned_ids:
        try:
            db["saved_items"].delete_many({
                "_id": {"$in": [ObjectId(i) if ObjectId.is_valid(str(i)) else i for i in orphaned_ids]}
            })
        except Exception:
            pass

    return saved_items


def remove_saved_item(saved_id: str, user_id: str) -> bool:
    """Remove a saved item bookmark by saved_id OR listing_id."""
    db = get_db()
    if not saved_id or not user_id:
        return False

    u_oid = ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id

    # 1. Try deleting by saved_item _id (if valid ObjectId)
    if ObjectId.is_valid(saved_id):
        s_oid = ObjectId(saved_id)
        result = db["saved_items"].delete_one({
            "_id": s_oid,
            "$or": [{"user_id": u_oid}, {"user_id": str(user_id)}]
        })
        if result.deleted_count > 0:
            return True

    # 2. Try deleting by listing_id (ObjectId or string)
    l_oid = ObjectId(saved_id) if ObjectId.is_valid(saved_id) else saved_id
    result = db["saved_items"].delete_one({
        "listing_id": l_oid,
        "$or": [{"user_id": u_oid}, {"user_id": str(user_id)}]
    })
    if result.deleted_count > 0:
        return True

    # 3. Fallback string match for legacy records
    result = db["saved_items"].delete_one({
        "$or": [
            {"_id": str(saved_id)},
            {"listing_id": str(saved_id)}
        ],
        "$or": [
            {"user_id": u_oid},
            {"user_id": str(user_id)}
        ]
    })
    return result.deleted_count > 0


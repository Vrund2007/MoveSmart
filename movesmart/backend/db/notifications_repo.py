"""db/notifications_repo.py — PyMongo access layer for notifications collection (database.md §3, Phase 13)"""
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from bson import ObjectId
from .connection import get_db

VALID_TYPES = {"property", "visit", "message", "approval", "ai", "reminder", "system"}
VALID_PRIORITIES = {"low", "medium", "high", "urgent"}


def _serialize(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return doc
    doc = dict(doc)
    doc["_id"] = str(doc["_id"])
    doc["recipient_id"] = str(doc["recipient_id"])
    return doc


def create_notification(notification_data: dict) -> Dict[str, Any]:
    """Create a new notification record."""
    db = get_db()
    now = datetime.now(timezone.utc)

    ntype = notification_data.get("type", "system")
    if ntype not in VALID_TYPES:
        ntype = "system"

    priority = notification_data.get("priority", "medium")
    if priority not in VALID_PRIORITIES:
        priority = "medium"

    doc = {
        "recipient_id": ObjectId(notification_data["recipient_id"]),
        "role": notification_data.get("role", "all"),
        "title": notification_data.get("title", "").strip(),
        "message": notification_data.get("message", "").strip(),
        "type": ntype,
        "priority": priority,
        "reference_type": notification_data.get("reference_type"),
        "reference_id": notification_data.get("reference_id"),
        "is_read": False,
        "created_at": now
    }

    result = db["notifications"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize(doc)


def get_user_notifications(
    user_id: str,
    notification_type: Optional[str] = None,
    unread_only: bool = False
) -> List[Dict[str, Any]]:
    """Fetch user notifications."""
    db = get_db()
    try:
        u_oid = ObjectId(user_id)
    except Exception:
        return []

    query: Dict[str, Any] = {"recipient_id": u_oid}
    if notification_type and notification_type != "all":
        query["type"] = notification_type
    if unread_only:
        query["is_read"] = False

    cursor = db["notifications"].find(query).sort("created_at", -1)
    return [_serialize(doc) for doc in cursor]


def get_unread_count(user_id: str) -> int:
    """Get count of unread notifications for a user."""
    db = get_db()
    try:
        u_oid = ObjectId(user_id)
    except Exception:
        return 0

    return db["notifications"].count_documents({"recipient_id": u_oid, "is_read": False})


def mark_as_read(notification_id: str, user_id: str) -> bool:
    """Mark single notification as read."""
    db = get_db()
    try:
        n_oid = ObjectId(notification_id)
        u_oid = ObjectId(user_id)
    except Exception:
        return False

    res = db["notifications"].update_one(
        {"_id": n_oid, "recipient_id": u_oid},
        {"$set": {"is_read": True}}
    )
    return res.modified_count > 0


def mark_all_read(user_id: str) -> bool:
    """Mark all notifications read for user."""
    db = get_db()
    try:
        u_oid = ObjectId(user_id)
    except Exception:
        return False

    res = db["notifications"].update_many(
        {"recipient_id": u_oid, "is_read": False},
        {"$set": {"is_read": True}}
    )
    return res.modified_count > 0


def delete_notification(notification_id: str, user_id: str) -> bool:
    """Delete a notification."""
    db = get_db()
    try:
        n_oid = ObjectId(notification_id)
        u_oid = ObjectId(user_id)
    except Exception:
        return False

    res = db["notifications"].delete_one({"_id": n_oid, "recipient_id": u_oid})
    return res.deleted_count > 0

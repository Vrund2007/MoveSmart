"""db/feedback_repo.py — PyMongo access layer for user_feedback collection (database.md §3, Phase 14)"""
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from bson import ObjectId
from .connection import get_db

VALID_STATUSES = {"open", "in_review", "resolved", "archived"}


def _serialize(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return doc
    doc = dict(doc)
    doc["_id"] = str(doc["_id"])
    return doc


def create_feedback(data: dict) -> Dict[str, Any]:
    """Record user feedback submission."""
    db = get_db()
    now = datetime.now(timezone.utc)

    doc = {
        "user_id": data.get("user_id"),
        "name": data.get("name", "Anonymous"),
        "email": data.get("email", ""),
        "category": data.get("category", "general"),
        "subject": data.get("subject", "").strip(),
        "message": data.get("message", "").strip(),
        "status": "open",
        "resolution_note": "",
        "created_at": now
    }

    result = db["user_feedback"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize(doc)


def get_all_feedback(status_filter: Optional[str] = None) -> List[Dict[str, Any]]:
    """Fetch user feedback submissions."""
    db = get_db()
    query: Dict[str, Any] = {}

    if status_filter and status_filter != "all":
        query["status"] = status_filter

    cursor = db["user_feedback"].find(query).sort("created_at", -1)
    return [_serialize(doc) for doc in cursor]


def update_feedback_status(feedback_id: str, new_status: str, resolution_note: Optional[str] = None) -> bool:
    """Update feedback status."""
    db = get_db()
    try:
        f_oid = ObjectId(feedback_id)
    except Exception:
        return False

    if new_status not in VALID_STATUSES:
        return False

    update_fields: Dict[str, Any] = {"status": new_status, "updated_at": datetime.now(timezone.utc)}
    if resolution_note:
        update_fields["resolution_note"] = resolution_note.strip()

    res = db["user_feedback"].update_one(
        {"_id": f_oid},
        {"$set": update_fields}
    )
    return res.modified_count > 0

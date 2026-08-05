"""db/calendar_repo.py — PyMongo access layer for calendar_events collection (database.md §3, Phase 13)"""
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from bson import ObjectId
from .connection import get_db

VALID_EVENT_TYPES = {"visit", "meeting", "move_date", "relocation_event", "task", "appointment"}


def _serialize(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return doc
    doc = dict(doc)
    doc["_id"] = str(doc["_id"])
    doc["user_id"] = str(doc["user_id"])
    return doc


def create_calendar_event(event_data: dict) -> Dict[str, Any]:
    """Create a new calendar event entry."""
    db = get_db()
    now = datetime.now(timezone.utc)

    etype = event_data.get("event_type", "task")
    if etype not in VALID_EVENT_TYPES:
        etype = "task"

    doc = {
        "user_id": ObjectId(event_data["user_id"]),
        "role": event_data.get("role", "general"),
        "title": event_data.get("title", "").strip(),
        "event_type": etype,
        "start_time": event_data.get("start_time", now.isoformat()),
        "end_time": event_data.get("end_time", now.isoformat()),
        "description": event_data.get("description", "").strip(),
        "location": event_data.get("location", "").strip(),
        "reference_id": event_data.get("reference_id"),
        "created_at": now
    }

    result = db["calendar_events"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize(doc)


def get_user_calendar_events(
    user_id: str,
    event_type: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Fetch calendar events for user."""
    db = get_db()
    try:
        u_oid = ObjectId(user_id)
    except Exception:
        return []

    query: Dict[str, Any] = {"user_id": u_oid}
    if event_type and event_type != "all":
        query["event_type"] = event_type

    cursor = db["calendar_events"].find(query).sort("start_time", 1)
    return [_serialize(doc) for doc in cursor]


def delete_calendar_event(event_id: str, user_id: str) -> bool:
    """Delete a calendar event."""
    db = get_db()
    try:
        e_oid = ObjectId(event_id)
        u_oid = ObjectId(user_id)
    except Exception:
        return False

    res = db["calendar_events"].delete_one({"_id": e_oid, "user_id": u_oid})
    return res.deleted_count > 0

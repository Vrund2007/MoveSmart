"""db/activity_repo.py — PyMongo access layer for activity_logs collection (database.md §3, Phase 13)"""
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from bson import ObjectId
from .connection import get_db

VALID_ACTIONS = {
    "login", "property_created", "visit_scheduled", "approval",
    "message_sent", "ai_usage", "saved_property", "recommendation_run", "profile_update"
}


def _serialize(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return doc
    doc = dict(doc)
    doc["_id"] = str(doc["_id"])
    doc["user_id"] = str(doc["user_id"])
    return doc


def log_activity(
    user_id: str,
    role: str,
    action: str,
    description: str,
    metadata: Optional[dict] = None
) -> Dict[str, Any]:
    """Log an audit activity entry."""
    db = get_db()
    now = datetime.now(timezone.utc)

    if action not in VALID_ACTIONS:
        action = "profile_update"

    doc = {
        "user_id": ObjectId(user_id),
        "role": role,
        "action": action,
        "description": description.strip(),
        "metadata": metadata or {},
        "timestamp": now
    }

    result = db["activity_logs"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize(doc)


def get_user_activity_logs(user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
    """Fetch recent activity logs for a user."""
    db = get_db()
    try:
        u_oid = ObjectId(user_id)
    except Exception:
        return []

    cursor = db["activity_logs"].find({"user_id": u_oid}).sort("timestamp", -1).limit(limit)
    return [_serialize(doc) for doc in cursor]

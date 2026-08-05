"""db/audit_repo.py — PyMongo access layer for audit_logs collection (database.md §3, Phase 14)"""
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from bson import ObjectId
from .connection import get_db


def _serialize(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return doc
    doc = dict(doc)
    doc["_id"] = str(doc["_id"])
    if doc.get("actor_id"):
        doc["actor_id"] = str(doc["actor_id"])
    return doc


def log_admin_action(
    actor_id: str,
    actor_email: str,
    action: str,
    target_type: str,
    target_id: str,
    details: str,
    metadata: Optional[dict] = None
) -> Dict[str, Any]:
    """Record a Super Admin action in audit_logs collection."""
    db = get_db()
    now = datetime.now(timezone.utc)

    doc = {
        "actor_id": ObjectId(actor_id),
        "actor_email": actor_email,
        "action": action,
        "target_type": target_type,
        "target_id": target_id,
        "details": details.strip(),
        "metadata": metadata or {},
        "timestamp": now
    }

    result = db["audit_logs"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize(doc)


def get_audit_logs(action: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
    """Fetch audit logs."""
    db = get_db()
    query: Dict[str, Any] = {}

    if action and action != "all":
        query["action"] = action

    cursor = db["audit_logs"].find(query).sort("timestamp", -1).limit(limit)
    return [_serialize(doc) for doc in cursor]

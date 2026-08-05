"""db/tasks_repo.py — PyMongo access layer for broker_tasks collection (database.md §3, Phase 11)"""
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from bson import ObjectId
from .connection import get_db

VALID_PRIORITIES = {"low", "medium", "high", "urgent"}
VALID_STATUSES = {"todo", "in_progress", "completed"}


def _serialize(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return doc
    doc = dict(doc)
    doc["_id"] = str(doc["_id"])
    doc["broker_id"] = str(doc["broker_id"])
    if "related_client_id" in doc and doc["related_client_id"]:
        doc["related_client_id"] = str(doc["related_client_id"])
    if "related_listing_id" in doc and doc["related_listing_id"]:
        doc["related_listing_id"] = str(doc["related_listing_id"])
    return doc


def create_task(task_data: dict) -> Dict[str, Any]:
    """Create a new task for a broker."""
    db = get_db()
    now = datetime.now(timezone.utc)

    priority = task_data.get("priority", "medium")
    if priority not in VALID_PRIORITIES:
        priority = "medium"

    status = task_data.get("status", "todo")
    if status not in VALID_STATUSES:
        status = "todo"

    rel_client = task_data.get("related_client_id")
    rel_listing = task_data.get("related_listing_id")

    doc = {
        "broker_id": ObjectId(task_data["broker_id"]),
        "title": task_data.get("title", "").strip(),
        "description": task_data.get("description", "").strip(),
        "priority": priority,
        "status": status,
        "due_date": task_data.get("due_date", now.strftime("%Y-%m-%d")),
        "related_client_id": ObjectId(rel_client) if rel_client else None,
        "related_listing_id": ObjectId(rel_listing) if rel_listing else None,
        "created_at": now,
        "updated_at": now
    }

    result = db["broker_tasks"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize(doc)


def get_broker_tasks(
    broker_id: str,
    status: Optional[str] = None,
    priority: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Fetch broker tasks with optional status/priority filtering."""
    db = get_db()
    try:
        b_oid = ObjectId(broker_id)
    except Exception:
        return []

    query: Dict[str, Any] = {"broker_id": b_oid}
    if status and status != "all":
        query["status"] = status
    if priority and priority != "all":
        query["priority"] = priority

    cursor = db["broker_tasks"].find(query).sort("due_date", 1)
    return [_serialize(doc) for doc in cursor]


def get_task_by_id(task_id: str, broker_id: str) -> Optional[Dict[str, Any]]:
    """Fetch task by ID enforcing broker ownership."""
    db = get_db()
    try:
        t_oid = ObjectId(task_id)
        b_oid = ObjectId(broker_id)
    except Exception:
        return None

    doc = db["broker_tasks"].find_one({"_id": t_oid, "broker_id": b_oid})
    return _serialize(doc) if doc else None


def update_task(task_id: str, broker_id: str, update_data: dict) -> Optional[Dict[str, Any]]:
    """Update task details, status, or priority."""
    db = get_db()
    try:
        t_oid = ObjectId(task_id)
        b_oid = ObjectId(broker_id)
    except Exception:
        return None

    payload = {}
    if "title" in update_data:
        payload["title"] = update_data["title"].strip()
    if "description" in update_data:
        payload["description"] = update_data["description"].strip()
    if "priority" in update_data and update_data["priority"] in VALID_PRIORITIES:
        payload["priority"] = update_data["priority"]
    if "status" in update_data and update_data["status"] in VALID_STATUSES:
        payload["status"] = update_data["status"]
    if "due_date" in update_data:
        payload["due_date"] = update_data["due_date"]
    if "related_client_id" in update_data:
        rc = update_data["related_client_id"]
        payload["related_client_id"] = ObjectId(rc) if rc else None
    if "related_listing_id" in update_data:
        rl = update_data["related_listing_id"]
        payload["related_listing_id"] = ObjectId(rl) if rl else None

    if not payload:
        return get_task_by_id(task_id, broker_id)

    payload["updated_at"] = datetime.now(timezone.utc)

    result = db["broker_tasks"].find_one_and_update(
        {"_id": t_oid, "broker_id": b_oid},
        {"$set": payload},
        return_document=True
    )
    return _serialize(result) if result else None


def delete_task(task_id: str, broker_id: str) -> bool:
    """Delete a task record."""
    db = get_db()
    try:
        t_oid = ObjectId(task_id)
        b_oid = ObjectId(broker_id)
    except Exception:
        return False

    res = db["broker_tasks"].delete_one({"_id": t_oid, "broker_id": b_oid})
    return res.deleted_count > 0

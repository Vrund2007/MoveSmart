"""db/broker_assignments_repo.py — PyMongo access layer for broker_assignments collection (database.md §3, Phase 12)"""
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from bson import ObjectId
from .connection import get_db

VALID_STATUSES = {"pending", "active", "completed", "cancelled"}


def _serialize(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return doc
    doc = dict(doc)
    doc["_id"] = str(doc["_id"])
    doc["company_id"] = str(doc["company_id"])
    doc["broker_id"] = str(doc["broker_id"])
    doc["assigned_by"] = str(doc["assigned_by"])
    return doc


def create_assignment(assignment_data: dict) -> Dict[str, Any]:
    """Create a new broker assignment for an employee."""
    db = get_db()
    now = datetime.now(timezone.utc)

    doc = {
        "company_id": ObjectId(assignment_data["company_id"]),
        "broker_id": ObjectId(assignment_data["broker_id"]),
        "employee_id": str(assignment_data["employee_id"]),
        "assigned_by": ObjectId(assignment_data["assigned_by"]),
        "assigned_at": now,
        "status": assignment_data.get("status", "active"),
        "notes": assignment_data.get("notes", "").strip(),
        "updated_at": now
    }

    result = db["broker_assignments"].insert_one(doc)
    doc["_id"] = result.inserted_id

    # Update employee's assigned_broker_id & relocation_status
    db["company_employees"].update_one(
        {"company_id": doc["company_id"], "employee_id": doc["employee_id"]},
        {"$set": {
            "assigned_broker_id": doc["broker_id"],
            "relocation_status": "broker_assigned",
            "updated_at": now
        }}
    )

    return _serialize(doc)


def get_company_assignments(company_id: str, status: Optional[str] = None) -> List[Dict[str, Any]]:
    """Fetch broker assignments for a company."""
    db = get_db()
    try:
        c_oid = ObjectId(company_id)
    except Exception:
        return []

    query: Dict[str, Any] = {"company_id": c_oid}
    if status and status != "all":
        query["status"] = status

    cursor = db["broker_assignments"].find(query).sort("assigned_at", -1)
    return [_serialize(doc) for doc in cursor]


def update_assignment_status(assignment_id: str, company_id: str, new_status: str) -> bool:
    """Update status of a broker assignment."""
    if new_status not in VALID_STATUSES:
        raise ValueError(f"Invalid status: {new_status}")

    db = get_db()
    try:
        a_oid = ObjectId(assignment_id)
        c_oid = ObjectId(company_id)
    except Exception:
        return False

    res = db["broker_assignments"].update_one(
        {"_id": a_oid, "company_id": c_oid},
        {"$set": {"status": new_status, "updated_at": datetime.now(timezone.utc)}}
    )
    return res.modified_count > 0


def delete_assignment(assignment_id: str, company_id: str) -> bool:
    """Delete a broker assignment record."""
    db = get_db()
    try:
        a_oid = ObjectId(assignment_id)
        c_oid = ObjectId(company_id)
    except Exception:
        return False

    res = db["broker_assignments"].delete_one({"_id": a_oid, "company_id": c_oid})
    return res.deleted_count > 0

"""db/approvals_repo.py — PyMongo access layer for company_approvals collection (database.md §3, Phase 12)"""
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from bson import ObjectId
from .connection import get_db

VALID_STATUSES = {"pending", "approved", "rejected", "needs_revision"}
VALID_TYPES = {
    "broker_assignment", "housing_allocation", "budget_exception",
    "employee_confirmation", "company_confirmation"
}


def _serialize(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return doc
    doc = dict(doc)
    doc["_id"] = str(doc["_id"])
    doc["company_id"] = str(doc["company_id"])
    if "requested_by" in doc and doc["requested_by"]:
        doc["requested_by"] = str(doc["requested_by"])
    if "approver" in doc and doc["approver"]:
        doc["approver"] = str(doc["approver"])
    return doc


def create_approval_request(approval_data: dict) -> Dict[str, Any]:
    """Create a new approval request for company HR."""
    db = get_db()
    now = datetime.now(timezone.utc)

    approval_type = approval_data.get("approval_type", "housing_allocation")
    if approval_type not in VALID_TYPES:
        approval_type = "housing_allocation"

    doc = {
        "company_id": ObjectId(approval_data["company_id"]),
        "employee_id": str(approval_data["employee_id"]),
        "approval_type": approval_type,
        "status": "pending",
        "requested_by": ObjectId(approval_data["requested_by"]),
        "approver": None,
        "reason": approval_data.get("reason", "").strip(),
        "details": approval_data.get("details", {}),
        "created_at": now,
        "updated_at": now
    }

    result = db["company_approvals"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize(doc)


def get_company_approvals(company_id: str, status: Optional[str] = None) -> List[Dict[str, Any]]:
    """Fetch approval requests for a company."""
    db = get_db()
    try:
        c_oid = ObjectId(company_id)
    except Exception:
        return []

    query: Dict[str, Any] = {"company_id": c_oid}
    if status and status != "all":
        query["status"] = status

    cursor = db["company_approvals"].find(query).sort("created_at", -1)
    return [_serialize(doc) for doc in cursor]


def get_approval_by_id(approval_id: str, company_id: str) -> Optional[Dict[str, Any]]:
    """Fetch single approval record by ID."""
    db = get_db()
    try:
        a_oid = ObjectId(approval_id)
        c_oid = ObjectId(company_id)
    except Exception:
        return None

    doc = db["company_approvals"].find_one({"_id": a_oid, "company_id": c_oid})
    return _serialize(doc) if doc else None


def update_approval_status(
    approval_id: str,
    company_id: str,
    new_status: str,
    reason: str = "",
    approver_id: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    """Approve, reject, or request revision on an approval entry."""
    if new_status not in VALID_STATUSES:
        raise ValueError(f"Invalid approval status: {new_status}")

    db = get_db()
    try:
        a_oid = ObjectId(approval_id)
        c_oid = ObjectId(company_id)
    except Exception:
        return None

    now = datetime.now(timezone.utc)
    payload = {
        "status": new_status,
        "updated_at": now
    }
    if reason:
        payload["reason"] = reason.strip()
    if approver_id:
        payload["approver"] = ObjectId(approver_id)

    result = db["company_approvals"].find_one_and_update(
        {"_id": a_oid, "company_id": c_oid},
        {"$set": payload},
        return_document=True
    )

    if result and new_status == "approved":
        # Synchronize employee relocation status if housing_allocation
        emp_id = result.get("employee_id")
        if result.get("approval_type") == "housing_allocation":
            db["company_employees"].update_one(
                {"company_id": c_oid, "employee_id": emp_id},
                {"$set": {"relocation_status": "approved", "updated_at": now}}
            )

    return _serialize(result) if result else None

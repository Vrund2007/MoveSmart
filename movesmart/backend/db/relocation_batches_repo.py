"""db/relocation_batches_repo.py — PyMongo access layer for relocation_batches collection (database.md §3.6)"""
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
    doc["company_id"] = str(doc["company_id"])
    return doc


def create_relocation_batch(batch_data: dict) -> str:
    """Create a new company relocation batch document."""
    db = get_db()
    now = datetime.now(timezone.utc)
    doc = dict(batch_data)
    doc["company_id"] = ObjectId(batch_data["company_id"])
    doc["created_at"] = now
    doc["updated_at"] = now
    doc.setdefault("batch_name", f"Relocation Batch {now.strftime('%Y-%m')}")
    doc.setdefault("office_locations", ["Ahmedabad HQ"])
    doc.setdefault("headcount", 1)
    doc.setdefault("budget", 100000.0)
    doc.setdefault("status", "active")
    doc.setdefault("employees", [])
    doc.setdefault("allocations", [])

    result = db["relocation_batches"].insert_one(doc)
    return str(result.inserted_id)


def get_company_batches(company_id: str) -> List[Dict[str, Any]]:
    """Fetch all relocation batches for a company."""
    db = get_db()
    try:
        c_oid = ObjectId(company_id)
    except Exception:
        return []

    cursor = db["relocation_batches"].find({"company_id": c_oid}).sort("created_at", -1)
    return [_serialize(doc) for doc in cursor]


def get_company_batch(batch_id: str, company_id: str) -> Optional[Dict[str, Any]]:
    """Fetch a specific relocation batch for a company."""
    db = get_db()
    try:
        b_oid = ObjectId(batch_id)
        c_oid = ObjectId(company_id)
    except Exception:
        return None

    doc = db["relocation_batches"].find_one({
        "_id": b_oid,
        "company_id": c_oid
    })
    return _serialize(doc) if doc else None


def update_batch(batch_id: str, company_id: str, update_data: dict) -> Optional[Dict[str, Any]]:
    """Update batch details."""
    db = get_db()
    try:
        b_oid = ObjectId(batch_id)
        c_oid = ObjectId(company_id)
    except Exception:
        return None

    doc = dict(update_data)
    doc["updated_at"] = datetime.now(timezone.utc)
    db["relocation_batches"].update_one(
        {"_id": b_oid, "company_id": c_oid},
        {"$set": doc}
    )
    return get_company_batch(batch_id, company_id)


def delete_batch(batch_id: str, company_id: str) -> bool:
    """Delete a relocation batch."""
    db = get_db()
    try:
        b_oid = ObjectId(batch_id)
        c_oid = ObjectId(company_id)
    except Exception:
        return False

    res = db["relocation_batches"].delete_one({"_id": b_oid, "company_id": c_oid})
    return res.deleted_count > 0


def add_employee_to_batch(batch_id: str, company_id: str, emp_data: dict) -> bool:
    """Add employee to embedded employees[] array. Prevents duplicate employee_id."""
    db = get_db()
    batch = get_company_batch(batch_id, company_id)
    if not batch:
        return False

    emp_id = emp_data.get("employee_id") or f"EMP-{len(batch.get('employees', [])) + 1}"
    existing_employees = batch.get("employees", [])
    
    if any(e.get("employee_id") == emp_id for e in existing_employees):
        raise ValueError(f"Employee with ID '{emp_id}' already exists in this batch.")

    new_emp = {
        "employee_id": emp_id,
        "name": emp_data.get("name", "Employee"),
        "constraints": emp_data.get("constraints", {}),
        "budget": float(emp_data.get("budget", 25000)),
        "preferences": emp_data.get("preferences", {})
    }

    res = db["relocation_batches"].update_one(
        {"_id": ObjectId(batch_id), "company_id": ObjectId(company_id)},
        {
            "$push": {"employees": new_emp},
            "$set": {"updated_at": datetime.now(timezone.utc)}
        }
    )
    return res.modified_count > 0


def remove_employee_from_batch(batch_id: str, company_id: str, employee_id: str) -> bool:
    """Remove employee from embedded employees[] array."""
    db = get_db()
    try:
        b_oid = ObjectId(batch_id)
        c_oid = ObjectId(company_id)
    except Exception:
        return False

    res = db["relocation_batches"].update_one(
        {"_id": b_oid, "company_id": c_oid},
        {
            "$pull": {"employees": {"employee_id": employee_id}},
            "$set": {"updated_at": datetime.now(timezone.utc)}
        }
    )
    return res.modified_count > 0


def allocate_employee_to_listing(batch_id: str, company_id: str, allocation_data: dict) -> bool:
    """Allocate employee to an approved listing. Enforces status=approved & no duplicate employee allocation."""
    db = get_db()
    batch = get_company_batch(batch_id, company_id)
    if not batch:
        raise ValueError("Relocation batch not found.")

    emp_id = allocation_data["employee_id"]
    listing_id = allocation_data["listing_id"]

    # Verify listing is approved
    listing = listings_repo.get_listing_by_id(listing_id, include_non_approved=False)
    if not listing:
        raise ValueError("Listing is not approved or does not exist.")

    # Check duplicate allocation
    allocations = batch.get("allocations", [])
    if any(a.get("employee_id") == emp_id for a in allocations):
        raise ValueError(f"Employee '{emp_id}' is already allocated to a listing.")

    cost = float(allocation_data.get("cost") or listing.get("price", 0))
    now = datetime.now(timezone.utc)
    new_alloc = {
        "employee_id": emp_id,
        "listing_id": listing_id,
        "allocated_by": str(company_id),
        "allocated_at": now.isoformat(),
        "cost": cost
    }

    res = db["relocation_batches"].update_one(
        {"_id": ObjectId(batch_id), "company_id": ObjectId(company_id)},
        {
            "$push": {"allocations": new_alloc},
            "$set": {"updated_at": now}
        }
    )
    return res.modified_count > 0

"""db/employees_repo.py — PyMongo access layer for company_employees collection (database.md §3, Phase 12)"""
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from bson import ObjectId
from .connection import get_db

VALID_RELOCATION_STATUSES = {
    "initiated", "broker_assigned", "property_shortlisted", "visit_scheduled", "approved", "moved"
}


def _serialize(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return doc
    doc = dict(doc)
    doc["_id"] = str(doc["_id"])
    doc["company_id"] = str(doc["company_id"])
    if "assigned_broker_id" in doc and doc["assigned_broker_id"]:
        doc["assigned_broker_id"] = str(doc["assigned_broker_id"])
    if "allocated_listing_id" in doc and doc["allocated_listing_id"]:
        doc["allocated_listing_id"] = str(doc["allocated_listing_id"])
    if "batch_id" in doc and doc["batch_id"]:
        doc["batch_id"] = str(doc["batch_id"])
    return doc


def create_employee(emp_data: dict) -> Dict[str, Any]:
    """Create a new employee profile for a company."""
    db = get_db()
    now = datetime.now(timezone.utc)

    c_oid = ObjectId(emp_data["company_id"])
    emp_code = emp_data.get("employee_id") or f"EMP-{int(now.timestamp())}"

    # Check for duplicate employee_id within company
    existing = db["company_employees"].find_one({"company_id": c_oid, "employee_id": emp_code})
    if existing:
        raise ValueError(f"Employee ID '{emp_code}' already exists for this company.")

    doc = {
        "company_id": c_oid,
        "employee_id": emp_code,
        "name": emp_data.get("name", "").strip(),
        "email": emp_data.get("email", "").strip().lower(),
        "phone": emp_data.get("phone", "").strip(),
        "department": emp_data.get("department", "Engineering").strip(),
        "designation": emp_data.get("designation", "Team Member").strip(),
        "joining_date": emp_data.get("joining_date", now.strftime("%Y-%m-%d")),
        "office_location": emp_data.get("office_location", "Ahmedabad HQ").strip(),
        "housing_budget": float(emp_data.get("housing_budget", 30000.0)),
        "lifestyle_preference": emp_data.get("lifestyle_preference", "quiet"),
        "commute_preference_minutes": int(emp_data.get("commute_preference_minutes", 30)),
        "relocation_status": emp_data.get("relocation_status", "initiated"),
        "batch_id": ObjectId(emp_data["batch_id"]) if emp_data.get("batch_id") else None,
        "assigned_broker_id": ObjectId(emp_data["assigned_broker_id"]) if emp_data.get("assigned_broker_id") else None,
        "allocated_listing_id": ObjectId(emp_data["allocated_listing_id"]) if emp_data.get("allocated_listing_id") else None,
        "notes": emp_data.get("notes", []),
        "created_at": now,
        "updated_at": now
    }

    result = db["company_employees"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize(doc)


def get_company_employees(
    company_id: str,
    status: Optional[str] = None,
    department: Optional[str] = None,
    search: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Fetch company employees with optional filtering and search."""
    db = get_db()
    try:
        c_oid = ObjectId(company_id)
    except Exception:
        return []

    query: Dict[str, Any] = {"company_id": c_oid}
    if status and status != "all":
        query["relocation_status"] = status
    if department and department != "all":
        query["department"] = department
    if search:
        s_regex = {"$regex": search, "$options": "i"}
        query["$or"] = [
            {"name": s_regex},
            {"email": s_regex},
            {"employee_id": s_regex},
            {"department": s_regex},
            {"designation": s_regex}
        ]

    cursor = db["company_employees"].find(query).sort("updated_at", -1)
    return [_serialize(doc) for doc in cursor]


def get_employee_by_id(emp_mongo_id: str, company_id: str) -> Optional[Dict[str, Any]]:
    """Fetch an employee by MongoDB ObjectId enforcing company ownership."""
    db = get_db()
    try:
        e_oid = ObjectId(emp_mongo_id)
        c_oid = ObjectId(company_id)
    except Exception:
        return None

    doc = db["company_employees"].find_one({"_id": e_oid, "company_id": c_oid})
    return _serialize(doc) if doc else None


def update_employee(emp_mongo_id: str, company_id: str, update_data: dict) -> Optional[Dict[str, Any]]:
    """Update employee details and relocation status."""
    db = get_db()
    try:
        e_oid = ObjectId(emp_mongo_id)
        c_oid = ObjectId(company_id)
    except Exception:
        return None

    allowed_fields = {
        "name", "email", "phone", "department", "designation", "joining_date",
        "office_location", "housing_budget", "lifestyle_preference",
        "commute_preference_minutes", "relocation_status", "batch_id",
        "assigned_broker_id", "allocated_listing_id"
    }

    payload = {}
    for k, v in update_data.items():
        if k in allowed_fields:
            if k in ["assigned_broker_id", "allocated_listing_id", "batch_id"] and v:
                payload[k] = ObjectId(v)
            else:
                payload[k] = v

    if not payload:
        return get_employee_by_id(emp_mongo_id, company_id)

    payload["updated_at"] = datetime.now(timezone.utc)

    result = db["company_employees"].find_one_and_update(
        {"_id": e_oid, "company_id": c_oid},
        {"$set": payload},
        return_document=True
    )
    return _serialize(result) if result else None


def delete_employee(emp_mongo_id: str, company_id: str) -> bool:
    """Delete employee record."""
    db = get_db()
    try:
        e_oid = ObjectId(emp_mongo_id)
        c_oid = ObjectId(company_id)
    except Exception:
        return False

    res = db["company_employees"].delete_one({"_id": e_oid, "company_id": c_oid})
    return res.deleted_count > 0

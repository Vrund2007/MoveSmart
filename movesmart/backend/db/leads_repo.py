"""db/leads_repo.py — PyMongo access layer for leads collection (database.md §3.4)"""
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from bson import ObjectId
from .connection import get_db

VALID_STATUSES = {"new", "qualified", "contacted", "visit_scheduled", "negotiation", "converted", "lost"}
ALLOWED_TRANSITIONS = {
    "new": {"qualified", "contacted", "visit_scheduled", "negotiation", "converted", "lost"},
    "qualified": {"contacted", "visit_scheduled", "negotiation", "converted", "lost"},
    "contacted": {"visit_scheduled", "negotiation", "converted", "lost"},
    "visit_scheduled": {"negotiation", "converted", "lost"},
    "negotiation": {"converted", "lost"},
    "converted": set(),
    "lost": set()
}


def _serialize(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return doc
    doc = dict(doc)
    doc["_id"] = str(doc["_id"])
    doc["broker_id"] = str(doc["broker_id"])
    if "listing_id" in doc and doc["listing_id"]:
        doc["listing_id"] = str(doc["listing_id"])
    if "enquiry_id" in doc and doc["enquiry_id"]:
        doc["enquiry_id"] = str(doc["enquiry_id"])
    return doc


def create_lead(lead_data: dict) -> Dict[str, Any]:
    """Create a new lead assigned to a broker."""
    db = get_db()
    now = datetime.now(timezone.utc)
    
    doc = {
        "broker_id": ObjectId(lead_data["broker_id"]),
        "enquiry_id": ObjectId(lead_data["enquiry_id"]) if lead_data.get("enquiry_id") else None,
        "listing_id": ObjectId(lead_data["listing_id"]) if lead_data.get("listing_id") else None,
        "seeker_name": lead_data.get("seeker_name", "Anonymous Seeker"),
        "seeker_phone": lead_data.get("seeker_phone", ""),
        "seeker_email": lead_data.get("seeker_email", ""),
        "lead_status": "new",
        "created_at": now,
        "updated_at": now
    }
    
    result = db["leads"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize(doc)


def get_broker_leads(broker_id: str) -> List[Dict[str, Any]]:
    """Fetch all leads assigned to a specific broker."""
    db = get_db()
    try:
        b_oid = ObjectId(broker_id)
    except Exception:
        return []

    cursor = db["leads"].find({"broker_id": b_oid}).sort("created_at", -1)
    return [_serialize(doc) for doc in cursor]


def get_lead_by_id(lead_id: str) -> Optional[Dict[str, Any]]:
    """Fetch a single lead by ID."""
    db = get_db()
    try:
        l_oid = ObjectId(lead_id)
    except Exception:
        return None

    doc = db["leads"].find_one({"_id": l_oid})
    return _serialize(doc) if doc else None


def update_lead_status(lead_id: str, broker_id: str, new_status: str) -> bool:
    """Update lead status enforcing valid status transition chain."""
    if new_status not in VALID_STATUSES:
        raise ValueError(f"Invalid lead_status: {new_status}")

    db = get_db()
    try:
        l_oid = ObjectId(lead_id)
        b_oid = ObjectId(broker_id)
    except Exception:
        return False

    existing = db["leads"].find_one({"_id": l_oid, "broker_id": b_oid})
    if not existing:
        return False

    current_status = existing.get("lead_status", "new")
    if current_status != new_status:
        allowed = ALLOWED_TRANSITIONS.get(current_status, set())
        if new_status not in allowed:
            raise ValueError(f"Cannot transition lead from '{current_status}' to '{new_status}'.")

    now = datetime.now(timezone.utc)
    result = db["leads"].update_one(
        {"_id": l_oid, "broker_id": b_oid},
        {"$set": {"lead_status": new_status, "updated_at": now}}
    )
    return result.modified_count > 0


def update_lead_details(lead_id: str, broker_id: str, update_data: dict) -> Optional[Dict[str, Any]]:
    """Update lead priority, notes, or tags."""
    db = get_db()
    try:
        l_oid = ObjectId(lead_id)
        b_oid = ObjectId(broker_id)
    except Exception:
        return None

    payload = {}
    if "priority" in update_data and update_data["priority"] in {"low", "medium", "high"}:
        payload["priority"] = update_data["priority"]
    if "tags" in update_data:
        payload["tags"] = update_data["tags"]

    now = datetime.now(timezone.utc)
    payload["updated_at"] = now

    update_op: Dict[str, Any] = {"$set": payload}
    if "note" in update_data and update_data["note"]:
        note_entry = f"[{now.strftime('%Y-%m-%d %H:%M')}] {update_data['note'].strip()}"
        update_op["$push"] = {"notes": note_entry}

    result = db["leads"].find_one_and_update(
        {"_id": l_oid, "broker_id": b_oid},
        update_op,
        return_document=True
    )
    return _serialize(result) if result else None


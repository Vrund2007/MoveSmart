"""db/commissions_repo.py — PyMongo access layer for commissions collection (database.md §3.5)"""
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from bson import ObjectId
from .connection import get_db
from . import leads_repo


def _serialize(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return doc
    doc = dict(doc)
    doc["_id"] = str(doc["_id"])
    doc["broker_id"] = str(doc["broker_id"])
    doc["lead_id"] = str(doc["lead_id"])
    if "listing_id" in doc and doc["listing_id"]:
        doc["listing_id"] = str(doc["listing_id"])
    return doc


def create_commission(comm_data: dict) -> Dict[str, Any]:
    """Create a new commission record. Enforces that lead must be 'converted'."""
    db = get_db()
    lead_id = comm_data["lead_id"]
    lead = leads_repo.get_lead_by_id(lead_id)
    
    if not lead:
        raise ValueError("Associated lead does not exist.")
        
    if lead.get("lead_status") != "converted":
        raise ValueError("Commissions can only be recorded for converted leads.")

    now = datetime.now(timezone.utc)
    doc = {
        "broker_id": ObjectId(comm_data["broker_id"]),
        "lead_id": ObjectId(lead_id),
        "listing_id": ObjectId(comm_data["listing_id"]) if comm_data.get("listing_id") else None,
        "amount": float(comm_data.get("amount", 0)),
        "payment_status": comm_data.get("payment_status", "pending"),
        "deal_date": comm_data.get("deal_date", now.strftime("%Y-%m-%d")),
        "created_at": now
    }

    result = db["commissions"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize(doc)


def get_broker_commissions(broker_id: str) -> List[Dict[str, Any]]:
    """Fetch commission records for a broker."""
    db = get_db()
    try:
        b_oid = ObjectId(broker_id)
    except Exception:
        return []

    cursor = db["commissions"].find({"broker_id": b_oid}).sort("created_at", -1)
    return [_serialize(doc) for doc in cursor]


def update_payment_status(commission_id: str, broker_id: str, new_status: str) -> bool:
    """Update payment status ('pending' | 'paid')."""
    db = get_db()
    try:
        c_oid = ObjectId(commission_id)
        b_oid = ObjectId(broker_id)
    except Exception:
        return False

    result = db["commissions"].update_one(
        {"_id": c_oid, "broker_id": b_oid},
        {"$set": {"payment_status": new_status}}
    )
    return result.modified_count > 0

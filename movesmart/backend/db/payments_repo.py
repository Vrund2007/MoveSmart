"""db/payments_repo.py — PyMongo access layer for payments collection (Phase 10)"""
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from bson import ObjectId
from .connection import get_db


def _serialize(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return doc
    doc = dict(doc)
    doc["_id"] = str(doc["_id"])
    if doc.get("owner_id"):
        doc["owner_id"] = str(doc["owner_id"])
    return doc


def create_payment(payment_data: dict) -> str:
    """Create a manual income payment record."""
    db = get_db()
    now = datetime.now(timezone.utc)
    doc = dict(payment_data)
    doc["owner_id"] = ObjectId(payment_data["owner_id"])
    doc["created_at"] = now
    doc["updated_at"] = now
    doc.setdefault("payment_status", "received")
    doc.setdefault("payment_method", "bank_transfer")
    doc.setdefault("notes", "")
    result = db["payments"].insert_one(doc)
    return str(result.inserted_id)


def get_owner_payments(owner_id: str) -> List[Dict[str, Any]]:
    """Fetch all payment records for an owner."""
    db = get_db()
    try:
        o_oid = ObjectId(owner_id)
    except Exception:
        return []
    cursor = db["payments"].find({"owner_id": o_oid}).sort("payment_date", -1)
    return [_serialize(doc) for doc in cursor]


def get_payment_by_id(payment_id: str, owner_id: str) -> Optional[Dict[str, Any]]:
    """Fetch a single payment record by ID for a specific owner."""
    db = get_db()
    try:
        p_oid = ObjectId(payment_id)
        o_oid = ObjectId(owner_id)
    except Exception:
        return None
    doc = db["payments"].find_one({"_id": p_oid, "owner_id": o_oid})
    return _serialize(doc) if doc else None


def update_payment(payment_id: str, owner_id: str, update_data: dict) -> bool:
    """Update a payment record owned by the given owner."""
    db = get_db()
    try:
        p_oid = ObjectId(payment_id)
        o_oid = ObjectId(owner_id)
    except Exception:
        return False
    update_data["updated_at"] = datetime.now(timezone.utc)
    res = db["payments"].update_one(
        {"_id": p_oid, "owner_id": o_oid},
        {"$set": update_data}
    )
    return res.modified_count > 0


def delete_payment(payment_id: str, owner_id: str) -> bool:
    """Delete a payment record owned by the given owner."""
    db = get_db()
    try:
        p_oid = ObjectId(payment_id)
        o_oid = ObjectId(owner_id)
    except Exception:
        return False
    res = db["payments"].delete_one({"_id": p_oid, "owner_id": o_oid})
    return res.deleted_count > 0


def get_monthly_income_summary(owner_id: str) -> dict:
    """Aggregate total and monthly income for owner dashboard stats."""
    db = get_db()
    try:
        o_oid = ObjectId(owner_id)
    except Exception:
        return {"total_received": 0, "pending": 0}

    pipeline = [
        {"$match": {"owner_id": o_oid}},
        {"$group": {
            "_id": "$payment_status",
            "total": {"$sum": "$amount"},
            "count": {"$sum": 1}
        }}
    ]
    result = list(db["payments"].aggregate(pipeline))
    summary = {"total_received": 0, "pending": 0, "count": 0}
    for item in result:
        if item["_id"] == "received":
            summary["total_received"] = item["total"]
            summary["count"] = item["count"]
        elif item["_id"] == "pending":
            summary["pending"] = item["total"]
    return summary

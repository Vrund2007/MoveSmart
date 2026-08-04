"""db/enquiries_repo.py — PyMongo access layer for enquiries collection (database.md §3.4)"""
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from bson import ObjectId
from .connection import get_db


def _serialize(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return doc
    doc = dict(doc)
    doc["_id"] = str(doc["_id"])
    doc["listing_id"] = str(doc["listing_id"])
    doc["from_user_id"] = str(doc["from_user_id"])
    doc["to_owner_or_broker_id"] = str(doc["to_owner_or_broker_id"])
    return doc


def create_enquiry(enquiry_data: dict) -> str:
    """Create a structured enquiry entry."""
    db = get_db()
    doc = dict(enquiry_data)
    doc["created_at"] = datetime.now(timezone.utc)
    result = db["enquiries"].insert_one(doc)
    return str(result.inserted_id)


def get_enquiries_for_recipient(recipient_id: str) -> List[Dict[str, Any]]:
    """Fetch enquiries directed to an owner or broker."""
    db = get_db()
    cursor = db["enquiries"].find(
        {"to_owner_or_broker_id": ObjectId(recipient_id)}
    ).sort("created_at", -1)
    return [_serialize(doc) for doc in cursor]

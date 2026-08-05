"""db/clients_repo.py — PyMongo access layer for clients collection (database.md §3, Phase 11)"""
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from bson import ObjectId
from .connection import get_db


def _serialize(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return doc
    doc = dict(doc)
    doc["_id"] = str(doc["_id"])
    doc["broker_id"] = str(doc["broker_id"])
    return doc


def create_client(client_data: dict) -> Dict[str, Any]:
    """Create a new client profile under a broker."""
    db = get_db()
    now = datetime.now(timezone.utc)

    doc = {
        "broker_id": ObjectId(client_data["broker_id"]),
        "name": client_data.get("name", "").strip(),
        "email": client_data.get("email", "").strip().lower(),
        "phone": client_data.get("phone", "").strip(),
        "budget": float(client_data.get("budget", 0)),
        "preferred_locations": client_data.get("preferred_locations", []),
        "property_preferences": client_data.get("property_preferences", {
            "bhk": 2,
            "property_type": "apartment",
            "deal_type": "rent"
        }),
        "lifestyle": client_data.get("lifestyle", "vibrant"),
        "status": client_data.get("status", "active"),
        "favorite": bool(client_data.get("favorite", False)),
        "tags": client_data.get("tags", []),
        "notes": client_data.get("notes", []),
        "created_at": now,
        "updated_at": now
    }

    result = db["clients"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize(doc)


def get_broker_clients(
    broker_id: str,
    status: Optional[str] = None,
    search: Optional[str] = None,
    favorite_only: bool = False
) -> List[Dict[str, Any]]:
    """Fetch broker clients with optional filter and search."""
    db = get_db()
    try:
        b_oid = ObjectId(broker_id)
    except Exception:
        return []

    query: Dict[str, Any] = {"broker_id": b_oid}
    if status and status != "all":
        query["status"] = status
    if favorite_only:
        query["favorite"] = True
    if search:
        s_regex = {"$regex": search, "$options": "i"}
        query["$or"] = [
            {"name": s_regex},
            {"email": s_regex},
            {"phone": s_regex},
            {"tags": s_regex}
        ]

    cursor = db["clients"].find(query).sort("updated_at", -1)
    return [_serialize(doc) for doc in cursor]


def get_client_by_id(client_id: str, broker_id: str) -> Optional[Dict[str, Any]]:
    """Fetch a single client by ID, enforcing broker ownership."""
    db = get_db()
    try:
        c_oid = ObjectId(client_id)
        b_oid = ObjectId(broker_id)
    except Exception:
        return None

    doc = db["clients"].find_one({"_id": c_oid, "broker_id": b_oid})
    return _serialize(doc) if doc else None


def update_client(client_id: str, broker_id: str, update_data: dict) -> Optional[Dict[str, Any]]:
    """Update a client profile."""
    db = get_db()
    try:
        c_oid = ObjectId(client_id)
        b_oid = ObjectId(broker_id)
    except Exception:
        return None

    allowed_fields = {
        "name", "email", "phone", "budget", "preferred_locations",
        "property_preferences", "lifestyle", "status", "favorite", "tags", "notes"
    }

    payload = {k: v for k, v in update_data.items() if k in allowed_fields}
    if not payload:
        return get_client_by_id(client_id, broker_id)

    payload["updated_at"] = datetime.now(timezone.utc)
    result = db["clients"].find_one_and_update(
        {"_id": c_oid, "broker_id": b_oid},
        {"$set": payload},
        return_document=True
    )
    return _serialize(result) if result else None


def add_client_note(client_id: str, broker_id: str, note_text: str) -> Optional[Dict[str, Any]]:
    """Append a timestamped note to client record."""
    db = get_db()
    try:
        c_oid = ObjectId(client_id)
        b_oid = ObjectId(broker_id)
    except Exception:
        return None

    note_entry = f"[{datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')}] {note_text.strip()}"
    result = db["clients"].find_one_and_update(
        {"_id": c_oid, "broker_id": b_oid},
        {
            "$push": {"notes": note_entry},
            "$set": {"updated_at": datetime.now(timezone.utc)}
        },
        return_document=True
    )
    return _serialize(result) if result else None


def delete_client(client_id: str, broker_id: str) -> bool:
    """Delete client profile."""
    db = get_db()
    try:
        c_oid = ObjectId(client_id)
        b_oid = ObjectId(broker_id)
    except Exception:
        return False

    res = db["clients"].delete_one({"_id": c_oid, "broker_id": b_oid})
    return res.deleted_count > 0

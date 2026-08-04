"""db/visits_repo.py — PyMongo access layer for visits collection"""
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
    doc["seeker_id"] = str(doc["seeker_id"])
    if doc.get("owner_id"):
        doc["owner_id"] = str(doc["owner_id"])
    return doc


def create_visit(visit_data: dict) -> str:
    """Create a new property visit request document."""
    db = get_db()
    now = datetime.now(timezone.utc)
    doc = dict(visit_data)
    doc["seeker_id"] = ObjectId(visit_data["seeker_id"])

    # Attempt to populate owner_id from listing
    listing_id = visit_data.get("listing_id")
    if listing_id:
        listing = listings_repo.get_listing_by_id(listing_id, include_non_approved=True)
        if listing and listing.get("owner_id"):
            try:
                doc["owner_id"] = ObjectId(listing["owner_id"])
            except Exception:
                doc["owner_id"] = None

    doc["created_at"] = now
    doc["updated_at"] = now
    doc.setdefault("status", "requested")  # requested, confirmed, completed, cancelled
    doc.setdefault("notes", "")

    result = db["visits"].insert_one(doc)
    return str(result.inserted_id)


def get_seeker_visits(seeker_id: str) -> List[Dict[str, Any]]:
    """Fetch all property visit requests for a seeker with embedded listing details."""
    db = get_db()
    try:
        s_oid = ObjectId(seeker_id)
    except Exception:
        return []

    cursor = db["visits"].find({"seeker_id": s_oid}).sort("created_at", -1)
    visits = [_serialize(doc) for doc in cursor]

    # Populate listing details
    for v in visits:
        l_id = v.get("listing_id")
        if l_id:
            listing = listings_repo.get_listing_by_id(l_id, include_non_approved=True)
            v["listing"] = listing
        else:
            v["listing"] = None

    return visits


def get_visit_by_id(visit_id: str, seeker_id: str) -> Optional[Dict[str, Any]]:
    """Fetch a single visit request by ID for a seeker."""
    db = get_db()
    try:
        v_oid = ObjectId(visit_id)
        s_oid = ObjectId(seeker_id)
    except Exception:
        return None

    doc = db["visits"].find_one({"_id": v_oid, "seeker_id": s_oid})
    if not doc:
        return None

    res = _serialize(doc)
    if res.get("listing_id"):
        res["listing"] = listings_repo.get_listing_by_id(res["listing_id"], include_non_approved=True)
    return res


def update_visit_status(visit_id: str, seeker_id: str, status_value: str, notes: str = None) -> bool:
    """Update visit status (e.g. cancelled, rescheduled)."""
    db = get_db()
    try:
        v_oid = ObjectId(visit_id)
        s_oid = ObjectId(seeker_id)
    except Exception:
        return False

    update_fields = {
        "status": status_value,
        "updated_at": datetime.now(timezone.utc)
    }
    if notes is not None:
        update_fields["notes"] = notes

    res = db["visits"].update_one(
        {"_id": v_oid, "seeker_id": s_oid},
        {"$set": update_fields}
    )
    return res.modified_count > 0


# ── Owner-scoped visit functions (Phase 10) ────────────────────────────────

def get_owner_visits(owner_id: str) -> List[Dict[str, Any]]:
    """Fetch all visit requests for properties owned by owner_id."""
    db = get_db()
    try:
        o_oid = ObjectId(owner_id)
    except Exception:
        return []

    cursor = db["visits"].find({"owner_id": o_oid}).sort("created_at", -1)
    visits = [_serialize(doc) for doc in cursor]

    # Populate listing details
    for v in visits:
        l_id = v.get("listing_id")
        if l_id:
            listing = listings_repo.get_listing_by_id(l_id, include_non_approved=True)
            v["listing"] = listing
        else:
            v["listing"] = None

    return visits


def get_owner_visit_by_id(visit_id: str, owner_id: str) -> Optional[Dict[str, Any]]:
    """Fetch a single visit request scoped to owner."""
    db = get_db()
    try:
        v_oid = ObjectId(visit_id)
        o_oid = ObjectId(owner_id)
    except Exception:
        return None

    doc = db["visits"].find_one({"_id": v_oid, "owner_id": o_oid})
    if not doc:
        return None

    res = _serialize(doc)
    if res.get("listing_id"):
        res["listing"] = listings_repo.get_listing_by_id(res["listing_id"], include_non_approved=True)
    return res


def owner_update_visit_status(visit_id: str, owner_id: str, status_value: str, notes: str = None) -> bool:
    """Owner confirms, rejects, completes, or cancels a visit request."""
    db = get_db()
    try:
        v_oid = ObjectId(visit_id)
        o_oid = ObjectId(owner_id)
    except Exception:
        return False

    update_fields = {
        "status": status_value,
        "updated_at": datetime.now(timezone.utc)
    }
    if notes is not None:
        update_fields["notes"] = notes

    res = db["visits"].update_one(
        {"_id": v_oid, "owner_id": o_oid},
        {"$set": update_fields}
    )
    return res.modified_count > 0


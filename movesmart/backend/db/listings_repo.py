"""db/listings_repo.py — PyMongo access layer for listings collection (database.md §3.2, Architecture.md §3)

SINGLE SOURCE OF TRUTH for status=approved filter (FR-3, Architecture.md §3).
Every browse/search/bulk-search query that should return only approved listings MUST call
get_approved_listings() from this module — NOT re-implement the filter inline.
"""
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any, Tuple

from bson import ObjectId
from .connection import get_db


def _serialize(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Helper to convert BSON ObjectId and datetime fields to JSON-serializable types."""
    if not doc:
        return doc
    doc = dict(doc)
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    if "owner_id" in doc and doc["owner_id"]:
        doc["owner_id"] = str(doc["owner_id"])
    if "submitted_by_broker_id" in doc and doc["submitted_by_broker_id"]:
        doc["submitted_by_broker_id"] = str(doc["submitted_by_broker_id"])
    return doc


def get_approved_listings_paginated(filters: Optional[dict] = None, page: int = 1, page_size: int = 24) -> Tuple[List[Dict[str, Any]], int]:
    """Return paginated listings with status='approved' and total matching count.
    
    Args:
        filters: optional dict with search/locality/bhk/deal_type/price constraints.
        page: page index (1-indexed).
        page_size: number of items per page.
    """
    db = get_db()
    query: Dict[str, Any] = {"status": "approved"}
    
    if filters:
        # Flexible case-insensitive regex locality search
        loc = filters.get("locality") or filters.get("search")
        if loc and str(loc).strip():
            clean_loc = str(loc).strip()
            query["$or"] = [
                {"locality": {"$regex": clean_loc, "$options": "i"}},
                {"title": {"$regex": clean_loc, "$options": "i"}},
                {"description": {"$regex": clean_loc, "$options": "i"}}
            ]
        
        # BHK filter
        if filters.get("bhk") is not None and str(filters.get("bhk")).strip() != "":
            try:
                query["bhk"] = int(filters["bhk"])
            except (ValueError, TypeError):
                pass
        
        # Deal type filter (rent / buy)
        deal_type = filters.get("deal_type")
        if deal_type and str(deal_type).strip().lower() not in ["", "all"]:
            query["deal_type"] = str(deal_type).strip().lower()
        
        # Price range filter
        price_query = {}
        min_p = filters.get("min_price")
        if min_p is not None and str(min_p).strip() != "":
            try:
                price_query["$gte"] = float(min_p)
            except (ValueError, TypeError):
                pass
        
        max_p = filters.get("max_price")
        if max_p is not None and str(max_p).strip() != "":
            try:
                price_query["$lte"] = float(max_p)
            except (ValueError, TypeError):
                pass

        if price_query:
            query["price"] = price_query

    total_count = db["listings"].count_documents(query)
    
    page = max(1, int(page))
    page_size = max(1, min(100, int(page_size)))
    skip = (page - 1) * page_size

    cursor = db["listings"].find(query).sort("created_at", -1).skip(skip).limit(page_size)
    listings = [_serialize(doc) for doc in cursor]

    return listings, total_count


def get_approved_listings(filters: Optional[dict] = None, limit: Optional[int] = None) -> List[Dict[str, Any]]:
    """Return listings with status='approved', optionally filtered.
    This function is the single enforcement point for FR-3.
    """
    listings, _ = get_approved_listings_paginated(filters, page=1, page_size=limit if limit else 2500)
    return listings





def get_owner_listings(owner_id: str) -> List[Dict[str, Any]]:
    """Fetch all listings belonging to a specific owner_id (regardless of status)."""
    db = get_db()
    cursor = db["listings"].find({"owner_id": str(owner_id)}).sort("updated_at", -1)
    return [_serialize(doc) for doc in cursor]


def get_listings_by_broker(broker_id: str) -> List[Dict[str, Any]]:
    """Fetch all listings submitted by a specific broker_id (regardless of status)."""
    db = get_db()
    cursor = db["listings"].find({"submitted_by_broker_id": str(broker_id)}).sort("updated_at", -1)
    return [_serialize(doc) for doc in cursor]


def get_listing_by_id(listing_id: str, include_non_approved: bool = False) -> Optional[Dict[str, Any]]:
    """Fetch a single listing by ID."""
    db = get_db()
    try:
        oid = ObjectId(listing_id)
    except Exception:
        return None

    query: Dict[str, Any] = {"_id": oid}
    if not include_non_approved:
        query["status"] = "approved"

    doc = db["listings"].find_one(query)
    return _serialize(doc) if doc else None


def increment_view_count(listing_id: str) -> None:
    """Atomically increment the view_count of a listing by 1 every time it is viewed."""
    db = get_db()
    try:
        oid = ObjectId(listing_id)
        db["listings"].update_one({"_id": oid}, {"$inc": {"view_count": 1}})
    except Exception:
        pass


def increment_enquiry_count(listing_id: str) -> None:
    """Atomically increment the enquiry_count of a listing by 1."""
    db = get_db()
    try:
        oid = ObjectId(listing_id)
        db["listings"].update_one({"_id": oid}, {"$inc": {"enquiry_count": 1}})
    except Exception:
        pass


import random

def create_listing(listing_data: dict) -> str:
    """Create a new listing document matching exact database schema.
    Returns the new listing's _id as a string.
    """
    db = get_db()
    now = datetime.now(timezone.utc)
    doc = dict(listing_data)
    
    doc.setdefault("spid", str(random.randint(10000000, 99999999)))
    doc["created_at"] = now
    doc["updated_at"] = now
    doc.setdefault("status", "pending_review")  # Server-enforced (FR-3)
    doc.setdefault("rejection_reason", None)
    doc.setdefault("source", "landlord_portal")
    doc.setdefault("source_detail", "landlord_form")
    doc.setdefault("view_count", 0)
    doc.setdefault("enquiry_count", 0)
    doc.setdefault("owner_id", None)
    doc.setdefault("submitted_by_broker_id", None)
    doc.setdefault("predicted_price_range", None)
    doc.setdefault("verification_flags", {
        "is_suspicious": False,
        "checked_at": now
    })
    doc.setdefault("images", [])
    doc.setdefault("amenities", [])
    doc.setdefault("area_sqft", 0.0)
    doc.setdefault("furnishing", "Furnished")
    
    # Ensure coordinates format is GeoJSON Point
    raw_coords = doc.get("coordinates")
    if not isinstance(raw_coords, dict) or raw_coords.get("type") != "Point":
        if isinstance(raw_coords, (list, tuple)) and len(raw_coords) == 2:
            doc["coordinates"] = {"type": "Point", "coordinates": [float(raw_coords[0]), float(raw_coords[1])]}
        else:
            doc["coordinates"] = {"type": "Point", "coordinates": [72.539248, 23.020143]}
    
    result = db["listings"].insert_one(doc)
    return str(result.inserted_id)



def update_listing(listing_id: str, update_data: dict) -> Dict[str, Any]:
    """Update a listing document."""
    db = get_db()
    try:
        oid = ObjectId(listing_id)
    except Exception:
        return {}

    doc = dict(update_data)
    doc["updated_at"] = datetime.now(timezone.utc)
    db["listings"].update_one({"_id": oid}, {"$set": doc})
    return get_listing_by_id(listing_id, include_non_approved=True)


def resubmit_listing(listing_id: str, update_data: dict) -> Dict[str, Any]:
    """Update a listing, reset status to 'pending_review', and clear rejection_reason."""
    db = get_db()
    try:
        oid = ObjectId(listing_id)
    except Exception:
        return {}

    doc = dict(update_data)
    doc["status"] = "pending_review"
    doc["rejection_reason"] = None
    doc["updated_at"] = datetime.now(timezone.utc)
    db["listings"].update_one({"_id": oid}, {"$set": doc})
    return get_listing_by_id(listing_id, include_non_approved=True)


def set_listing_status(listing_id: str, status: str, rejection_reason: Optional[str] = None) -> None:
    """Set listing status — called by admin_review views (FR-4, FR-5)."""
    db = get_db()
    try:
        oid = ObjectId(listing_id)
    except Exception:
        return

    update_fields = {
        "status": status,
        "rejection_reason": rejection_reason if status == "rejected" else None,
        "updated_at": datetime.now(timezone.utc)
    }
    db["listings"].update_one({"_id": oid}, {"$set": update_fields})


def delete_listing(listing_id: str) -> bool:
    """Delete a listing by ID."""
    db = get_db()
    try:
        oid = ObjectId(listing_id)
    except Exception:
        return False
    res = db["listings"].delete_one({"_id": oid})
    return res.deleted_count > 0


def get_listings_by_status(status: str) -> List[Dict[str, Any]]:
    """Fetch all listings with a given status (used by Admin review queue)."""
    db = get_db()
    cursor = db["listings"].find({"status": status}).sort("created_at", -1)
    return [_serialize(doc) for doc in cursor]

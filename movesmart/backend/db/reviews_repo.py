"""db/reviews_repo.py — PyMongo access layer for tenant_reviews collection (Phase 10)"""
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from bson import ObjectId
from .connection import get_db


def _serialize(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return doc
    doc = dict(doc)
    doc["_id"] = str(doc["_id"])
    return doc


def create_review(review_data: dict) -> str:
    """Create a new tenant review for a property."""
    db = get_db()
    now = datetime.now(timezone.utc)
    doc = dict(review_data)
    doc["created_at"] = now
    doc["updated_at"] = now
    doc.setdefault("owner_reply", None)
    doc.setdefault("owner_reply_at", None)
    result = db["tenant_reviews"].insert_one(doc)
    return str(result.inserted_id)


def get_reviews_for_property(property_id: str) -> List[Dict[str, Any]]:
    """Fetch all reviews for a specific property."""
    db = get_db()
    cursor = db["tenant_reviews"].find({"property_id": property_id}).sort("created_at", -1)
    return [_serialize(doc) for doc in cursor]


def get_owner_reviews(owner_id: str) -> List[Dict[str, Any]]:
    """Fetch all reviews across all of an owner's properties."""
    db = get_db()
    # Join by looking up which listings belong to this owner
    from . import listings_repo
    owner_listings = listings_repo.get_owner_listings(owner_id)
    listing_ids = [l["_id"] for l in owner_listings]

    if not listing_ids:
        return []

    cursor = db["tenant_reviews"].find(
        {"property_id": {"$in": listing_ids}}
    ).sort("created_at", -1)

    reviews = [_serialize(doc) for doc in cursor]

    # Enrich with listing info
    listing_map = {l["_id"]: l for l in owner_listings}
    for r in reviews:
        r["listing"] = listing_map.get(r.get("property_id"))

    return reviews


def get_review_by_id(review_id: str) -> Optional[Dict[str, Any]]:
    """Fetch a single review by ID."""
    db = get_db()
    try:
        r_oid = ObjectId(review_id)
    except Exception:
        return None
    doc = db["tenant_reviews"].find_one({"_id": r_oid})
    return _serialize(doc) if doc else None


def add_owner_reply(review_id: str, reply_text: str) -> bool:
    """Owner adds a reply to a review."""
    db = get_db()
    try:
        r_oid = ObjectId(review_id)
    except Exception:
        return False
    res = db["tenant_reviews"].update_one(
        {"_id": r_oid},
        {"$set": {
            "owner_reply": reply_text,
            "owner_reply_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }}
    )
    return res.modified_count > 0


def get_average_rating(owner_id: str) -> float:
    """Return average rating across all of an owner's reviewed properties."""
    db = get_db()
    from . import listings_repo
    owner_listings = listings_repo.get_owner_listings(owner_id)
    listing_ids = [l["_id"] for l in owner_listings]
    if not listing_ids:
        return 0.0

    pipeline = [
        {"$match": {"property_id": {"$in": listing_ids}}},
        {"$group": {"_id": None, "avg_rating": {"$avg": "$rating"}, "count": {"$sum": 1}}}
    ]
    result = list(db["tenant_reviews"].aggregate(pipeline))
    if not result:
        return 0.0
    return round(result[0].get("avg_rating", 0), 1)

"""db/commute_cache_repo.py — PyMongo access layer for commute_cache collection (database.md §3.8)"""
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from .connection import get_db


def get_cached_commute(origin_locality: str, destination: list, mode: str) -> Optional[Dict[str, Any]]:
    """Retrieve cached commute estimation if available and not expired."""
    db = get_db()
    query = {
        "origin_locality": origin_locality,
        "destination": destination,
        "mode": mode,
        "expires_at": {"$gt": datetime.now(timezone.utc)}
    }
    doc = db["commute_cache"].find_one(query)
    if doc:
        doc = dict(doc)
        doc["_id"] = str(doc["_id"])
    return doc


def set_cached_commute(cache_data: dict) -> str:
    """Store commute calculation result in cache."""
    db = get_db()
    doc = dict(cache_data)
    doc.setdefault("fetched_at", datetime.now(timezone.utc))
    result = db["commute_cache"].insert_one(doc)
    return str(result.inserted_id)

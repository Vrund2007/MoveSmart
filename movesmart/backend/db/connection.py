"""db/connection.py — PyMongo client setup (Architecture.md §2, §5)
Reads MONGO_URI from Django settings (set from .env). No Django ORM — see Architecture.md §2.
"""
from django.conf import settings
import pymongo
from typing import Optional

_client: Optional[pymongo.MongoClient] = None
_db = None


def get_db():
    """Return the MongoDB database instance, initialising the client on first call (lazy singleton).

    Raises:
        RuntimeError: if MONGO_URI is not configured in settings/.env
    Returns:
        pymongo.database.Database — the MongoDB database
    """
    global _client, _db
    if _db is None:
        uri = getattr(settings, 'MONGO_URI', None)
        db_name = getattr(settings, 'DATABASE_NAME', 'movesmart_db')
        if not uri:
            raise RuntimeError(
                "MONGO_URI is not set. Add it to your .env file — e.g. MONGO_URI=mongodb://localhost:27017"
            )
        _client = pymongo.MongoClient(uri, serverSelectionTimeoutMS=5000)
        _db = _client[db_name]
        # Ensure indexes on first connect (database.md §3.1, §3.2)
        _ensure_indexes(_db)
    return _db


def _ensure_indexes(db):
    """Create all database.md-specified indexes. Safe to call repeatedly (idempotent)."""
    # users
    db['users'].create_index([('email', pymongo.ASCENDING)], unique=True)
    db['users'].create_index([('role', pymongo.ASCENDING)])
    # listings
    db['listings'].create_index([('status', pymongo.ASCENDING), ('locality', pymongo.ASCENDING)])
    db['listings'].create_index([('owner_id', pymongo.ASCENDING)])
    db['listings'].create_index([('coordinates', pymongo.GEOSPHERE)])
    db['listings'].create_index([('status', pymongo.ASCENDING), ('deal_type', pymongo.ASCENDING), ('price', pymongo.ASCENDING)])
    # saved_items
    db['saved_items'].create_index([('user_id', pymongo.ASCENDING), ('listing_id', pymongo.ASCENDING)], unique=True)
    # enquiries
    db['enquiries'].create_index([('to_owner_or_broker_id', pymongo.ASCENDING), ('created_at', pymongo.DESCENDING)])
    db['enquiries'].create_index([('listing_id', pymongo.ASCENDING)])
    # leads
    db['leads'].create_index([('broker_id', pymongo.ASCENDING), ('lead_status', pymongo.ASCENDING)])
    db['leads'].create_index([('enquiry_id', pymongo.ASCENDING)], unique=True)
    # commissions
    db['commissions'].create_index([('broker_id', pymongo.ASCENDING), ('deal_date', pymongo.DESCENDING)])
    # relocation_batches
    db['relocation_batches'].create_index([('company_id', pymongo.ASCENDING), ('created_at', pymongo.DESCENDING)])
    # commute_cache
    db['commute_cache'].create_index([('origin_locality', pymongo.ASCENDING), ('destination', pymongo.ASCENDING), ('mode', pymongo.ASCENDING)])
    db['commute_cache'].create_index([('expires_at', pymongo.ASCENDING)], expireAfterSeconds=0)


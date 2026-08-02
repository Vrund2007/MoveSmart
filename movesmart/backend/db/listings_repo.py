"""db/listings_repo.py — PyMongo access layer for listings collection (database.md §3.2, Architecture.md §3)

SINGLE SOURCE OF TRUTH for status=approved filter (FR-3, Architecture.md §3).
Every browse/search/bulk-search query that should return only approved listings MUST call
get_approved_listings() from this module — NOT re-implement the filter inline.
This is the single point where FR-3 is enforced so it cannot drift between features.
"""
from .connection import get_db
from typing import Optional


def get_approved_listings(filters: Optional[dict] = None) -> list:
    """Return listings with status='approved', optionally filtered.
    This function is the single enforcement point for FR-3.

    Args:
        filters: optional dict with keys: locality, bhk, deal_type, max_price, min_price.

    Returns:
        List of approved listing dicts.

    TODO: build query = {'status': 'approved'}; merge with filters
    TODO: db['listings'].find(query)
    """
    pass


def get_listing_by_id(listing_id: str, include_non_approved: bool = False) -> Optional[dict]:
    """Fetch a single listing by ID.
    include_non_approved=True only for owner/admin viewing own/any listing.
    TODO: add status filter unless include_non_approved is True
    """
    pass


def create_listing(listing_data: dict) -> str:
    """Create a new listing document.
    NOTE: listing_data must already have status='pending_review' set by the caller (FR-3).
    Seed listings use status='approved' — only data_ingestion scripts may set 'approved' at write time (FR-6).
    Returns the new listing's _id as a string.
    TODO: db['listings'].insert_one(listing_data) → return str(result.inserted_id)
    """
    pass


def update_listing(listing_id: str, update_data: dict) -> None:
    """Update a listing document. Does NOT change status — status transitions are in set_listing_status().
    TODO: db['listings'].update_one({'_id': ObjectId(listing_id)}, {'$set': {**update_data, 'updated_at': ...}})
    """
    pass


def set_listing_status(listing_id: str, status: str, rejection_reason: Optional[str] = None) -> None:
    """Set listing status — only called by admin_review views (FR-4).
    On rejection: sets rejection_reason (FR-5).
    On approval: clears rejection_reason.
    TODO: build update_doc; db['listings'].update_one(...)
    """
    pass


def delete_listing(listing_id: str) -> None:
    """Delete a listing by ID.
    TODO: db['listings'].delete_one({'_id': ObjectId(listing_id)})
    """
    pass


def get_listings_by_status(status: str) -> list:
    """Fetch all listings with a given status (used by Admin review queue).
    TODO: db['listings'].find({'status': status})
    """
    pass

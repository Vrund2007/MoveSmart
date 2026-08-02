"""db/enquiries_repo.py — PyMongo access layer for enquiries collection (database.md §3.4, new v2.0)"""
from .connection import get_db


def create_enquiry(enquiry_data: dict) -> str:
    """Insert a new enquiry document.
    enquiry_data must have: listing_id, from_user_id, to_owner_or_broker_id, message, created_at.
    Returns the new enquiry _id as string.
    TODO: db['enquiries'].insert_one(enquiry_data) → return str(result.inserted_id)
    """
    pass


def get_enquiries_for_owner(owner_or_broker_id: str) -> list:
    """Return all enquiries addressed to a given owner or broker (own enquiries only — FR-7).
    TODO: db['enquiries'].find({'to_owner_or_broker_id': ObjectId(owner_or_broker_id)}).sort('created_at', -1)
    """
    pass

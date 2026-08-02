"""db/leads_repo.py — PyMongo access layer for leads collection (database.md §3.5, new v2.0)
leads reference enquiry_id — do NOT duplicate the enquiry's message/sender/listing data (database.md §1).
"""
from .connection import get_db


def create_lead(broker_id: str, enquiry_id: str) -> str:
    """Create a lead record referencing an enquiry (lead_status='new' by default — database.md §3.5).
    Returns the new lead _id as string.
    TODO: db['leads'].insert_one({'broker_id': ..., 'enquiry_id': ..., 'lead_status': 'new', 'updated_at': ...})
    """
    pass


def get_leads_for_broker(broker_id: str) -> list:
    """Return all leads for a broker — own leads only (FR-7).
    TODO: db['leads'].find({'broker_id': ObjectId(broker_id)})
    """
    pass


def update_lead_status(lead_id: str, broker_id: str, lead_status: str) -> None:
    """Update lead_status. Verify broker_id ownership before update (FR-7).
    TODO: db['leads'].update_one({'_id': ObjectId(lead_id), 'broker_id': ObjectId(broker_id)}, {'$set': {'lead_status': ..., 'updated_at': ...}})
    """
    pass

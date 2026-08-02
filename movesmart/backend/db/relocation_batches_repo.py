"""db/relocation_batches_repo.py — PyMongo access layer for relocation_batches collection (database.md §3.7, new v2.0)
employees[] and allocations[] are embedded arrays in the batch document — NOT a separate collection (database.md §1, Architecture.md §6).
budget_used is computed server-side on read (sum of allocations[].cost) — never stored (database.md §3.7 note).
"""
from .connection import get_db
from typing import Optional


def create_batch(batch_data: dict) -> str:
    """Insert a new relocation batch document.
    Returns new batch _id as string.
    TODO: db['relocation_batches'].insert_one(batch_data)
    """
    pass


def get_batch(batch_id: str, company_id: str) -> Optional[dict]:
    """Fetch a batch, verified against company_id (FR-7).
    TODO: db['relocation_batches'].find_one({'_id': ObjectId(batch_id), 'company_id': ObjectId(company_id)})
    """
    pass


def update_allocations(batch_id: str, company_id: str, allocations: list) -> None:
    """Update the allocations[] embedded array in a batch document (FR-7 ownership verified).
    TODO: db['relocation_batches'].update_one({'_id': ..., 'company_id': ...}, {'$set': {'allocations': allocations}})
    """
    pass

"""db/commissions_repo.py — PyMongo access layer for commissions collection (database.md §3.6, new v2.0)
Commissions are broker-private — never queryable by any other role (FR-7).
"""
from .connection import get_db


def create_commission(commission_data: dict) -> str:
    """Insert a commission record. lead_id must reference a 'converted' lead (enforced in view/serializer).
    Returns new commission _id as string.
    TODO: db['commissions'].insert_one(commission_data)
    """
    pass


def get_commissions_for_broker(broker_id: str) -> list:
    """Return commission records for a broker — own records only (FR-7).
    TODO: db['commissions'].find({'broker_id': ObjectId(broker_id)}).sort('deal_date', -1)
    """
    pass

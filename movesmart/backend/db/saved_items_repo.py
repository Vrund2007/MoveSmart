"""db/saved_items_repo.py — PyMongo access layer for saved_items collection (database.md §3.3)"""
from .connection import get_db


def save_listing(user_id: str, listing_id: str) -> None:
    """Bookmark a listing for a user. Unique index prevents duplicates (database.md §3.3).
    TODO: db['saved_items'].insert_one({'user_id': ..., 'listing_id': ..., 'saved_at': ...})
    """
    pass


def get_saved_listings(user_id: str) -> list:
    """Return all saved listings for a user.
    TODO: db['saved_items'].find({'user_id': ObjectId(user_id)})
    """
    pass


def unsave_listing(saved_id: str, user_id: str) -> None:
    """Remove a saved item. Verify user_id ownership before delete (FR-7 implied).
    TODO: db['saved_items'].delete_one({'_id': ObjectId(saved_id), 'user_id': ObjectId(user_id)})
    """
    pass

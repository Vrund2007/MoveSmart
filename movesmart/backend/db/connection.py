"""db/connection.py — PyMongo client setup (Architecture.md §2, §5)
Reads MONGO_URI from Django settings (set from .env). No Django ORM — see Architecture.md §2.
"""
from django.conf import settings
import pymongo
from typing import Optional

_client: Optional[pymongo.MongoClient] = None
_db = None
DB_NAME = 'movesmart'


def get_db():
    """Return the MongoDB database instance, initialising the client on first call.

    Returns:
        pymongo.database.Database instance.

    TODO: initialise _client using settings.MONGO_URI on first call (lazy singleton)
    TODO: return _client[DB_NAME]
    TODO: raise a clear error if MONGO_URI is not set — don't connect to a default/empty URI
    """
    global _client, _db
    if _db is None:
        pass  # TODO: _client = pymongo.MongoClient(settings.MONGO_URI); _db = _client[DB_NAME]
    return _db

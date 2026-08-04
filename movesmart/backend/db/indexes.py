"""db/indexes.py — MongoDB collection index automation script (Database.md §3)"""
import os
import sys
import logging
from pymongo import ASCENDING, DESCENDING

# Add parent backend directory to sys.path if run directly
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

# Initialize Django settings environment if running as standalone script
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from db.connection import get_db

logger = logging.getLogger('movesmart')


def ensure_indexes():
    """Create all production indexes for MoveSmart MongoDB collections."""
    db = get_db()
    print("Enforcing MongoDB collection indexes...")

    # 1. users collection
    db["users"].create_index([("email", ASCENDING)], unique=True)
    db["users"].create_index([("role", ASCENDING)])

    # 2. listings collection
    db["listings"].create_index([("status", ASCENDING), ("created_at", DESCENDING)])
    db["listings"].create_index([("locality", ASCENDING), ("bhk", ASCENDING), ("price", ASCENDING)])
    db["listings"].create_index([("owner_id", ASCENDING)])
    db["listings"].create_index([("submitted_by_broker_id", ASCENDING)])

    # 3. saved_items collection
    db["saved_items"].create_index([("user_id", ASCENDING), ("listing_id", ASCENDING)], unique=True)

    # 4. enquiries collection
    db["enquiries"].create_index([("listing_id", ASCENDING)])
    db["enquiries"].create_index([("owner_id", ASCENDING)])

    # 5. leads collection
    db["leads"].create_index([("broker_id", ASCENDING), ("lead_status", ASCENDING)])

    # 6. commissions collection
    db["commissions"].create_index([("broker_id", ASCENDING)])
    db["commissions"].create_index([("lead_id", ASCENDING)], unique=True)

    # 7. relocation_batches collection
    db["relocation_batches"].create_index([("company_id", ASCENDING), ("status", ASCENDING)])

    # 8. commute_cache collection
    db["commute_cache"].create_index([("origin_locality", ASCENDING), ("destination", ASCENDING), ("mode", ASCENDING)])
    db["commute_cache"].create_index([("expires_at", ASCENDING)], expireAfterSeconds=0)

    # 9. visits collection (Phase 9 — Seeker visit scheduling)
    db["visits"].create_index([("seeker_id", ASCENDING), ("status", ASCENDING)])
    db["visits"].create_index([("listing_id", ASCENDING)])

    # 10. conversations collection (Phase 9 — Seeker inbox)
    db["conversations"].create_index([("participants", ASCENDING)])
    db["conversations"].create_index([("listing_id", ASCENDING)])
    db["conversations"].create_index([("updated_at", DESCENDING)])

    # 11. payments collection (Phase 10 — Owner income tracking)
    db["payments"].create_index([("owner_id", ASCENDING), ("payment_date", DESCENDING)])
    db["payments"].create_index([("property_id", ASCENDING)])

    # 12. tenant_reviews collection (Phase 10 — Property reviews)
    db["tenant_reviews"].create_index([("property_id", ASCENDING)])
    db["tenant_reviews"].create_index([("created_at", DESCENDING)])

    # 13. property_documents collection (Phase 10 — Owner document store)
    db["property_documents"].create_index([("owner_id", ASCENDING), ("property_id", ASCENDING)])

    # Update visits index to include owner_id for Phase 10 owner-scoped queries
    db["visits"].create_index([("owner_id", ASCENDING), ("status", ASCENDING)])

    print("All MongoDB production indexes created successfully.")


if __name__ == '__main__':
    ensure_indexes()

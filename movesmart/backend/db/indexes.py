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

    # 14. clients collection (Phase 11 — Broker CRM clients)
    db["clients"].create_index([("broker_id", ASCENDING), ("status", ASCENDING)])
    db["clients"].create_index([("broker_id", ASCENDING), ("favorite", ASCENDING)])

    # 16. company_employees collection (Phase 12 — Company HR Enterprise)
    db["company_employees"].create_index([("company_id", ASCENDING), ("relocation_status", ASCENDING)])
    db["company_employees"].create_index([("company_id", ASCENDING), ("department", ASCENDING)])

    # 17. broker_assignments collection (Phase 12 — Company HR Broker Assignments)
    db["broker_assignments"].create_index([("company_id", ASCENDING), ("status", ASCENDING)])
    db["broker_assignments"].create_index([("employee_id", ASCENDING)])

    # 18. company_approvals collection (Phase 12 — Company HR Approvals Workflow)
    db["company_approvals"].create_index([("company_id", ASCENDING), ("status", ASCENDING)])
    db["company_approvals"].create_index([("employee_id", ASCENDING)])

    # 20. notifications collection (Phase 13 — Universal Notification Center)
    db["notifications"].create_index([("recipient_id", ASCENDING), ("is_read", ASCENDING)])
    db["notifications"].create_index([("created_at", DESCENDING)])

    # 21. calendar_events collection (Phase 13 — Universal Calendar & Scheduling)
    db["calendar_events"].create_index([("user_id", ASCENDING), ("start_time", ASCENDING)])

    # 22. activity_logs collection (Phase 13 — Activity Timeline & Audit Logs)
    db["activity_logs"].create_index([("user_id", ASCENDING), ("timestamp", DESCENDING)])
    db["activity_logs"].create_index([("timestamp", DESCENDING)])

    # 23. documents collection (Phase 13 — Universal Document Center)
    db["documents"].create_index([("user_id", ASCENDING), ("doc_type", ASCENDING)])

    # 24. audit_logs collection (Phase 14 — Super Admin Platform Audit Logs)
    db["audit_logs"].create_index([("actor_id", ASCENDING), ("timestamp", DESCENDING)])
    db["audit_logs"].create_index([("action", ASCENDING)])

    # 25. cms_content collection (Phase 14 — Super Admin CMS Manager)
    db["cms_content"].create_index([("slug", ASCENDING)], unique=True)

    # 26. user_feedback collection (Phase 14 — Feedback Center)
    db["user_feedback"].create_index([("status", ASCENDING), ("created_at", DESCENDING)])

    # 27. platform_settings collection (Phase 14 — Platform Settings)
    db["platform_settings"].create_index([("setting_key", ASCENDING)], unique=True)

    print("All MongoDB production indexes created successfully.")


if __name__ == '__main__':
    ensure_indexes()

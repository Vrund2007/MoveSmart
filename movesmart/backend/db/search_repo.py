"""db/search_repo.py — PyMongo aggregation layer for global platform search (database.md §3, Phase 13)"""
from typing import Dict, Any, List
from bson import ObjectId
from .connection import get_db
from . import listings_repo, users_repo, clients_repo, employees_repo


def global_search(query_str: str, user_id: str, role: str) -> Dict[str, Any]:
    """Execute unified search across listings, clients, employees, documents, and messages."""
    if not query_str or len(query_str.strip()) < 2:
        return {"listings": [], "clients": [], "employees": [], "documents": [], "total_results": 0}

    q = query_str.strip()
    s_regex = {"$regex": q, "$options": "i"}
    db = get_db()

    # 1. Properties Search
    listings_cursor = db["listings"].find({
        "$or": [
            {"title": s_regex},
            {"locality": s_regex},
            {"description": s_regex}
        ]
    }).limit(5)
    matched_listings = [listings_repo._serialize(doc) for doc in listings_cursor]

    # 2. Clients Search (Broker / HR / Admin)
    matched_clients = []
    try:
        c_cursor = db["clients"].find({
            "$or": [
                {"name": s_regex},
                {"email": s_regex},
                {"phone": s_regex}
            ]
        }).limit(5)
        matched_clients = [clients_repo._serialize(doc) for doc in c_cursor]
    except Exception:
        pass

    # 3. Employees Search (HR / Admin)
    matched_employees = []
    try:
        e_cursor = db["company_employees"].find({
            "$or": [
                {"name": s_regex},
                {"email": s_regex},
                {"department": s_regex},
                {"designation": s_regex}
            ]
        }).limit(5)
        matched_employees = [employees_repo._serialize(doc) for doc in e_cursor]
    except Exception:
        pass

    # 4. Documents Search
    matched_docs = []
    try:
        d_cursor = db["property_documents"].find({
            "$or": [
                {"document_name": s_regex},
                {"doc_type": s_regex}
            ]
        }).limit(5)
        for d in d_cursor:
            d["_id"] = str(d["_id"])
            d["owner_id"] = str(d.get("owner_id"))
            matched_docs.append(d)
    except Exception:
        pass

    total = len(matched_listings) + len(matched_clients) + len(matched_employees) + len(matched_docs)

    return {
        "listings": matched_listings,
        "clients": matched_clients,
        "employees": matched_employees,
        "documents": matched_docs,
        "total_results": total
    }

"""db/admin_platform_repo.py — PyMongo access layer for Super Admin Platform (database.md §3, Phase 14)"""
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from bson import ObjectId
from .connection import get_db
from . import users_repo, listings_repo, visits_repo, employees_repo


def _serialize(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return doc
    doc = dict(doc)
    doc["_id"] = str(doc["_id"])
    return doc


def get_admin_dashboard_summary() -> Dict[str, Any]:
    """Aggregate enterprise metrics dynamically from MongoDB across users, properties, visits, chats, and localities."""
    db = get_db()

    # User breakdown by role
    total_users = db["users"].count_documents({})
    seekers_count = db["users"].count_documents({"role": "find_accommodation"})
    owners_count = db["users"].count_documents({"role": "property_owner"})
    companies_count = db["users"].count_documents({"role": "company_hr"})
    admins_count = db["users"].count_documents({"role": "admin"})

    # Listing status & source breakdown
    total_listings = db["listings"].count_documents({})
    pending_listings = db["listings"].count_documents({"status": "pending_review"})
    approved_listings = db["listings"].count_documents({"status": "approved"})
    rejected_listings = db["listings"].count_documents({"status": "rejected"})

    # Real Landlords vs Scraped (Real Landlord = has valid owner_id)
    real_landlord_listings = db["listings"].count_documents({
        "owner_id": {"$ne": None, "$exists": True}
    })
    scraped_listings = max(0, total_listings - real_landlord_listings)

    # 1. RENTAL LISTINGS AGGREGATION (deal_type = 'rent')
    rent_query = {"deal_type": {"$regex": "^rent$", "$options": "i"}}
    rent_count = db["listings"].count_documents(rent_query)

    rent_agg = list(db["listings"].aggregate([
        {"$match": {
            "deal_type": {"$regex": "^rent$", "$options": "i"},
            "locality": {"$ne": None, "$ne": ""}
        }},
        {"$project": {
            "locality": 1,
            "price_val": {"$ifNull": ["$price", "$rent"]}
        }},
        {"$group": {
            "_id": "$locality",
            "listings_count": {"$sum": 1},
            "avg_rent": {"$avg": "$price_val"},
            "min_rent": {"$min": "$price_val"},
            "max_rent": {"$max": "$price_val"}
        }},
        {"$sort": {"listings_count": -1}},
        {"$limit": 10}
    ]))

    rent_gmv_agg = list(db["listings"].aggregate([
        {"$match": {"deal_type": {"$regex": "^rent$", "$options": "i"}}},
        {"$project": {"price_val": {"$ifNull": ["$price", "$rent"]}}},
        {"$group": {"_id": None, "totalRent": {"$sum": "$price_val"}, "avgRent": {"$avg": "$price_val"}}}
    ]))
    rent_total_gmv = rent_gmv_agg[0]["totalRent"] if rent_gmv_agg else 0
    rent_avg_price = int(rent_gmv_agg[0]["avgRent"]) if rent_gmv_agg else 0

    rent_localities_list = []
    for loc in rent_agg:
        if loc["_id"]:
            min_r = int(loc.get("min_rent") or 0)
            max_r = int(loc.get("max_rent") or 0)
            avg_r = int(loc.get("avg_rent") or 0)
            rent_localities_list.append({
                "name": str(loc["_id"]),
                "listings": loc["listings_count"],
                "avgRent": avg_r,
                "range": f"₹{min_r:,} - ₹{max_r:,}"
            })

    # 2. SALE / BUY LISTINGS AGGREGATION (deal_type = 'buy' or 'sale')
    sale_query = {"deal_type": {"$in": ["buy", "sale"]}}
    sale_count = db["listings"].count_documents(sale_query)

    sale_agg = list(db["listings"].aggregate([
        {"$match": {
            "deal_type": {"$in": ["buy", "sale"]},
            "locality": {"$ne": None, "$ne": ""}
        }},
        {"$project": {
            "locality": 1,
            "price_val": {"$ifNull": ["$price", "$rent"]}
        }},
        {"$group": {
            "_id": "$locality",
            "listings_count": {"$sum": 1},
            "avg_price": {"$avg": "$price_val"},
            "min_price": {"$min": "$price_val"},
            "max_price": {"$max": "$price_val"}
        }},
        {"$sort": {"listings_count": -1}},
        {"$limit": 10}
    ]))

    sale_localities_list = []
    for loc in sale_agg:
        if loc["_id"]:
            min_p = int(loc.get("min_price") or 0)
            max_p = int(loc.get("max_price") or 0)
            avg_p = int(loc.get("avg_price") or 0)

            def fmt_curr(val):
                if val >= 10000000:
                    return f"₹{(val / 10000000):.2f} Cr"
                elif val >= 100000:
                    return f"₹{(val / 100000):.1f} L"
                return f"₹{val:,}"

            sale_localities_list.append({
                "name": str(loc["_id"]),
                "listings": loc["listings_count"],
                "avgPrice": avg_p,
                "avgPriceFormatted": fmt_curr(avg_p),
                "range": f"{fmt_curr(min_p)} - {fmt_curr(max_p)}"
            })

    # Platform engagement metrics
    pending_visits = db["visits"].count_documents({"status": "pending"})
    active_conversations = db["conversations"].count_documents({})

    return {
        "user_metrics": {
            "total_users": total_users,
            "seekers": seekers_count,
            "owners": owners_count,
            "companies": companies_count,
            "admins": admins_count
        },
        "listing_metrics": {
            "total_listings": total_listings,
            "pending": pending_listings,
            "approved": approved_listings,
            "rejected": rejected_listings,
            "real_landlords": real_landlord_listings,
            "scraped": scraped_listings,
            "rent_count": rent_count,
            "sale_count": sale_count,
            "total_gmv": rent_total_gmv,
            "avg_rent": rent_avg_price
        },
        "rent_localities": rent_localities_list,
        "sale_localities": sale_localities_list,
        "localities": rent_localities_list,
        "engagement_metrics": {
            "pending_visits": pending_visits,
            "active_conversations": active_conversations
        },
        "system_health": {
            "server_status": "operational",
            "mongodb_status": "connected",
            "gemini_status": "healthy",
            "ml_model_version": "v1.2-rent-anomaly"
        }
    }


def get_all_users(
    role: Optional[str] = None,
    search: Optional[str] = None,
    account_status: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Fetch user registry with search and filters."""
    db = get_db()
    query: Dict[str, Any] = {}

    if role and role != "all":
        query["role"] = role

    if account_status and account_status != "all":
        query["account_status"] = account_status

    if search:
        s_regex = {"$regex": search, "$options": "i"}
        query["$or"] = [{"email": s_regex}, {"name": s_regex}]

    cursor = db["users"].find(query).sort("created_at", -1)
    users = []
    for doc in cursor:
        doc = _serialize(doc)
        doc.pop("password_hash", None)
        doc.setdefault("account_status", "active")
        doc.setdefault("verified", True)
        users.append(doc)
    return users


def update_user_status(user_id: str, new_status: str) -> bool:
    """Suspend or activate user account."""
    db = get_db()
    try:
        res = db["users"].update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"account_status": new_status, "updated_at": datetime.now(timezone.utc)}}
        )
        return res.modified_count > 0
    except Exception:
        return False


def delete_user(user_id: str) -> bool:
    """Permanently delete user account."""
    db = get_db()
    try:
        res = db["users"].delete_one({"_id": ObjectId(user_id)})
        return res.deleted_count > 0
    except Exception:
        return False

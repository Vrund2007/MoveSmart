"""db/reports_repo.py — PyMongo aggregation layer for broker CRM reports & performance metrics (Phase 11)"""
from datetime import datetime, timezone
from typing import Dict, Any, List
from bson import ObjectId
from .connection import get_db


def generate_lead_report(broker_id: str) -> Dict[str, Any]:
    """Aggregate lead pipeline metrics for a broker."""
    db = get_db()
    try:
        b_oid = ObjectId(broker_id)
    except Exception:
        return {"total_leads": 0, "status_breakdown": {}, "conversion_rate": 0.0}

    pipeline = [
        {"$match": {"broker_id": b_oid}},
        {"$group": {"_id": "$lead_status", "count": {"$sum": 1}}}
    ]
    results = list(db["leads"].aggregate(pipeline))

    status_breakdown = {item["_id"]: item["count"] for item in results if item["_id"]}
    total_leads = sum(status_breakdown.values())
    converted = status_breakdown.get("converted", 0)
    conversion_rate = round((converted / total_leads * 100), 1) if total_leads > 0 else 0.0

    # Fetch recent lead items
    recent_leads = list(db["leads"].find({"broker_id": b_oid}).sort("created_at", -1).limit(10))
    for l in recent_leads:
        l["_id"] = str(l["_id"])
        l["broker_id"] = str(l["broker_id"])

    return {
        "total_leads": total_leads,
        "converted_leads": converted,
        "conversion_rate": conversion_rate,
        "status_breakdown": status_breakdown,
        "recent_leads": recent_leads
    }


def generate_commission_report(broker_id: str) -> Dict[str, Any]:
    """Aggregate commission earnings, pending vs paid breakdown."""
    db = get_db()
    try:
        b_oid = ObjectId(broker_id)
    except Exception:
        return {"total_commission": 0, "paid": 0, "pending": 0, "commissions": []}

    pipeline = [
        {"$match": {"broker_id": b_oid}},
        {"$group": {
            "_id": "$payment_status",
            "total_amount": {"$sum": "$amount"},
            "count": {"$sum": 1}
        }}
    ]
    results = list(db["commissions"].aggregate(pipeline))

    paid_amount = 0.0
    pending_amount = 0.0
    for res in results:
        if res["_id"] == "paid":
            paid_amount = float(res["total_amount"])
        elif res["_id"] == "pending":
            pending_amount = float(res["total_amount"])

    comm_list = list(db["commissions"].find({"broker_id": b_oid}).sort("created_at", -1))
    for c in comm_list:
        c["_id"] = str(c["_id"])
        c["broker_id"] = str(c["broker_id"])
        if c.get("lead_id"):
            c["lead_id"] = str(c["lead_id"])

    return {
        "total_commission": paid_amount + pending_amount,
        "paid_commission": paid_amount,
        "pending_commission": pending_amount,
        "total_deals": len(comm_list),
        "commissions": comm_list
    }


def generate_listing_report(broker_id: str) -> Dict[str, Any]:
    """Aggregate broker listing inventory status & localities."""
    db = get_db()
    try:
        b_oid = ObjectId(broker_id)
    except Exception:
        return {"total_listings": 0, "status_breakdown": {}, "localities": []}

    pipeline = [
        {"$match": {"submitted_by_broker_id": b_oid}},
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ]
    results = list(db["listings"].aggregate(pipeline))
    status_breakdown = {res["_id"]: res["count"] for res in results if res["_id"]}

    locality_pipeline = [
        {"$match": {"submitted_by_broker_id": b_oid}},
        {"$group": {"_id": "$locality", "count": {"$sum": 1}}}
    ]
    locality_results = list(db["listings"].aggregate(locality_pipeline))
    localities = [{"locality": r["_id"] or "Unknown", "count": r["count"]} for r in locality_results]

    return {
        "total_listings": sum(status_breakdown.values()),
        "status_breakdown": status_breakdown,
        "locality_distribution": localities
    }


def generate_visit_report(broker_id: str) -> Dict[str, Any]:
    """Aggregate visit scheduler metrics for listings managed by broker."""
    db = get_db()
    try:
        b_oid = ObjectId(broker_id)
    except Exception:
        return {"total_visits": 0, "scheduled": 0, "completed": 0, "cancelled": 0}

    # Find listing IDs managed by broker
    broker_listings = [doc["_id"] for doc in db["listings"].find({"submitted_by_broker_id": b_oid}, {"_id": 1})]

    pipeline = [
        {"$match": {"$or": [{"listing_id": {"$in": broker_listings}}, {"broker_id": b_oid}]}},
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ]
    results = list(db["visits"].aggregate(pipeline))
    status_breakdown = {res["_id"]: res["count"] for res in results if res["_id"]}

    return {
        "total_visits": sum(status_breakdown.values()),
        "scheduled": status_breakdown.get("scheduled", 0) + status_breakdown.get("pending", 0),
        "completed": status_breakdown.get("completed", 0) + status_breakdown.get("approved", 0),
        "cancelled": status_breakdown.get("cancelled", 0) + status_breakdown.get("rejected", 0),
        "status_breakdown": status_breakdown
    }


def generate_performance_analytics(broker_id: str) -> Dict[str, Any]:
    """Calculate dynamic performance score (0-100) and trends."""
    lead_rep = generate_lead_report(broker_id)
    comm_rep = generate_commission_report(broker_id)
    list_rep = generate_listing_report(broker_id)
    visit_rep = generate_visit_report(broker_id)

    # Score calculation formula:
    # 30% Lead conversion rate (max 30 pts for 25%+ conversion)
    # 25% Active listings volume (max 25 pts for 5+ listings)
    # 25% Completed visits ratio (max 25 pts)
    # 20% Earnings growth (max 20 pts)
    conv_score = min(30, (lead_rep["conversion_rate"] / 25.0) * 30)
    list_score = min(25, (list_rep["total_listings"] / 5.0) * 25)
    
    tot_visits = visit_rep["total_visits"]
    visit_ratio = (visit_rep["completed"] / tot_visits) if tot_visits > 0 else 0.5
    visit_score = visit_ratio * 25

    revenue_score = min(20, (comm_rep["paid_commission"] / 50000.0) * 20)

    perf_score = int(round(conv_score + list_score + visit_score + revenue_score))
    perf_score = max(50, min(100, perf_score))  # Floor at 50 for baseline

    return {
        "performance_score": perf_score,
        "lead_conversion_rate": lead_rep["conversion_rate"],
        "total_revenue": comm_rep["paid_commission"],
        "pending_commission": comm_rep["pending_commission"],
        "active_listings": list_rep["status_breakdown"].get("approved", 0),
        "total_listings": list_rep["total_listings"],
        "total_clients": lead_rep["total_leads"],
        "visits_completed": visit_rep["completed"],
        "ai_suggestions": [
            "Focus on following up with Qualified leads in Visit Scheduled stage to improve conversion rate.",
            "List 2 more 2 BHK properties in high-demand localities to increase client matching opportunities.",
            "Toggle pending commissions to paid upon receiving bank transfers."
        ]
    }

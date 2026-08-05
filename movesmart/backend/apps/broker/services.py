"""apps/broker/services.py — Service layer for Broker CRM (Architecture.md §4.3, PRD §7)"""
from typing import Dict, Any
from db import clients_repo, tasks_repo, leads_repo, commissions_repo, listings_repo, visits_repo, reports_repo


def get_crm_dashboard_summary(broker_id: str) -> Dict[str, Any]:
    """Gather aggregated CRM overview metrics and widget data for broker."""
    # 1. Listings stats
    listings = listings_repo.get_listings_by_broker(broker_id)
    total_listings = len(listings)
    active_listings = len([l for l in listings if l.get("status") == "approved"])
    pending_listings = len([l for l in listings if l.get("status") == "pending_review"])

    # 2. Clients stats
    clients = clients_repo.get_broker_clients(broker_id)
    active_clients = len([c for c in clients if c.get("status") == "active"])

    # 3. Leads stats
    leads = leads_repo.get_broker_leads(broker_id)
    new_leads = len([l for l in leads if l.get("lead_status") == "new"])
    converted_leads = len([l for l in leads if l.get("lead_status") == "converted"])

    # 4. Visits stats
    broker_listings_ids = [l["_id"] for l in listings]
    visits = visits_repo.get_seeker_visits(broker_id)  # fetch visits
    # Also check visits on broker's listings
    scheduled_visits = len([v for v in visits if v.get("status") in ["scheduled", "pending", "requested"]])
    completed_visits = len([v for v in visits if v.get("status") in ["completed", "approved"]])

    # 5. Commissions & Revenue
    commissions = commissions_repo.get_broker_commissions(broker_id)
    paid_comm = sum(c.get("amount", 0) for c in commissions if c.get("payment_status") == "paid")
    pending_comm = sum(c.get("amount", 0) for c in commissions if c.get("payment_status") == "pending")

    # 6. Tasks
    tasks = tasks_repo.get_broker_tasks(broker_id)
    pending_tasks = len([t for t in tasks if t.get("status") != "completed"])

    # 7. Performance score & Analytics
    analytics = reports_repo.generate_performance_analytics(broker_id)

    return {
        "widgets": {
            "total_listings": total_listings,
            "active_listings": active_listings,
            "pending_approval": pending_listings,
            "active_clients": active_clients,
            "new_leads": new_leads,
            "scheduled_visits": scheduled_visits,
            "completed_visits": completed_visits,
            "monthly_revenue": paid_comm,
            "monthly_commission": paid_comm + pending_comm,
            "pending_commission": pending_comm,
            "pending_tasks": pending_tasks,
            "performance_score": analytics["performance_score"]
        },
        "recent_activity": [
            {"type": "lead", "title": f"{l.get('seeker_name')} registered as lead", "timestamp": l.get("created_at")}
            for l in leads[:4]
        ] + [
            {"type": "task", "title": f"Task due: {t.get('title')}", "timestamp": t.get("due_date")}
            for t in tasks[:3]
        ],
        "ai_suggestions": analytics["ai_suggestions"]
    }

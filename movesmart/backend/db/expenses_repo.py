"""db/expenses_repo.py — PyMongo access layer for relocation_expenses collection (database.md §3, Phase 12)"""
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from bson import ObjectId
from .connection import get_db

VALID_CATEGORIES = {
    "Housing", "Broker Fee", "Transportation", "Temporary Stay", "Documentation", "Miscellaneous"
}


def _serialize(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return doc
    doc = dict(doc)
    doc["_id"] = str(doc["_id"])
    doc["company_id"] = str(doc["company_id"])
    return doc


def create_expense(expense_data: dict) -> Dict[str, Any]:
    """Create a new relocation expense entry."""
    db = get_db()
    now = datetime.now(timezone.utc)

    category = expense_data.get("category", "Miscellaneous")
    if category not in VALID_CATEGORIES:
        category = "Miscellaneous"

    doc = {
        "company_id": ObjectId(expense_data["company_id"]),
        "employee_id": str(expense_data.get("employee_id", "General")),
        "category": category,
        "amount": float(expense_data.get("amount", 0.0)),
        "status": expense_data.get("status", "approved"),
        "notes": expense_data.get("notes", "").strip(),
        "created_at": now,
        "updated_at": now
    }

    result = db["relocation_expenses"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize(doc)


def get_company_expenses(company_id: str, category: Optional[str] = None) -> List[Dict[str, Any]]:
    """Fetch company relocation expenses."""
    db = get_db()
    try:
        c_oid = ObjectId(company_id)
    except Exception:
        return []

    query: Dict[str, Any] = {"company_id": c_oid}
    if category and category != "all":
        query["category"] = category

    cursor = db["relocation_expenses"].find(query).sort("created_at", -1)
    return [_serialize(doc) for doc in cursor]


def delete_expense(expense_id: str, company_id: str) -> bool:
    """Delete an expense record."""
    db = get_db()
    try:
        e_oid = ObjectId(expense_id)
        c_oid = ObjectId(company_id)
    except Exception:
        return False

    res = db["relocation_expenses"].delete_one({"_id": e_oid, "company_id": c_oid})
    return res.deleted_count > 0


def get_expense_summary(company_id: str) -> Dict[str, Any]:
    """Aggregate expense breakdown by category."""
    db = get_db()
    try:
        c_oid = ObjectId(company_id)
    except Exception:
        return {"total_expenses": 0.0, "category_breakdown": {}}

    pipeline = [
        {"$match": {"company_id": c_oid}},
        {"$group": {
            "_id": "$category",
            "total_amount": {"$sum": "$amount"},
            "count": {"$sum": 1}
        }}
    ]

    results = list(db["relocation_expenses"].aggregate(pipeline))

    category_breakdown = {res["_id"]: float(res["total_amount"]) for res in results if res["_id"]}
    total_expenses = sum(category_breakdown.values())

    return {
        "total_expenses": total_expenses,
        "category_breakdown": category_breakdown
    }

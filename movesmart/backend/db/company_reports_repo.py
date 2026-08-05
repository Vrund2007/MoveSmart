"""db/company_reports_repo.py — PyMongo aggregation layer for enterprise corporate HR reports (Phase 12)"""
from typing import Dict, Any, List
from bson import ObjectId
from .connection import get_db
from . import expenses_repo, employees_repo, relocation_batches_repo


def generate_employee_relocation_report(company_id: str) -> Dict[str, Any]:
    """Aggregate relocation status metrics for company employees."""
    db = get_db()
    employees = employees_repo.get_company_employees(company_id)
    total_employees = len(employees)

    status_breakdown = {}
    dept_breakdown = {}

    for emp in employees:
        st = emp.get("relocation_status", "initiated")
        status_breakdown[st] = status_breakdown.get(st, 0) + 1

        dept = emp.get("department", "General")
        dept_breakdown[dept] = dept_breakdown.get(dept, 0) + 1

    moved_count = status_breakdown.get("moved", 0)
    completion_rate = round((moved_count / total_employees * 100), 1) if total_employees > 0 else 0.0

    return {
        "total_employees": total_employees,
        "completion_rate": completion_rate,
        "status_breakdown": status_breakdown,
        "department_breakdown": dept_breakdown,
        "recent_employees": employees[:10]
    }


def generate_broker_performance_report(company_id: str) -> Dict[str, Any]:
    """Aggregate performance metrics for brokers assigned to company employees."""
    db = get_db()
    try:
        c_oid = ObjectId(company_id)
    except Exception:
        return {"total_assignments": 0, "active_assignments": 0, "completed_assignments": 0}

    assignments = list(db["broker_assignments"].find({"company_id": c_oid}))
    total_assignments = len(assignments)

    active_count = len([a for a in assignments if a.get("status") == "active"])
    completed_count = len([a for a in assignments if a.get("status") == "completed"])

    return {
        "total_assignments": total_assignments,
        "active_assignments": active_count,
        "completed_assignments": completed_count,
        "completion_ratio": round((completed_count / total_assignments * 100), 1) if total_assignments > 0 else 0.0
    }


def generate_budget_report(company_id: str) -> Dict[str, Any]:
    """Aggregate company budget utilization across relocation batches and expenses."""
    batches = relocation_batches_repo.get_company_batches(company_id)
    exp_summary = expenses_repo.get_expense_summary(company_id)

    total_allocated_budget = sum(float(b.get("budget", 0)) for b in batches)
    total_used_cost = sum(sum(float(a.get("cost", 0)) for a in b.get("allocations", [])) for b in batches)
    total_logged_expenses = exp_summary.get("total_expenses", 0.0)

    total_expenditure = total_used_cost + total_logged_expenses
    remaining_budget = max(0.0, total_allocated_budget - total_expenditure)

    return {
        "total_allocated_budget": total_allocated_budget,
        "total_housing_cost": total_used_cost,
        "total_logged_expenses": total_logged_expenses,
        "total_expenditure": total_expenditure,
        "remaining_budget": remaining_budget,
        "utilization_rate": round((total_expenditure / total_allocated_budget * 100), 1) if total_allocated_budget > 0 else 0.0
    }

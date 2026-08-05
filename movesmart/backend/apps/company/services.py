"""apps/company/services.py — Service layer for Company HR Enterprise module (Architecture.md §4.4, Phase 12)"""
from typing import Dict, Any
from db import (
    employees_repo,
    broker_assignments_repo,
    approvals_repo,
    expenses_repo,
    relocation_batches_repo,
    company_reports_repo,
    users_repo
)


def get_enterprise_dashboard_summary(company_id: str) -> Dict[str, Any]:
    """Gather aggregated corporate dashboard metrics and widgets for HR."""
    # 1. Batches stats
    batches = relocation_batches_repo.get_company_batches(company_id)
    active_batches = len([b for b in batches if b.get("status") == "active"])

    # 2. Employees stats
    employees = employees_repo.get_company_employees(company_id)
    total_employees = len(employees)
    employees_waiting = len([e for e in employees if e.get("relocation_status") in ["initiated", "broker_assigned"]])
    employees_allocated = len([e for e in employees if e.get("relocation_status") in ["property_shortlisted", "approved"]])
    employees_moved = len([e for e in employees if e.get("relocation_status") == "moved"])

    # 3. Brokers & Assignments
    assignments = broker_assignments_repo.get_company_assignments(company_id)
    active_broker_assignments = len([a for a in assignments if a.get("status") == "active"])

    # 4. Approvals stats
    approvals = approvals_repo.get_company_approvals(company_id)
    pending_approvals = len([ap for ap in approvals if ap.get("status") == "pending"])

    # 5. Budget & Expenses
    budget_rep = company_reports_repo.generate_budget_report(company_id)

    # 6. Available Brokers on Platform
    brokers = users_repo.get_users_by_role("broker")
    available_brokers_count = len(brokers)

    return {
        "widgets": {
            "active_batches": active_batches,
            "total_employees": total_employees,
            "employees_waiting": employees_waiting,
            "employees_allocated": employees_allocated,
            "employees_moved": employees_moved,
            "available_brokers": available_brokers_count,
            "active_broker_assignments": active_broker_assignments,
            "pending_approvals": pending_approvals,
            "budget_allocated": budget_rep["total_allocated_budget"],
            "budget_used": budget_rep["total_expenditure"],
            "budget_remaining": budget_rep["remaining_budget"],
            "utilization_rate": budget_rep["utilization_rate"]
        },
        "recent_activity": [
            {"type": "employee", "title": f"Employee {e.get('name')} status: {e.get('relocation_status')}", "timestamp": e.get("updated_at")}
            for e in employees[:4]
        ] + [
            {"type": "approval", "title": f"Approval requested for {ap.get('employee_id')}", "timestamp": ap.get("created_at")}
            for ap in approvals[:3]
        ],
        "ai_suggestions": [
            f"Review {pending_approvals} pending approval requests to unblock employee relocation timelines.",
            f"{employees_waiting} employees are currently waiting for broker property assignments.",
            f"Budget utilization is currently at {budget_rep['utilization_rate']}%. Remaining budget is ₹{budget_rep['remaining_budget']:,.0f}."
        ]
    }

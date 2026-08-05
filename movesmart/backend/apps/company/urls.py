"""apps/company/urls.py — URL patterns for company app (Architecture.md §8, Phase 12)"""
from django.urls import path
from . import views

urlpatterns = [
    path('company/dashboard', views.CompanyDashboardView.as_view(), name='company-dashboard'),
    path('company/profile', views.CompanyProfileView.as_view(), name='company-profile'),
    path('company/employees', views.EmployeesView.as_view(), name='company-employees'),
    path('company/employees/<str:employee_id>', views.EmployeeDetailView.as_view(), name='company-employee-detail'),
    path('company/broker-assignments', views.BrokerAssignmentsView.as_view(), name='company-broker-assignments'),
    path('company/broker-assignments/<str:assignment_id>', views.BrokerAssignmentDetailView.as_view(), name='company-broker-assignment-detail'),
    path('company/approvals', views.ApprovalsView.as_view(), name='company-approvals'),
    path('company/approvals/<str:approval_id>', views.ApprovalDetailView.as_view(), name='company-approval-detail'),
    path('company/expenses', views.ExpensesView.as_view(), name='company-expenses'),
    path('company/expenses/<str:expense_id>', views.ExpenseDetailView.as_view(), name='company-expense-detail'),
    path('company/reports', views.CompanyReportsView.as_view(), name='company-reports'),
    path('company/reports/export', views.CompanyReportExportView.as_view(), name='company-reports-export'),
    path('company/ai-assistant', views.AIEnterpriseAssistantView.as_view(), name='company-ai-assistant'),

    # Phase 6 Relocation Batch routes
    path('company/relocation-batches', views.RelocationBatchesView.as_view(), name='relocation-batches'),
    path('company/relocation-batches/<str:batch_id>', views.RelocationBatchDetailView.as_view(), name='relocation-batch-detail'),
    path('company/relocation-batches/<str:batch_id>/employees', views.BatchEmployeesView.as_view(), name='batch-employees'),
    path('company/relocation-batches/<str:batch_id>/employees/<str:employee_id>', views.BatchEmployeeDetailView.as_view(), name='batch-employee-detail'),
    path('company/relocation-batches/<str:batch_id>/search', views.BatchSearchView.as_view(), name='batch-search'),
    path('company/relocation-batches/<str:batch_id>/allocate', views.BatchAllocateView.as_view(), name='batch-allocate'),
    path('company/relocation-batches/<str:batch_id>/report', views.BatchReportView.as_view(), name='batch-report'),
]

"""apps/company/urls.py — URL patterns for company app (Architecture.md §8)"""
from django.urls import path
from . import views

urlpatterns = [
    path('company/profile', views.CompanyProfileView.as_view(), name='company-profile'),
    path('company/relocation-batches', views.RelocationBatchesView.as_view(), name='relocation-batches'),
    path('company/relocation-batches/<str:batch_id>', views.RelocationBatchDetailView.as_view(), name='relocation-batch-detail'),
    path('company/relocation-batches/<str:batch_id>/employees', views.BatchEmployeesView.as_view(), name='batch-employees'),
    path('company/relocation-batches/<str:batch_id>/employees/<str:employee_id>', views.BatchEmployeeDetailView.as_view(), name='batch-employee-detail'),
    path('company/relocation-batches/<str:batch_id>/search', views.BatchSearchView.as_view(), name='batch-search'),
    path('company/relocation-batches/<str:batch_id>/allocate', views.BatchAllocateView.as_view(), name='batch-allocate'),
    path('company/relocation-batches/<str:batch_id>/report', views.BatchReportView.as_view(), name='batch-report'),
]

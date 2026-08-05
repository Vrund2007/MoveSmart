"""apps/broker/urls.py — URL patterns for broker app (Architecture.md §8, Phase 11)"""
from django.urls import path
from . import views

urlpatterns = [
    path('broker/dashboard', views.BrokerDashboardView.as_view(), name='broker-dashboard'),
    path('broker/listings', views.BrokerListingsView.as_view(), name='broker-listings'),
    path('broker/listings/<str:listing_id>', views.BrokerListingDetailView.as_view(), name='broker-listing-detail'),
    path('broker/clients', views.ClientsView.as_view(), name='broker-clients'),
    path('broker/clients/<str:client_id>', views.ClientDetailView.as_view(), name='broker-client-detail'),
    path('broker/clients/<str:client_id>/notes', views.ClientNoteView.as_view(), name='broker-client-notes'),
    path('broker/tasks', views.TasksView.as_view(), name='broker-tasks'),
    path('broker/tasks/<str:task_id>', views.TaskDetailView.as_view(), name='broker-task-detail'),
    path('broker/analytics', views.BrokerAnalyticsView.as_view(), name='broker-analytics'),
    path('broker/reports', views.BrokerReportsView.as_view(), name='broker-reports'),
    path('broker/reports/export', views.BrokerReportExportView.as_view(), name='broker-reports-export'),
    path('broker/client-match', views.ClientMatchView.as_view(), name='broker-client-match'),
    path('leads', views.LeadsView.as_view(), name='leads'),
    path('leads/<str:lead_id>', views.LeadDetailView.as_view(), name='lead-detail'),
    path('commissions', views.CommissionsView.as_view(), name='commissions'),
    path('commissions/<str:commission_id>', views.CommissionDetailView.as_view(), name='commission-detail'),
]

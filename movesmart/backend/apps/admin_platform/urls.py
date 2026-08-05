"""apps/admin_platform/urls.py — URL patterns for Super Admin Platform"""
from django.urls import path
from . import views

urlpatterns = [
    path('admin/dashboard', views.AdminDashboardView.as_view(), name='admin-dashboard'),
    path('admin/users', views.AdminUsersView.as_view(), name='admin-users'),
    path('admin/users/<str:user_id>', views.AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admin/listings', views.AdminListingsView.as_view(), name='admin-listings'),
    path('admin/listings/bulk', views.AdminListingBulkView.as_view(), name='admin-listings-bulk'),
    path('admin/brokers', views.AdminBrokersView.as_view(), name='admin-brokers'),
    path('admin/companies', views.AdminCompaniesView.as_view(), name='admin-companies'),
    path('admin/ai-monitoring', views.AdminAIMonitoringView.as_view(), name='admin-ai-monitoring'),
    path('admin/analytics/export', views.AdminAnalyticsExportView.as_view(), name='admin-analytics-export'),
]

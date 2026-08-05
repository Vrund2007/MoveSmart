"""apps/audit/urls.py — URL routes for audit app"""
from django.urls import path
from . import views

urlpatterns = [
    path('admin/audit-logs', views.AuditLogsView.as_view(), name='admin-audit-logs'),
]

"""apps/reports/urls.py — URL routes for reports app"""
from django.urls import path
from . import views

urlpatterns = [
    path('reports', views.UniversalReportsView.as_view(), name='universal-reports'),
    path('reports/export', views.UniversalReportExportView.as_view(), name='universal-reports-export'),
]

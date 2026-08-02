"""apps/broker/urls.py — URL patterns for broker app (Architecture.md §8)"""
from django.urls import path
from . import views

urlpatterns = [
    path('leads', views.LeadsView.as_view(), name='leads'),
    path('leads/<str:lead_id>', views.LeadDetailView.as_view(), name='lead-detail'),
    path('commissions', views.CommissionsView.as_view(), name='commissions'),
]

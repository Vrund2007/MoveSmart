"""apps/visits/owner_urls.py — URL routes for owner-side visit management"""
from django.urls import path
from .owner_views import OwnerVisitsView, OwnerVisitDetailView

urlpatterns = [
    path('', OwnerVisitsView.as_view(), name='owner-visits-list'),
    path('<str:visit_id>/status/', OwnerVisitDetailView.as_view(), name='owner-visit-status'),
]

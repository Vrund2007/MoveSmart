"""apps/broker/urls.py — URL patterns for broker app (Architecture.md §8)"""
from django.urls import path
from . import views

urlpatterns = [
    path('broker/listings', views.BrokerListingsView.as_view(), name='broker-listings'),
    path('broker/listings/<str:listing_id>', views.BrokerListingDetailView.as_view(), name='broker-listing-detail'),
    path('broker/client-match', views.ClientMatchView.as_view(), name='broker-client-match'),
    path('leads', views.LeadsView.as_view(), name='leads'),
    path('leads/<str:lead_id>', views.LeadDetailView.as_view(), name='lead-detail'),
    path('commissions', views.CommissionsView.as_view(), name='commissions'),
    path('commissions/<str:commission_id>', views.CommissionDetailView.as_view(), name='commission-detail'),
]

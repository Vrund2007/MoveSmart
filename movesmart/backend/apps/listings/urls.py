"""apps/listings/urls.py — URL patterns for listings app (Architecture.md §8)"""
from django.urls import path
from . import views

urlpatterns = [
    path('listings', views.ListingsView.as_view(), name='listings'),
    path('listings/my', views.MyListingsView.as_view(), name='my-listings'),
    path('listings/upload-image', views.ImageUploadView.as_view(), name='listing-upload-image'),
    path('listings/<str:listing_id>', views.ListingDetailView.as_view(), name='listing-detail'),
    path('listings/<str:listing_id>/rent-prediction', views.RentPredictionView.as_view(), name='listing-rent-prediction'),
    path('listings/<str:listing_id>/trust-score', views.TrustScoreView.as_view(), name='listing-trust-score'),
    path('listings/<str:listing_id>/analytics', views.ListingAnalyticsView.as_view(), name='listing-analytics'),
    path('saved-listings', views.SavedListingsView.as_view(), name='saved-listings'),
    path('saved-listings/<str:saved_id>', views.SavedListingDetailView.as_view(), name='saved-listing-detail'),
]

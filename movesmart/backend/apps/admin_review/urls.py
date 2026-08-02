"""apps/admin_review/urls.py — URL patterns for admin_review app (Architecture.md §8)"""
from django.urls import path
from . import views

urlpatterns = [
    path('listings', views.ReviewQueueView.as_view(), name='admin-review-queue'),
    path('listings/<str:listing_id>/review', views.ReviewActionView.as_view(), name='admin-review-action'),
]

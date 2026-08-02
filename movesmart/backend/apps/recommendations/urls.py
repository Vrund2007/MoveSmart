"""apps/recommendations/urls.py — URL patterns for recommendations app (Architecture.md §8)"""
from django.urls import path
from . import views

urlpatterns = [
    path('recommendations/areas', views.AreaRecommendationsView.as_view(), name='recommendations-areas'),
]

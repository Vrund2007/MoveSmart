"""apps/cost_of_living/urls.py — URL patterns for cost_of_living app (Architecture.md §8)"""
from django.urls import path
from . import views

urlpatterns = [
    path('cost-of-living', views.CostOfLivingView.as_view(), name='cost-of-living'),
]

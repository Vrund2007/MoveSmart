"""apps/commute/urls.py — URL patterns for commute app (Architecture.md §8)"""
from django.urls import path
from . import views

urlpatterns = [
    path('commute', views.CommuteView.as_view(), name='commute'),
]

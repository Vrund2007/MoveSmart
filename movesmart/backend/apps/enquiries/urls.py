"""apps/enquiries/urls.py — URL patterns for enquiries app (Architecture.md §8)"""
from django.urls import path
from . import views

urlpatterns = [
    path('enquiries', views.EnquiriesView.as_view(), name='enquiries'),
]

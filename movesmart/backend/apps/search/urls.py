"""apps/search/urls.py — URL routes for global search"""
from django.urls import path
from . import views

urlpatterns = [
    path('search', views.GlobalSearchView.as_view(), name='global-search'),
]

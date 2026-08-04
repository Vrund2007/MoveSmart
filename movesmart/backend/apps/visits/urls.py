"""apps/visits/urls.py — URL pattern routes for visits app"""
from django.urls import path
from . import views

urlpatterns = [
    path('visits', views.VisitsView.as_view(), name='visits-list-create'),
    path('visits/<str:visit_id>', views.VisitDetailView.as_view(), name='visit-detail'),
    path('visits/<str:visit_id>/status', views.VisitDetailView.as_view(), name='visit-status-update'),
]

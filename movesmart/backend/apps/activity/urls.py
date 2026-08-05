"""apps/activity/urls.py — URL routes for activity app"""
from django.urls import path
from . import views

urlpatterns = [
    path('activity', views.ActivityLogsView.as_view(), name='activity-logs'),
]

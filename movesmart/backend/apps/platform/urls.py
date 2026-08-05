"""apps/platform/urls.py — URL routes for platform settings & feedback"""
from django.urls import path
from . import views

urlpatterns = [
    path('admin/settings', views.PlatformSettingsView.as_view(), name='admin-settings'),
    path('admin/feedback', views.FeedbackListView.as_view(), name='admin-feedback'),
    path('admin/feedback/<str:feedback_id>', views.FeedbackDetailView.as_view(), name='admin-feedback-detail'),
    path('platform/feedback', views.FeedbackListView.as_view(), name='public-feedback'),
]

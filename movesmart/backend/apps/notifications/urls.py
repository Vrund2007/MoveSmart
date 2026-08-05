"""apps/notifications/urls.py — URL routes for notifications app"""
from django.urls import path
from . import views

urlpatterns = [
    path('notifications', views.NotificationsView.as_view(), name='notifications'),
    path('notifications/mark-all-read', views.NotificationMarkAllReadView.as_view(), name='notifications-mark-all-read'),
    path('notifications/<str:notification_id>/read', views.NotificationReadView.as_view(), name='notification-read'),
    path('notifications/<str:notification_id>', views.NotificationDetailView.as_view(), name='notification-detail'),
]

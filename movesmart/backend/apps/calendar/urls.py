"""apps/calendar/urls.py — URL routes for calendar app"""
from django.urls import path
from . import views

urlpatterns = [
    path('calendar/events', views.CalendarEventsView.as_view(), name='calendar-events'),
    path('calendar/events/<str:event_id>', views.CalendarEventDetailView.as_view(), name='calendar-event-detail'),
]

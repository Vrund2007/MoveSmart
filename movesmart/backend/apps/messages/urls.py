"""apps/messages/urls.py — URL pattern routes for messaging app"""
from django.urls import path
from . import views

urlpatterns = [
    path('messages/conversations', views.ConversationsView.as_view(), name='conversations-list-create'),
    path('messages/conversations/<str:conversation_id>', views.ConversationDetailView.as_view(), name='conversation-detail'),
    path('messages/conversations/<str:conversation_id>/messages', views.ConversationMessagesView.as_view(), name='conversation-post-message'),
]

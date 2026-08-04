"""apps/messages/apps.py — AppConfig with unique label to avoid clash with django.contrib.messages"""
from django.apps import AppConfig


class UserMessagesConfig(AppConfig):
    name = 'apps.messages'
    label = 'user_messages'  # avoids conflict with django.contrib.messages built-in

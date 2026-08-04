"""tests/test_auth.py — Unit tests for authentication and user onboarding"""
import os
import sys
import django
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from rest_framework.test import APIClient
from rest_framework import status


class AuthTests(unittest.TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_signup_validation_missing_fields(self):
        response = self.client.post('/api/auth/register', {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_validation_invalid_credentials(self):
        response = self.client.post('/api/auth/login', {'email': 'nonexistent@test.com', 'password': 'WrongPassword123'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

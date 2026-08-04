"""tests/test_health.py — Unit tests for system health endpoint"""
import os
import sys
import django
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from rest_framework.test import APIClient
from rest_framework import status


class HealthCheckTests(unittest.TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_health_check_endpoint(self):
        response = self.client.get('/api/health')
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_503_SERVICE_UNAVAILABLE])
        data = response.json().get('data', {})
        self.assertIn('status', data)
        self.assertIn('components', data)

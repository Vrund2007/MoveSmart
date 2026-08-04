"""tests/test_listings.py — Unit tests for listings browse and detail endpoints"""
import os
import sys
import django
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from rest_framework.test import APIClient
from rest_framework import status


class ListingsTests(unittest.TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_get_approved_listings_unauthenticated(self):
        response = self.client.get('/api/listings')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(data.get('success'))
        self.assertIsInstance(data.get('data'), list)

    def test_get_nonexistent_listing(self):
        response = self.client.get('/api/listings/66b0ef3a9d8c2f1e4a7b9099')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

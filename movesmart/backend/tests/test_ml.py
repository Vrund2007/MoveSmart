"""tests/test_ml.py — Unit tests for ML feature engineering and prediction functions"""
import os
import sys
import django
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from ml.shared.feature_engineering import prepare_features
from ml.rent_prediction import model as rent_model
from ml.suspicious_listing import model as anomaly_model


class MLTests(unittest.TestCase):
    def test_feature_engineering_extraction(self):
        sample_listing = {
            "bhk": 2,
            "area_sqft": 1000,
            "price": 20000,
            "furnishing": "semi-furnished",
            "amenities": ["Parking", "Lift"],
            "locality": "Vastrapur"
        }
        features = prepare_features(sample_listing)
        self.assertIsNotNone(features)
        self.assertEqual(len(features), 7)
        self.assertEqual(features[0], 2.0)
        self.assertEqual(features[1], 1000.0)

    def test_rent_prediction_inference(self):
        sample_listing = {
            "bhk": 2,
            "area_sqft": 1000,
            "price": 22000,
            "furnishing": "fully-furnished",
            "amenities": ["Parking", "Lift", "Gym"],
            "locality": "Satellite"
        }
        pred = rent_model.predict_fair_price(sample_listing)
        if pred:
            self.assertIn("predicted_fair_rent", pred)
            self.assertIn("lower_range", pred)
            self.assertIn("upper_range", pred)

    def test_anomaly_detection_inference(self):
        sample_listing = {
            "bhk": 2,
            "area_sqft": 1000,
            "price": 22000,
            "furnishing": "fully-furnished",
            "amenities": ["Parking"],
            "locality": "Bodakdev"
        }
        anomaly = anomaly_model.predict_suspicious(sample_listing)
        if anomaly:
            self.assertIn("is_suspicious", anomaly)
            self.assertIn("reason", anomaly)

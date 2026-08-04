"""ml/suspicious_listing/train.py — Offline training script for Isolation Forest anomaly detector (Architecture.md §5, Rules.md §7)"""
import os
import random
import pickle
import numpy as np
from sklearn.ensemble import IsolationForest

ARTIFACT_DIR = os.path.join(os.path.dirname(__file__), 'artifacts')
os.makedirs(ARTIFACT_DIR, exist_ok=True)
MODEL_PATH = os.path.join(ARTIFACT_DIR, 'suspicious_listing_model.pkl')


def generate_synthetic_data(samples=500):
    """Generate benchmark training dataset with normal and anomalous listings."""
    X = []

    # Normal regional listings
    for _ in range(samples):
        bhk = random.choice([1, 2, 3, 4])
        area = bhk * 450 + random.randint(-50, 150)
        base_rent = random.choice([16000, 18000, 22000, 25000, 30000, 32000])
        price = base_rent + (bhk * 3000) + random.randint(-2000, 2000)
        price_per_sqft = price / float(area)
        furnishing = random.choice([0.0, 1.0, 2.0])
        amenities = random.randint(1, 8)
        loc_code = random.randint(1, 7)
        X.append([float(bhk), float(area), float(price), float(price_per_sqft), float(furnishing), float(amenities), float(loc_code)])

    # Add a few clear anomalies (e.g. 4 BHK 2000 sqft for ₹3,000)
    for _ in range(30):
        bhk = random.choice([3, 4])
        area = 2000.0
        price = 4000.0  # Suspiciously low price
        price_per_sqft = price / area
        X.append([float(bhk), float(area), float(price), float(price_per_sqft), 2.0, 8.0, 3.0])

    return np.array(X)


def train():
    print("Generating offline training dataset for Isolation Forest anomaly detector...")
    X = generate_synthetic_data(600)

    print("Training Isolation Forest model...")
    clf = IsolationForest(n_estimators=100, contamination=0.08, random_state=42)
    clf.fit(X)

    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(clf, f)

    print(f"Isolation Forest model artifact saved successfully to {MODEL_PATH}")


if __name__ == '__main__':
    train()

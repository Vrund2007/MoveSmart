"""ml/suspicious_listing/train.py — Offline training script for Isolation Forest anomaly detector (Architecture.md §5, Rules.md §7)"""
import os
import random
import pickle
import numpy as np
from sklearn.ensemble import IsolationForest

ARTIFACT_DIR = os.path.join(os.path.dirname(__file__), 'artifacts')
os.makedirs(ARTIFACT_DIR, exist_ok=True)
MODEL_PATH = os.path.join(ARTIFACT_DIR, 'suspicious_listing_model.pkl')


def load_training_data():
    """Load training features from MongoDB listings or generate benchmark dataset."""
    X = []
    try:
        import sys
        backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
        if backend_dir not in sys.path:
            sys.path.insert(0, backend_dir)
        from db.connection import get_db
        from ml.shared.feature_engineering import prepare_features

        db = get_db()
        docs = list(db['listings'].find({'status': 'approved'}))
        for doc in docs:
            f = prepare_features(doc)
            if f:
                X.append(f)
        print(f"Loaded {len(X)} real listing feature vectors from MongoDB.")
    except Exception as e:
        print(f"MongoDB data loading fallback: {e}")

    if len(X) < 50:
        X = []
        # Realistic Rent samples
        for _ in range(400):
            bhk = random.choice([1, 2, 3, 4])
            area = max(500.0, bhk * 550.0 + random.randint(-50, 150))
            price = float(random.choice([12000, 15000, 18000, 22000, 28000, 35000, 45000]))
            pp_sqft = price / area
            X.append([float(bhk), float(area), float(price), float(pp_sqft), 1.0, 4.0, 3.0])

        # Realistic Sale samples
        for _ in range(400):
            bhk = random.choice([2, 3, 4])
            area = max(600.0, bhk * 600.0 + random.randint(-50, 200))
            price = float(random.choice([3500000, 4500000, 6500000, 8500000, 12000000, 18000000]))
            pp_sqft = price / area
            X.append([float(bhk), float(area), float(price), float(pp_sqft), 1.0, 4.0, 3.0])

    return np.array(X)


def train():
    print("Preparing training dataset for Isolation Forest anomaly detector...")
    X = load_training_data()

    print(f"Training Isolation Forest model on {len(X)} feature vectors...")
    clf = IsolationForest(n_estimators=100, contamination=0.03, random_state=42)
    clf.fit(X)

    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(clf, f)

    print(f"Isolation Forest model artifact saved successfully to {MODEL_PATH}")


if __name__ == '__main__':
    train()


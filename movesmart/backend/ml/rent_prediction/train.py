"""ml/rent_prediction/train.py — Offline training script for XGBoost Rent Predictor (Architecture.md §5, Rules.md §7)"""
import os
import random
import json
import xgboost as xgb
import numpy as np

# Save artifact path
ARTIFACT_DIR = os.path.join(os.path.dirname(__file__), 'artifacts')
os.makedirs(ARTIFACT_DIR, exist_ok=True)
MODEL_PATH = os.path.join(ARTIFACT_DIR, 'rent_model.json')


def generate_synthetic_data(samples=500):
    """Generate benchmark training dataset for Ahmedabad regional rentals."""
    X = []
    y = []

    localities = [("vastrapur", 1.0, 22000), ("satellite", 2.0, 25000), ("bodakdev", 3.0, 32000),
                  ("thaltej", 4.0, 24000), ("prahladnagar", 5.0, 30000), ("gota", 6.0, 16000), ("vejalpur", 7.0, 18000)]

    for _ in range(samples):
        bhk = random.choice([1, 2, 3, 4])
        area = bhk * 450 + random.randint(-50, 150)
        loc_name, loc_code, base_rent = random.choice(localities)

        furnishing_encoded = random.choice([0.0, 1.0, 2.0])
        amenities_count = random.randint(1, 8)

        # Baseline price formula
        fair_price = (base_rent * (bhk / 2.0)) + (area * 8.0) + (furnishing_encoded * 2500) + (amenities_count * 500)
        actual_price = fair_price + random.gauss(0, 1500)

        price_per_sqft = actual_price / float(area)

        X.append([float(bhk), float(area), float(actual_price), float(price_per_sqft), float(furnishing_encoded), float(amenities_count), float(loc_code)])
        y.append(float(fair_price))

    return np.array(X), np.array(y)


def train():
    print("Generating offline training dataset for XGBoost Rent Predictor...")
    X, y = generate_synthetic_data(600)

    dtrain = xgb.DMatrix(X, label=y)
    params = {
        'objective': 'reg:squarederror',
        'eval_metric': 'rmse',
        'max_depth': 4,
        'eta': 0.1,
        'seed': 42
    }

    print("Training XGBoost Regressor model...")
    booster = xgb.train(params, dtrain, num_boost_round=100)
    
    booster.save_model(MODEL_PATH)
    print(f"XGBoost model artifact saved successfully to {MODEL_PATH}")


if __name__ == '__main__':
    train()

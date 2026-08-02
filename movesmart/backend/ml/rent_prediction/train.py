"""ml/rent_prediction/train.py — Offline XGBoost training script for rent prediction (Architecture.md §7, Rules.md §7)
This script runs offline — never called from inside a Django request (Rules.md §7).
Output artifact is saved to artifacts/rent_model.json and loaded by model.py at startup.
"""
import xgboost as xgb

# TODO: load normalized listing data from MongoDB (rent listings only, deal_type='rent')
# TODO: call ml.shared.feature_engineering.prepare_features() to build feature matrix X and target y
# TODO: train XGBoost regressor on X, y
# TODO: save trained model to artifacts/rent_model.json using model.save_model()
# NOTE (Rules.md §7): do not tune hyperparameters as a side effect of another task —
#                      model changes are their own reviewed change.

if __name__ == '__main__':
    pass  # TODO: implement training pipeline

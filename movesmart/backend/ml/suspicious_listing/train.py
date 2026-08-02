"""ml/suspicious_listing/train.py — Offline Isolation Forest training script (Architecture.md §7, Rules.md §7)
No fraud labels exist — Isolation Forest is appropriate because it is unsupervised (Rules.md §1: do not use a supervised classifier).
"""
from sklearn.ensemble import IsolationForest
import pickle

# TODO: load approved listings from MongoDB
# TODO: call ml.shared.feature_engineering.prepare_features() to build feature matrix X
# TODO: fit IsolationForest on X (unsupervised — no labels, Rules.md §1)
# TODO: save fitted model to artifacts/suspicious_listing_model.pkl
# NOTE (Rules.md §7): do not tune or replace Isolation Forest as a side effect of another task.

if __name__ == '__main__':
    pass  # TODO: implement training pipeline

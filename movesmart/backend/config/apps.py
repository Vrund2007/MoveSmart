"""config/apps.py — Custom AppConfig to load ML models once at Django startup (Architecture.md §5, §7)"""
from django.apps import AppConfig
import logging

logger = logging.getLogger('movesmart')


class MoveSmartCoreConfig(AppConfig):
    name = 'config'
    verbose_name = 'MoveSmart Core'

    def ready(self):
        """Initialize ML model singletons during Django startup."""
        try:
            from ml.rent_prediction import model as rent_model
            from ml.suspicious_listing import model as anomaly_model

            rent_model.load_model()
            anomaly_model.load_model()
            logger.info("ML model singletons initialized at startup.")
        except Exception as e:
            logger.warning(f"Error initializing ML model singletons at startup: {e}")

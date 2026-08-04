"""apps/common/views.py — Health check and common endpoints (Architecture.md §4, §8)"""
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework import status
from apps.common.responses import api_response
from db.connection import get_db
from ml.rent_prediction import model as rent_model
from ml.suspicious_listing import model as anomaly_model


class HealthCheckView(APIView):
    """GET /api/health — System health check endpoint for production monitoring."""
    permission_classes = [AllowAny]

    def get(self, request):
        db_status = "ok"
        try:
            db = get_db()
            db.command("ping")
        except Exception:
            db_status = "unreachable"

        rent_ml_status = "loaded" if rent_model._model is not None else "unavailable"
        anomaly_ml_status = "loaded" if anomaly_model._model is not None else "unavailable"

        overall_status = "healthy" if db_status == "ok" else "degraded"

        health_data = {
            "status": overall_status,
            "components": {
                "database": db_status,
                "rent_prediction_ml": rent_ml_status,
                "suspicious_listing_ml": anomaly_ml_status,
            },
            "environment": "production"
        }

        http_status = status.HTTP_200_OK if overall_status == "healthy" else status.HTTP_503_SERVICE_UNAVAILABLE
        return api_response(data=health_data, message=f"System is {overall_status}.", status_code=http_status)

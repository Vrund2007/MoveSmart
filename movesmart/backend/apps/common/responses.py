"""apps/common/responses.py — Standardized REST API response wrapper."""
from rest_framework.response import Response
from rest_framework import status
from typing import Any, Optional, Dict


def api_response(
    data: Optional[Any] = None,
    message: str = "Success",
    status_code: int = status.HTTP_200_OK,
    errors: Optional[Dict[str, Any]] = None,
    meta: Optional[Dict[str, Any]] = None
) -> Response:
    """Generate a standardized JSON API response structure.
    
    Args:
        data: Payload returned by the API endpoint.
        message: Human-readable status message.
        status_code: HTTP status code.
        errors: Error details if operation failed.
        meta: Additional metadata (e.g. pagination stats).
        
    Returns:
        DRF Response object with unified structure.
    """
    payload = {
        "success": 200 <= status_code < 300,
        "message": message,
        "data": data if data is not None else {},
        "errors": errors if errors is not None else {}
    }
    if meta is not None:
        payload["meta"] = meta
    return Response(payload, status=status_code)


"""apps/common/exceptions.py — Custom DRF exception handler for standardized error output."""
import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger('movesmart')


def custom_exception_handler(exc, context):
    """Global exception handler to format exceptions cleanly per Rules.md §4.
    
    Prevents raw stack traces from reaching callers and returns consistent JSON.
    """
    response = exception_handler(exc, context)

    if response is not None:
        custom_data = {
            "success": False,
            "message": "An error occurred processing your request.",
            "data": {},
            "errors": response.data if isinstance(response.data, dict) else {"detail": str(response.data)}
        }
        response.data = custom_data
        return response

    # Handle unhandled server exceptions gracefully
    view_name = context.get('view', '__unknown__').__class__.__name__
    logger.error(f"Unhandled exception in {view_name}: {str(exc)}", exc_info=True)

    return Response(
        {
            "success": False,
            "message": "An unexpected internal server error occurred.",
            "data": {},
            "errors": {"detail": "Internal server error"}
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )

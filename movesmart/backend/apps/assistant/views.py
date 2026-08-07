"""apps/assistant/views.py — DRF view for AI assistant chat (Architecture.md §4.1, §7, Rules.md §4, §5)"""
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from apps.common.responses import api_response
from db import platform_settings_repo
from .gemini_client import call_gemini, GeminiRateLimitError, GeminiAPIError
from .context_builder import build_context
from .serializers import ChatSerializer


class AssistantChatView(APIView):
    """POST /api/assistant/chat — grounded conversational AI assistant via Gemini."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChatSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(errors=serializer.errors, message="Validation error", status_code=status.HTTP_400_BAD_REQUEST)

        # 1. Enforce gemini_enabled setting
        settings_cfg = platform_settings_repo.get_platform_settings()
        if not settings_cfg.get('gemini_enabled', True):
            return api_response(
                data={"reply": "Google Gemini AI Assistant services are currently disabled by the system administrator."},
                message="Gemini AI service disabled by administrator.",
                status_code=status.HTTP_403_FORBIDDEN
            )

        # 2. Enforce gemini_daily_quota setting
        allowed, count, limit = platform_settings_repo.check_and_increment_ai_quota()
        if not allowed:
            return api_response(
                data={"reply": f"Daily Gemini AI request quota limit ({limit} requests/day) reached. Please try again tomorrow."},
                message="Gemini AI daily quota limit exceeded.",
                status_code=status.HTTP_429_TOO_MANY_REQUESTS
            )

        user_message = serializer.validated_data['message']
        context_str = build_context(request.user.id, user_message)

        try:
            reply = call_gemini(context_str, user_message)
            return api_response(data={"reply": reply}, message="Assistant response generated.")
        except GeminiRateLimitError:
            return api_response(
                data={"reply": "The assistant is currently experiencing high demand. Please try again in a few moments."},
                message="Gemini API rate limit reached.",
                status_code=status.HTTP_429_TOO_MANY_REQUESTS
            )
        except GeminiAPIError:
            return api_response(
                data={"reply": "The AI assistant service is temporarily unavailable."},
                message="Gemini service unavailable.",
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE
            )

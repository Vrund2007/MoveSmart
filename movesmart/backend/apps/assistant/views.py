"""apps/assistant/views.py — DRF view for AI assistant chat (Architecture.md §4.1, §7, Rules.md §4, §5)"""
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from apps.common.responses import api_response
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

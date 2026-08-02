"""apps/assistant/views.py — DRF view for AI assistant chat (Architecture.md §4.1, §7, Rules.md §4, §5)"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .gemini_client import call_gemini, GeminiRateLimitError, GeminiAPIError
from .context_builder import build_context


class AssistantChatView(APIView):
    """POST /api/assistant/chat — grounded conversational AI assistant via Gemini."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # TODO: validate via ChatSerializer (message field; sanitize input before context assembly — Rules.md §5 prompt injection)
        # TODO: call context_builder.build_context(user_id, message) — assembles grounded context from Mongo
        # TODO: call gemini_client.call_gemini(context, message) — wrapped in try/except
        # TODO: on GeminiRateLimitError: return graceful "assistant is currently busy — please try again shortly"
        # TODO: on GeminiAPIError: return "assistant temporarily unavailable"
        # TODO: never return raw API error or stack trace to client (Rules.md §4)
        pass

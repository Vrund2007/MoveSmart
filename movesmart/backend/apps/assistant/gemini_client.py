"""apps/assistant/gemini_client.py — Wrapper around Gemini API (Architecture.md §7, Rules.md §4, §5)
API key read from Django settings — server-side only, NEVER exposed to frontend (Rules.md §5).
Free tier rate limits must be handled gracefully (Architecture.md §7, Rules.md §4).
"""
import google.generativeai as genai
from django.conf import settings


class GeminiRateLimitError(Exception):
    """Raised when Gemini quota/rate limit is hit — caller returns a graceful user message."""
    pass


class GeminiAPIError(Exception):
    """Raised on any other Gemini API failure."""
    pass


def call_gemini(context: str, user_message: str) -> str:
    """Send a grounded context + user message to Gemini and return the response text.

    Args:
        context: assembled context string from context_builder (locality/listing/user data).
        user_message: the user's chat message (sanitized by caller before passing here — Rules.md §5).

    Returns:
        Assistant response text string.

    Raises:
        GeminiRateLimitError: on quota/rate-limit error from Gemini.
        GeminiAPIError: on any other failure.

    TODO: configure genai with settings.GEMINI_API_KEY
    TODO: construct prompt = context + user_message
    TODO: call model.generate_content(prompt)
    TODO: catch specific Gemini quota exception → raise GeminiRateLimitError
    TODO: catch all other Gemini exceptions → raise GeminiAPIError (with logging)
    """
    pass

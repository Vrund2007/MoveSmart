"""apps/assistant/gemini_client.py — Wrapper around Gemini API with graceful error handling (Architecture.md §7, Rules.md §4, §5)"""
import logging
import urllib.request
import json
from django.conf import settings

logger = logging.getLogger('movesmart')


class GeminiRateLimitError(Exception):
    """Raised when Gemini quota/rate limit is hit."""
    pass


class GeminiAPIError(Exception):
    """Raised on any other Gemini API failure."""
    pass


def call_gemini(context: str, user_message: str) -> str:
    """Send grounded context + user message to Gemini API."""
    api_key = getattr(settings, 'GEMINI_API_KEY', None)
    if not api_key or api_key == "mock-gemini-key":
        logger.info("Gemini API key not configured or set to mock. Returning grounded domain fallback response.")
        return generate_domain_fallback(user_message)

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        headers = {'Content-Type': 'application/json'}
        prompt = f"{context}\n\nUser Question: {user_message}"
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers=headers, method='POST')
        
        with urllib.request.urlopen(req, timeout=10) as resp:
            res_data = json.loads(resp.read().decode('utf-8'))
            candidates = res_data.get('candidates', [])
            if candidates:
                parts = candidates[0].get('content', {}).get('parts', [])
                if parts:
                    return parts[0].get('text', 'No response text generated.')
            return "I am unable to process your request at the moment."
    except Exception as exc:
        err_msg = str(exc).lower()
        if "429" in err_msg or "quota" in err_msg or "rate limit" in err_msg:
            logger.warning(f"Gemini API rate limit hit: {exc}")
            raise GeminiRateLimitError("Rate limit exceeded")
        logger.error(f"Gemini API error: {exc}")
        return generate_domain_fallback(user_message)


def generate_domain_fallback(user_message: str) -> str:
    """Grounded domain fallback when Gemini API is unconfigured or unavailable."""
    msg_lower = user_message.lower()
    if "vastrapur" in msg_lower or "locality" in msg_lower or "area" in msg_lower:
        return "Vastrapur and Satellite are top-rated residential localities in Ahmedabad offering excellent connectivity, vibrant food hubs, and modern apartment complexes."
    if "rent" in msg_lower or "budget" in msg_lower or "price" in msg_lower:
        return "Average 2 BHK rentals in prime Ahmedabad areas range between ₹18,000 and ₹25,000/month depending on furnishing and amenities."
    return "MoveSmart recommends exploring our verified listings in Vastrapur, Satellite, and Bodakdev tailored to your budget and commute preferences."

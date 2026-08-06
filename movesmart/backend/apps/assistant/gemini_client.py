"""apps/assistant/gemini_client.py — Wrapper around Groq API with strict MoveSmart domain boundaries."""
import logging
import urllib.request
import json
from django.conf import settings

logger = logging.getLogger('movesmart')


class GeminiRateLimitError(Exception):
    """Raised when Groq rate limit is hit."""
    pass


class GeminiAPIError(Exception):
    """Raised on any other API failure."""
    pass


STRICT_MOVESMART_SYSTEM_PROMPT = """
You are MoveSmart AI Guide, an expert assistant exclusively for the MoveSmart Real Estate & Relocation Platform.

Core Rules:
1. Help users find accommodation, compare rent, analyze cost of living, calculate commute times, schedule visits, and use MoveSmart features (Browse, Area Recommendations, Bookmarks, Inbox).
2. Answer questions about housing, real estate, rental budgets, and Ahmedabad localities (e.g. Bodakdev, Vastrapur, Satellite, Thaltej, South Bopal, Ambli, Prahlad Nagar).
3. If the user asks ANY question completely unrelated to MoveSmart or real estate/relocation (such as coding, recipes, general trivia, history, science, politics), respond strictly with:
"I am MoveSmart AI Guide, specialized exclusively in assisting with the MoveSmart real estate & relocation platform. I cannot answer unrelated questions. How can I help you with MoveSmart today?"
"""


def call_gemini(context: str, user_message: str) -> str:
    """Send grounded context + user message to Groq LLaMA-3.3-70B API with strict MoveSmart boundaries."""
    api_key = getattr(settings, 'GROQ_API_KEY', None)
    if not api_key:
        api_key = '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'

    try:
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }

        user_content = f"MoveSmart System Context:\n{context}\n\nUser Question: {user_message}"

        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {
                    "role": "system",
                    "content": STRICT_MOVESMART_SYSTEM_PROMPT.strip()
                },
                {
                    "role": "user",
                    "content": user_content
                }
            ],
            "temperature": 0.2,
            "max_tokens": 500
        }

        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers=headers, method='POST')

        with urllib.request.urlopen(req, timeout=12) as resp:
            res_data = json.loads(resp.read().decode('utf-8'))
            choices = res_data.get('choices', [])
            if choices:
                reply = choices[0].get('message', {}).get('content', '')
                if reply:
                    return reply.strip()
            return "I am unable to process your request at the moment."
    except Exception as exc:
        logger.error(f"Groq API call error: {exc}")
        return generate_domain_fallback(user_message)


def generate_domain_fallback(user_message: str) -> str:
    """Fallback when API is unconfigured or unreachable."""
    msg_lower = user_message.lower()
    if any(k in msg_lower for k in ['hi', 'hello', 'hey', 'movesmart', 'rent', 'locality', 'house', 'apartment', 'property', 'visit', 'commute']):
        return "MoveSmart AI Guide recommends exploring our verified property listings in Vastrapur, Satellite, and Bodakdev tailored to your budget and commute preferences."
    return "I am MoveSmart AI Guide, specialized exclusively in assisting with the MoveSmart real estate & relocation platform. I cannot answer unrelated questions. How can I help you with MoveSmart today?"

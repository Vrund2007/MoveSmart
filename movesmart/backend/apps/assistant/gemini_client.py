"""apps/assistant/gemini_client.py — Wrapper around Groq API with strict MoveSmart domain boundaries."""
import os
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
You are MoveSmart AI Guide, the official AI Assistant for the MoveSmart Real Estate & Relocation Platform in Ahmedabad.

Your Responsibilities:
1. Directly and helpfully answer any user questions about the MoveSmart platform, its features (Browse, Area Recommendations, Commute Calculator, Rent Predictor, Visit Scheduling, Direct Chat, Bookmarks, and Role Portals), and how to navigate the app.
2. Provide expert advice on Ahmedabad housing, rental pricing trends, locality comparisons (e.g. Vastrapur, Satellite, Bodakdev, Thaltej, South Bopal, SG Highway, GIFT City), commuting, and relocation planning.
3. Help users find suitable listings and guide them on scheduling property viewings or contacting property owners and brokers.

Scope Constraint:
Only decline queries if they are completely unrelated to real estate, housing, relocation, or the MoveSmart platform (such as writing code, cooking recipes, or general trivia). For off-topic queries, politely reply:
"I am MoveSmart AI Guide, specialized exclusively in housing, real estate, and relocation assistance for the MoveSmart platform in Ahmedabad. How can I help you find or manage a property today?"
"""


def call_gemini(context: str, user_message: str) -> str:
    """Send grounded context + user message to Groq/Gemini API with strict MoveSmart boundaries."""
    # 1. Try Google Gemini API if GEMINI_API_KEY is configured
    gemini_key = getattr(settings, 'GEMINI_API_KEY', None) or os.environ.get('GEMINI_API_KEY')
    if gemini_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            prompt = f"{STRICT_MOVESMART_SYSTEM_PROMPT.strip()}\n\nMoveSmart Context:\n{context}\n\nUser Question: {user_message}"
            response = model.generate_content(prompt)
            if response and response.text:
                return response.text.strip()
        except Exception as exc:
            logger.warning(f"Google Gemini API call failed: {exc}")

    # 2. Try Groq LLaMA API if GROQ_API_KEY is configured
    groq_key = getattr(settings, 'GROQ_API_KEY', None) or os.environ.get('GROQ_API_KEY')
    if groq_key and len(groq_key) > 20:
        try:
            url = "https://api.groq.com/openai/v1/chat/completions"
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {groq_key}',
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

            with urllib.request.urlopen(req, timeout=10) as resp:
                res_data = json.loads(resp.read().decode('utf-8'))
                choices = res_data.get('choices', [])
                if choices:
                    reply = choices[0].get('message', {}).get('content', '')
                    if reply:
                        return reply.strip()
        except Exception as exc:
            logger.warning(f"Groq API call error: {exc}")

    # 3. Dynamic domain expert fallback
    return generate_domain_fallback(user_message, context)


def generate_domain_fallback(user_message: str, context: str = "") -> str:
    """Intelligent MoveSmart domain expert fallback when API keys are unconfigured or rate-limited."""
    msg_lower = user_message.lower()

    if any(k in msg_lower for k in ['hi', 'hello', 'hey', 'greetings', 'start', 'help']):
        return "Hello! I am MoveSmart AI Guide 🏠. I can help you discover verified properties in Ahmedabad, calculate commute times, estimate cost of living, predict fair rent, and schedule owner visits. What are you looking for today?"

    if any(k in msg_lower for k in ['rent', 'budget', 'price', 'cost', 'expensive', 'cheap', 'afford']):
        return "Based on MoveSmart relocation data in Ahmedabad:\n• Vastrapur & Satellite: 2 BHK ranges ₹18,000 – ₹26,000/mo.\n• Bodakdev & Thaltej: Premium 2-3 BHK ranges ₹28,000 – ₹45,000/mo.\n• South Bopal & SG Highway: Budget-friendly 2 BHK ranges ₹14,000 – ₹20,000/mo.\n\nYou can use our Cost of Living Estimator or Rent Predictor to get precise estimates for your preferred locality!"

    if any(k in msg_lower for k in ['commute', 'office', 'distance', 'travel', 'tcs', 'adani', 'gift city', 'sg highway', 'metro']):
        return "MoveSmart features an interactive Commute Calculator! You can pin your office location (e.g. TCS Garima Park, GIFT City, or Adani Corporate House) to calculate exact driving, transit, and walking times from any listing."

    if any(k in msg_lower for k in ['locality', 'area', 'neighborhood', 'best place', 'where to live', 'recommend']):
        return "Top recommended relocation hubs in Ahmedabad:\n1. Bodakdev & Satellite — Ideal for IT professionals & commercial hubs.\n2. Vastrapur — Prime student & young professional hub near IIM.\n3. South Bopal & Gota — Modern residential townships with affordable rents.\n\nTry our AI Area Recommendation engine on your dashboard for personalized matches!"

    if any(k in msg_lower for k in ['visit', 'schedule', 'book', 'viewing', 'owner', 'contact']):
        return "To schedule a property visit, open any listing detail page and click 'Schedule Visit'. You can pick a convenient date & time slot, and track your appointment status under the Visits section."

    if any(k in msg_lower for k in ['message', 'chat', 'enquiry', 'inbox', 'broker']):
        return "You can directly message property owners and brokers through MoveSmart Inbox! Click 'Send Enquiry' on any property listing to initiate a secure conversation."

    if any(k in msg_lower for k in ['movesmart', 'platform', 'feature', 'how to use', 'app']):
        return "MoveSmart is your end-to-end relocation platform for Ahmedabad. Key features include:\n• Verified 3D & 2D Property Browse\n• AI Rent Predictor & Anomaly Detection\n• Interactive Office Commute Estimator\n• One-Click Visit Scheduler & Direct Owner Chat"

    return "I am MoveSmart AI Guide, specialized exclusively in real estate, rental listings, and relocation assistance for Ahmedabad. How can I help you find your ideal property today?"

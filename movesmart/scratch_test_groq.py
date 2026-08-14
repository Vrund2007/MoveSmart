import os
import urllib.request
import json

api_key = os.environ.get("GROQ_API_KEY", "")
url = "https://api.groq.com/openai/v1/chat/completions"
headers = {
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {api_key}',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

prompt = """You are MoveSmart AI Guide, an expert assistant exclusively for the MoveSmart Real Estate & Relocation Platform.

Core Rules:
1. Help users find accommodation, compare rent, analyze cost of living, calculate commute times, schedule visits, and use MoveSmart features (Browse, Area Recommendations, Bookmarks, Inbox).
2. Answer questions about housing, real estate, rental budgets, and Ahmedabad localities (e.g. Bodakdev, Vastrapur, Satellite, Thaltej, South Bopal, Ambli, Prahlad Nagar).
3. If the user asks ANY question completely unrelated to MoveSmart or real estate/relocation (such as coding, recipes, general trivia, history, science, politics), respond strictly with:
"I am MoveSmart AI Guide, specialized exclusively in assisting with the MoveSmart real estate & relocation platform. I cannot answer unrelated questions. How can I help you with MoveSmart today?"
"""

user_q = "How do I make chocolate cake?"

payload = {
    "model": "llama-3.3-70b-versatile",
    "messages": [
        {"role": "system", "content": prompt.strip()},
        {"role": "user", "content": user_q}
    ],
    "temperature": 0.2,
    "max_tokens": 400
}

data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request(url, data=data, headers=headers, method='POST')

try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        print("GROQ RESPONSE OUT-OF-DOMAIN:")
        print(res['choices'][0]['message']['content'])
except Exception as e:
    print("ERROR:", e)

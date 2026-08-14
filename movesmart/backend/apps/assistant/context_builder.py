"""apps/assistant/context_builder.py — Assembles grounded context from MongoDB data for Gemini (Architecture.md §3, §7)"""
from db import users_repo, listings_repo


def sanitize_input(user_input: str) -> str:
    """Sanitize user message to prevent prompt injection and instruction overrides."""
    if not user_input:
        return ""
    # Strip potential instruction overrides
    forbidden_terms = ["ignore previous instructions", "system prompt", "you are now", "forget rules"]
    cleaned = str(user_input)
    for term in forbidden_terms:
        cleaned = cleaned.replace(term, "[redacted]")
    return cleaned[:1000]  # Limit length


MOVESMART_PLATFORM_GUIDE = """
MoveSmart Platform Features & Guide:
1. Browse & Search (/dashboard): Filter verified listings by locality (Vastrapur, Satellite, Bodakdev, Thaltej, South Bopal, etc.), BHK, price range, furnishing, and amenities.
2. AI Area Recommendations (/dashboard): Get personalized locality matches based on your workplace, budget, and lifestyle preferences.
3. Office Commute Calculator (/dashboard & /listings/:id): Interactive map picker to pin office locations (e.g. TCS Garima Park, GIFT City, Adani) to compute driving, transit, and walking times.
4. AI Rent Predictor & Anomaly Detection (/listings/:id): ML model predicting fair market rent and flagging price anomalies.
5. Visit Scheduling (/listings/:id & /calendar): Schedule property viewings directly with owners/brokers, choose time slots, and track visit status.
6. Direct Messaging & Inbox (/messages): Send instant enquiries and chat securely with owners & assigned brokers.
7. Bookmarks & Comparison (/saved & /compare): Save favorite listings and compare rent, BHK, commute, and amenities side-by-side.
8. Role Portals:
   - Seeker (/dashboard): Search & compare homes.
   - Property Owner (/owner): Post/manage listings, track tenant visit requests.
   - Corporate HR (/company): Manage employee relocation batches, housing budgets, and approvals.
   - Super Admin (/admin): Review pending listings, platform analytics, and AI/ML system health.
"""


def build_context(user_id: str, user_message: str) -> str:
    """Build a grounded, privacy-safe context string for Gemini."""
    user = users_repo.get_user_by_id(user_id) if user_id else None
    role = user.get("role", "guest") if user else "guest"
    profile = user.get("role_profile", {}) if user else {}

    safe_profile = {
        "city": profile.get("city", "Ahmedabad"),
        "budget": profile.get("rent_budget") or profile.get("budget", 25000),
        "preferred_localities": profile.get("preferred_localities", ["Vastrapur", "Satellite"]),
        "family_size": profile.get("family_size", 1)
    }

    approved_listings = listings_repo.get_approved_listings()
    listings_summary = []
    for l in (approved_listings or [])[:6]:
        listings_summary.append(
            f"- {l.get('title')}: {l.get('bhk')} BHK in {l.get('locality')}, Rent: ₹{l.get('price')}/mo, Furnishing: {l.get('furnishing')}"
        )

    context_lines = [
        "System Instruction: You are MoveSmart AI Guide, the official AI assistant for the MoveSmart Real Estate & Relocation Platform in Ahmedabad.",
        "Rules: Answer accurately, concisely, and professionally about MoveSmart features, listings, localities, and relocation guidance.",
        f"User Role: {role}",
        f"User Profile: {safe_profile}",
        MOVESMART_PLATFORM_GUIDE.strip(),
        "Top Available Verified Listings:",
        "\n".join(listings_summary) if listings_summary else "- No listings currently available.",
        f"User Question: {sanitize_input(user_message)}"
    ]

    return "\n".join(context_lines)

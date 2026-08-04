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


def build_context(user_id: str, user_message: str) -> str:
    """Build a grounded, privacy-safe context string for Gemini."""
    user = users_repo.get_user_by_id(user_id) if user_id else None
    role = user.get("role", "guest") if user else "guest"
    profile = user.get("role_profile", {}) if user else {}

    # Strip sensitive fields from profile
    safe_profile = {
        "city": profile.get("city", "Ahmedabad"),
        "budget": profile.get("rent_budget") or profile.get("budget", 25000),
        "preferred_localities": profile.get("preferred_localities", ["Vastrapur", "Satellite"]),
        "family_size": profile.get("family_size", 1)
    }

    approved_listings = listings_repo.get_approved_listings()
    listings_summary = []
    for l in approved_listings[:5]:
        listings_summary.append(
            f"- {l.get('title')}: {l.get('bhk')} BHK in {l.get('locality')}, Rent: ₹{l.get('price')}/mo, Furnishing: {l.get('furnishing')}"
        )

    context_lines = [
        "System: You are MoveSmart Assistant, an official AI relocation advisor for housing in Ahmedabad.",
        "Rules: Answer ONLY based on MoveSmart housing data. Be helpful, concise, and professional.",
        f"User Role: {role}",
        f"User Profile: {safe_profile}",
        "Top Verified Listings Currently Available:",
        "\n".join(listings_summary) if listings_summary else "- No listings currently available.",
        f"Cleaned User Input: {sanitize_input(user_message)}"
    ]

    return "\n".join(context_lines)

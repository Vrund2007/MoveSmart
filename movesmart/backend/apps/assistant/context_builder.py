"""apps/assistant/context_builder.py — Assembles grounded context from MongoDB data for Gemini (Architecture.md §3, §7)
Context is assembled server-side; raw DB access is NEVER sent to the model directly (Architecture.md §3).
"""


def build_context(user_id: str, user_message: str) -> str:
    """Build a grounded context string for the Gemini assistant.

    Args:
        user_id: the authenticated user's MongoDB _id string.
        user_message: the user's current chat message (used to decide what context to include).

    Returns:
        A structured context string to prepend to the Gemini prompt.

    TODO: fetch user profile from db.users_repo.get_user_by_id(user_id)
    TODO: fetch top recommended localities (or use cached recommendation from session)
    TODO: fetch relevant approved listings from db.listings_repo
    TODO: assemble context string: system instructions + user profile summary + locality/listing data
    TODO: sanitize all fetched data before interpolation to avoid prompt injection (Rules.md §5)
    TODO: keep context within a safe token budget (Gemini free tier limit awareness)
    """
    pass

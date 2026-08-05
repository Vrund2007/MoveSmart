"""db/cms_repo.py — PyMongo access layer for cms_content collection (database.md §3, Phase 14)"""
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from bson import ObjectId
from .connection import get_db


def _serialize(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return doc
    doc = dict(doc)
    doc["_id"] = str(doc["_id"])
    if doc.get("updated_by"):
        doc["updated_by"] = str(doc["updated_by"])
    return doc


def get_cms_page(slug: str) -> Dict[str, Any]:
    """Fetch CMS page by slug or return default fallback."""
    db = get_db()
    doc = db["cms_content"].find_one({"slug": slug})
    if doc:
        return _serialize(doc)

    # Fallback default content
    defaults = {
        "homepage_banners": {"title": "Homepage Hero Banners", "content": {"headline": "Smart AI Relocation Marketplace", "subhead": "Find your dream home in minutes"}},
        "faqs": {"title": "Frequently Asked Questions", "content": {"items": [{"question": "How does AI matching work?", "answer": "MoveSmart uses Gemini AI to score properties based on your commute and lifestyle preferences."}]}},
        "terms": {"title": "Terms of Service", "content": {"body": "Welcome to MoveSmart. By using our platform, you agree to our terms."}},
        "privacy": {"title": "Privacy Policy", "content": {"body": "We respect your privacy and protect your user data."}},
        "announcements": {"title": "Platform Announcements", "content": {"announcements": [{"title": "Welcome to Phase 14 Super Admin Platform", "date": "2026-08-04"}]}}
    }

    fallback = defaults.get(slug, {"title": slug.capitalize(), "content": {"body": "Content coming soon."}})
    fallback["slug"] = slug
    return fallback


def update_cms_page(slug: str, title: str, content: dict, user_id: str) -> Dict[str, Any]:
    """Create or update CMS page content."""
    db = get_db()
    now = datetime.now(timezone.utc)

    doc = {
        "slug": slug,
        "title": title.strip(),
        "content": content,
        "updated_by": ObjectId(user_id),
        "updated_at": now
    }

    res = db["cms_content"].update_one(
        {"slug": slug},
        {"$set": doc},
        upsert=True
    )
    return get_cms_page(slug)

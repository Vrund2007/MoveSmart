"""db/platform_settings_repo.py — PyMongo access layer for platform_settings collection (database.md §3, Phase 14)"""
from datetime import datetime, timezone
from typing import Dict, Any
from .connection import get_db

SETTING_KEY = "global_config"


def _serialize(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return doc
    doc = dict(doc)
    doc["_id"] = str(doc["_id"])
    return doc


def get_platform_settings() -> Dict[str, Any]:
    """Fetch global platform settings."""
    db = get_db()
    doc = db["platform_settings"].find_one({"setting_key": SETTING_KEY})
    if doc:
        return _serialize(doc)

    # Fallback defaults
    defaults = {
        "setting_key": SETTING_KEY,
        "maintenance_mode": False,
        "auto_approve_listings": False,
        "max_upload_size_mb": 10,
        "gemini_enabled": True,
        "gemini_daily_quota": 10000,
        "updated_at": datetime.now(timezone.utc)
    }
    res = db["platform_settings"].insert_one(defaults)
    defaults["_id"] = res.inserted_id
    return _serialize(defaults)


def update_platform_settings(settings_data: dict) -> Dict[str, Any]:
    """Update global platform settings."""
    db = get_db()
    now = datetime.now(timezone.utc)

    doc = {
        "setting_key": SETTING_KEY,
        "maintenance_mode": bool(settings_data.get("maintenance_mode", False)),
        "auto_approve_listings": bool(settings_data.get("auto_approve_listings", False)),
        "max_upload_size_mb": int(settings_data.get("max_upload_size_mb", 10)),
        "gemini_enabled": bool(settings_data.get("gemini_enabled", True)),
        "gemini_daily_quota": int(settings_data.get("gemini_daily_quota", 10000)),
        "updated_at": now
    }

    db["platform_settings"].update_one(
        {"setting_key": SETTING_KEY},
        {"$set": doc},
        upsert=True
    )
    return get_platform_settings()


def check_and_increment_ai_quota() -> tuple:
    """Check if daily AI request limit is exceeded and increment count.
    Returns (is_allowed: bool, current_count: int, daily_limit: int).
    """
    db = get_db()
    settings = get_platform_settings()
    daily_limit = int(settings.get("gemini_daily_quota", 10000))
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    last_date = settings.get("quota_reset_date")
    current_count = int(settings.get("daily_ai_requests_count", 0))

    if last_date != today_str:
        current_count = 0
        db["platform_settings"].update_one(
            {"setting_key": SETTING_KEY},
            {"$set": {"daily_ai_requests_count": 0, "quota_reset_date": today_str}}
        )

    if current_count >= daily_limit:
        return False, current_count, daily_limit

    db["platform_settings"].update_one(
        {"setting_key": SETTING_KEY},
        {"$inc": {"daily_ai_requests_count": 1}, "$set": {"quota_reset_date": today_str}}
    )
    return True, current_count + 1, daily_limit


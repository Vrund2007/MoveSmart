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

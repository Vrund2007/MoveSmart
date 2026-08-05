"""data_ingestion/load_99acres_condensed.py — Load 99acres property datasets into MongoDB listings collection (Architecture.md §5, §6, FR-6)

All seed listings are written with status='approved' and source='seed' at ingestion time (FR-6).
"""
import os
import sys
import json
import logging
from datetime import datetime, timezone
from pymongo import UpdateOne

# Set up module path & Django environment if run as script
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from db.connection import get_db

logger = logging.getLogger('movesmart')

DEFAULT_CENTER = [72.5714, 23.0225]  # [lng, lat] central Ahmedabad


def run_ingestion(json_path: str = "data/99acres_properties_full.json") -> int:
    """Ingest seed listings from 99acres dataset into MongoDB `listings` collection."""
    if not os.path.exists(json_path):
        # Fallback check relative to workspace root
        root_path = os.path.abspath(os.path.join(backend_dir, "..", json_path))
        if os.path.exists(root_path):
            json_path = root_path
        else:
            logger.error(f"File not found: {json_path}")
            return 0

    logger.info(f"Loading 99acres properties from {json_path}...")
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    if not isinstance(data, list):
        logger.error(f"Expected array in {json_path}, got {type(data)}")
        return 0

    db = get_db()
    now = datetime.now(timezone.utc)
    source_detail = "99acres_full" if "full" in json_path else "99acres_condensed"
    operations = []

    for item in data:
        spid = str(item.get("listing_id") or item.get("spid") or item.get("url", "").split("-")[-1] or "")
        if not spid:
            continue

        lat = item.get("latitude")
        lng = item.get("longitude")
        if lat is not None and lng is not None:
            try:
                coords = [float(lng), float(lat)]
            except (ValueError, TypeError):
                coords = DEFAULT_CENTER
        else:
            coords = DEFAULT_CENTER

        title = item.get("title") or f"{item.get('bhk', 1)} BHK in {item.get('locality', 'Ahmedabad')}"
        price = float(item.get("price_inr") or 0)
        bhk = int(item.get("bhk") or item.get("bedrooms") or 1)
        area_sqft = float(item.get("carpet_area_sqft") or item.get("area_sqft") or 0)
        locality = item.get("locality") or "Ahmedabad"
        search_mode = str(item.get("searchMode", "")).lower()
        deal_type = "rent" if ("pg" in search_mode or "rent" in search_mode or "rent" in title.lower() or "pg" in title.lower()) else "buy"

        doc = {
            "spid": spid,
            "title": title,
            "description": item.get("description", "") or "",
            "deal_type": deal_type,
            "price": price,
            "bhk": bhk,
            "area_sqft": area_sqft,
            "locality": locality,
            "coordinates": {
                "type": "Point",
                "coordinates": coords
            },
            "amenities": item.get("amenities") or item.get("top_usps") or [],
            "images": item.get("images") or [],
            "furnishing": item.get("furnishing") or "Unfurnished",
            "status": "approved",
            "rejection_reason": None,
            "owner_id": None,
            "submitted_by_broker_id": None,
            "source": "seed",
            "source_detail": source_detail,
            "verification_flags": {
                "is_suspicious": False,
                "checked_at": now
            },
            "predicted_price_range": None,
            "view_count": 0,
            "enquiry_count": 0,
            "updated_at": now,
        }

        operations.append(
            UpdateOne(
                {"spid": spid},
                {"$set": doc, "$setOnInsert": {"created_at": now}},
                upsert=True
            )
        )

    if operations:
        result = db["listings"].bulk_write(operations)
        logger.info(f"Ingested 99acres seed listings: {result.upserted_count} inserted, {result.modified_count} modified.")
        return len(operations)
    return 0


if __name__ == '__main__':
    target_path = sys.argv[1] if len(sys.argv) > 1 else "../data/99acres_properties_full.json"
    run_ingestion(target_path)


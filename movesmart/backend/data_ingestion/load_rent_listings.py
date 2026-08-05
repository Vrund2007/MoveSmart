"""data_ingestion/load_rent_listings.py — Load resident_rent.json into MongoDB listings collection (Architecture.md §5, §6, FR-6)

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


def run_ingestion(json_path: str = "data/resident_rent.json") -> int:
    """Ingest seed rental listings from resident_rent.json into MongoDB `listings` collection."""
    if not os.path.exists(json_path):
        root_path = os.path.abspath(os.path.join(backend_dir, "..", json_path))
        if os.path.exists(root_path):
            json_path = root_path
        else:
            logger.error(f"File not found: {json_path}")
            return 0

    logger.info(f"Loading rental listings from {json_path}...")
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    if not isinstance(data, list):
        logger.error(f"Expected array in {json_path}, got {type(data)}")
        return 0

    db = get_db()
    now = datetime.now(timezone.utc)
    operations = []

    for item in data:
        listing = item.get("listing", {})
        spid = str(item.get("record_id") or listing.get("spid") or listing.get("property_id") or "")
        if not spid:
            continue

        entity = item.get("entity", {})
        pricing = item.get("pricing", {})
        prop = item.get("property", {})
        loc = item.get("location", {})
        media = item.get("media", {})

        coords_dict = loc.get("coordinates", {})
        lat = coords_dict.get("latitude")
        lng = coords_dict.get("longitude")
        if lat is not None and lng is not None:
            try:
                coords = [float(lng), float(lat)]
            except (ValueError, TypeError):
                coords = DEFAULT_CENTER
        else:
            coords = DEFAULT_CENTER

        title = listing.get("title") or entity.get("title") or f"{prop.get('bedrooms', 1)} BHK Flat for Rent"
        price = float(pricing.get("average_price") or pricing.get("min_price") or 0)
        bhk = int(prop.get("bedrooms") or 1)
        area_dict = prop.get("area", {})
        area_sqft = float(area_dict.get("carpet_sqft") or area_dict.get("carpet_area") or 0)
        locality = loc.get("locality_name") or loc.get("locality") or "Ahmedabad"

        photos = media.get("photos", [])
        if not photos and media.get("main_image") and "under_screening" not in media["main_image"]:
            photos = [media["main_image"]]

        doc = {
            "spid": spid,
            "title": title,
            "description": entity.get("description") or listing.get("description", "") or "",
            "deal_type": "rent",
            "price": price,
            "bhk": bhk,
            "area_sqft": area_sqft,
            "locality": locality,
            "coordinates": {
                "type": "Point",
                "coordinates": coords
            },
            "amenities": [lm["name"] for lm in loc.get("landmarks", []) if isinstance(lm, dict) and "name" in lm],
            "images": photos,
            "furnishing": prop.get("furnishing") or "Unfurnished",
            "status": "approved",
            "rejection_reason": None,
            "owner_id": None,
            "submitted_by_broker_id": None,
            "source": "seed",
            "source_detail": "resident_rent",
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
        logger.info(f"Ingested rental seed listings: {result.upserted_count} inserted, {result.modified_count} modified.")
        return len(operations)
    return 0


if __name__ == '__main__':
    target_path = sys.argv[1] if len(sys.argv) > 1 else "../data/resident_rent.json"
    run_ingestion(target_path)


"""data_ingestion/ingest_all.py — Master runner script for database indexing and seed data ingestion.

Usage:
    python movesmart/backend/data_ingestion/ingest_all.py
"""
import os
import sys
import logging

current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from db.indexes import ensure_indexes
from db.connection import get_db
from data_ingestion.load_99acres_condensed import run_ingestion as load_99acres
from data_ingestion.load_rent_listings import run_ingestion as load_rent
from data_ingestion.load_buy_listings import run_ingestion as load_buy

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger('movesmart')


def main():
    logger.info("=== Starting MoveSmart Seed Data Ingestion Pipeline ===")

    # 1. Ensure production collection indexes
    logger.info("1. Enforcing MongoDB database indexes...")
    ensure_indexes()

    # 2. Path resolution to workspace root data/ folder
    workspace_dir = os.path.abspath(os.path.join(backend_dir, ".."))
    data_dir = os.path.join(workspace_dir, "data")

    full_99acres_path = os.path.join(data_dir, "99acres_properties_full.json")
    rent_path = os.path.join(data_dir, "resident_rent.json")
    buy_path = os.path.join(data_dir, "buy_resident_latest.json")

    # 3. Execute ingestion modules
    logger.info("2. Ingesting 99acres property listings dataset...")
    c1 = load_99acres(full_99acres_path)

    logger.info("3. Ingesting residential rental listings dataset...")
    c2 = load_rent(rent_path)

    logger.info("4. Ingesting residential buy/sale listings dataset...")
    c3 = load_buy(buy_path)

    # 4. Summary & Verification
    db = get_db()
    total_count = db["listings"].count_documents({})
    approved_count = db["listings"].count_documents({"status": "approved"})
    rent_count = db["listings"].count_documents({"deal_type": "rent"})
    buy_count = db["listings"].count_documents({"deal_type": "buy"})

    logger.info("=== Ingestion Summary ===")
    logger.info(f"Total processed elements: {c1 + c2 + c3}")
    logger.info(f"MongoDB `listings` total count: {total_count}")
    logger.info(f"Approved status count: {approved_count}")
    logger.info(f"Rent listings count: {rent_count}")
    logger.info(f"Buy listings count: {buy_count}")
    logger.info("=== Ingestion Pipeline Completed Successfully ===")


if __name__ == '__main__':
    main()

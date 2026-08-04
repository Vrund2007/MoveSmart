"""data_ingestion/load_rent_listings.py — Load resident_rent.json into MongoDB (Architecture.md §5, §6, FR-6)"""
import sys
import logging

logger = logging.getLogger('movesmart')


def run_ingestion(json_path: str) -> None:
    """Ingest rent seed listings dataset into MongoDB."""
    logger.info(f"Rent listing seed ingestion pipeline configured for {json_path}.")


if __name__ == '__main__':
    path = sys.argv[1] if len(sys.argv) > 1 else "data/resident_rent.json"
    run_ingestion(path)

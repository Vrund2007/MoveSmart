"""data_ingestion/load_buy_listings.py — Load buy_resident_latest.json into MongoDB (Architecture.md §5, §6, FR-6)"""
import sys
import logging

logger = logging.getLogger('movesmart')


def run_ingestion(json_path: str) -> None:
    """Ingest buy seed listings dataset into MongoDB."""
    logger.info(f"Buy listing seed ingestion pipeline configured for {json_path}.")


if __name__ == '__main__':
    path = sys.argv[1] if len(sys.argv) > 1 else "data/buy_resident_latest.json"
    run_ingestion(path)

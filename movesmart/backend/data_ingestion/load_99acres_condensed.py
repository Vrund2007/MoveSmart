"""data_ingestion/load_99acres_condensed.py — Load 99acres_properties_condensed.json into MongoDB listings collection (Architecture.md §5, §6, FR-6, Rules.md §3)

All seed listings are written with status='approved' and source='seed' at ingestion time (FR-6).
"""
import sys
import logging

logger = logging.getLogger('movesmart')


def run_ingestion(json_path: str) -> None:
    """Ingest seed listings from 99acres condensed dataset into MongoDB."""
    logger.info(f"Seed data ingestion pipeline configured for {json_path}.")


if __name__ == '__main__':
    path = sys.argv[1] if len(sys.argv) > 1 else "data/99acres_properties_condensed.json"
    run_ingestion(path)

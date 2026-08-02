"""data_ingestion/load_buy_listings.py — Load buy_resident_latest.json into MongoDB listings collection.
(Architecture.md §5, §6, FR-6, Rules.md §3)
All seed listings written with status='approved', source='seed', source_detail='buy_resident_latest', deal_type='buy' (FR-6).
"""

# TODO: same pipeline as load_99acres_condensed.py adapted to buy_resident_latest.json schema
# TODO: set deal_type='buy' for all records from this source
# TODO: preserve source_url and any RERA/verification fields from raw data (Rules.md §3)

if __name__ == '__main__':
    pass  # TODO: implement ingestion pipeline

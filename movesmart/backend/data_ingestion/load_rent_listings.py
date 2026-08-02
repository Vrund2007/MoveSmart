"""data_ingestion/load_rent_listings.py — Load resident_rent.json into MongoDB listings collection.
(Architecture.md §5, §6, FR-6, Rules.md §3)
All seed listings written with status='approved', source='seed', source_detail='resident_rent', deal_type='rent' (FR-6).
"""

# TODO: same pipeline as load_99acres_condensed.py adapted to resident_rent.json schema
# TODO: set deal_type='rent' for all records from this source
# TODO: preserve source_url and any broker/dealer name fields — but do NOT expose dealer phone via public API (Rules.md §3 PII rule)

if __name__ == '__main__':
    pass  # TODO: implement ingestion pipeline

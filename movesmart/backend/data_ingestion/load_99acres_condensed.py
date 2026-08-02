"""data_ingestion/load_99acres_condensed.py — Load 99acres_properties_condensed.json into MongoDB listings collection.
(Architecture.md §5, §6, FR-6, Rules.md §3)

All seed listings are written with status='approved' and source='seed' at ingestion time (FR-6) —
they predate the Admin workflow and do not retroactively pass through admin_review.
source_url and deal_type/source_detail fields must be preserved from the raw data (Rules.md §3).
"""

# TODO: load JSON from data file path (configure path via CLI arg or environment variable)
# TODO: normalise each record to the listings schema defined in database.md §3.2
# TODO: set status='approved', source='seed', source_detail='99acres_condensed' on every document
# TODO: preserve source_url from raw data (Rules.md §3 — source attribution stays intact)
# TODO: skip records with missing required fields rather than interpolating (Rules.md §3)
# TODO: call db.listings_repo to insert — or use bulk_write for efficiency
# NOTE (FR-6): seed listings skip Admin queue entirely — this is correct and intentional

if __name__ == '__main__':
    pass  # TODO: implement ingestion pipeline

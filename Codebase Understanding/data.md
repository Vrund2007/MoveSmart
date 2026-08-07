# Data — Codebase Understanding

The `data/` folder contains the **raw seed datasets** used to populate the MoveSmart MongoDB database during initial setup. These are large JSON files scraped/exported from external real estate sources (primarily 99acres.com). They are consumed **once** by the `backend/data_ingestion/` scripts and are never directly read by the running application. The folder contains **no subfolders** — just four JSON files.

---

## Folder Tree

```
data/
├── 99acres_properties_condensed.json    (88 KB)   ← Lightweight 99acres dataset
├── 99acres_properties_full.json         (476 KB)  ← Full 99acres dataset
├── buy_resident_latest.json             (13.4 MB) ← Residential buy/sale listings
└── resident_rent.json                   (15.3 MB) ← Residential rental listings
```

---

## Files

### `99acres_properties_condensed.json`
- **Size**: 88 KB
- **Purpose**: A smaller, condensed version of the 99acres property dataset — typically used during development or when a fast seed is needed without loading the full dataset
- **Used by**: `backend/data_ingestion/load_99acres_condensed.py` → `data_ingestion/ingest_all.py`
- **Content structure**: Array of property objects, each representing a real estate listing scraped from 99acres.com
- **Key fields** (based on schema alignment with `listings` collection):
  - `title` — listing title/description
  - `locality` — Ahmedabad area name
  - `bhk` — bedroom count
  - `price` — listing price
  - `deal_type` — `"rent"` or `"buy"`
  - `furnishing` — `"Furnished"`, `"Semi-Furnished"`, `"Unfurnished"`
  - `area_sqft` — built-up area
  - `amenities` — list of amenities
  - `coordinates` — lat/lng if present
- **Ingestion behavior**: Listings are upserted with `status="approved"` (pre-approved seed data — bypasses the normal review workflow)
- **Notable**: Being condensed, some fields may be missing or null; the loader handles gracefully with defaults

---

### `99acres_properties_full.json`
- **Size**: 476 KB
- **Purpose**: The complete 99acres scraped dataset — used by `ingest_all.py` as the primary 99acres source
- **Used by**: `backend/data_ingestion/load_99acres_condensed.py` is called with the **full file path** in `ingest_all.py` (despite the loader being named "condensed", `ingest_all.py` passes `full_99acres_path`)
- **Content**: Same schema as condensed version but with more records and potentially richer field coverage
- **Gotcha**: There are two 99acres files but `ingest_all.py` passes the **full** JSON to `load_99acres_condensed.run_ingestion()` — the condensed file is a backup/dev shortcut

---

### `resident_rent.json`
- **Size**: 15.3 MB — largest file in the folder
- **Purpose**: Primary rental listings dataset — residential properties available for rent in Ahmedabad
- **Used by**: `backend/data_ingestion/load_rent_listings.py`
- **Content**: Large array of rental property objects. Expected to contain hundreds or thousands of listings
- **Key field mapping** (normalized by loader to match `listings` schema):
  - `deal_type` → forced to `"rent"` on ingestion
  - `locality` — Ahmedabad neighborhood name
  - `bhk`, `price`, `area_sqft`, `furnishing`, `amenities`, `title`
- **Ingestion behavior**: Inserted with `status="approved"` and `source="resident_rent_dataset"`
- **Usage**: This is the main source of rent listings visible to users in the property browser

---

### `buy_resident_latest.json`
- **Size**: 13.4 MB
- **Purpose**: Residential buy/sale listings dataset — properties available for purchase in Ahmedabad
- **Used by**: `backend/data_ingestion/load_buy_listings.py`
- **Content**: Large array of buy listing objects
- **Key field mapping**:
  - `deal_type` → forced to `"buy"` on ingestion
  - `locality`, `bhk`, `price`, `area_sqft`, `furnishing`, `amenities`, `title`
  - Prices are typically in lakhs/crores (residential purchase range)
- **Ingestion behavior**: Inserted with `status="approved"` and `source="buy_resident_dataset"`
- **Usage**: Source of buy listings shown to seekers browsing `deal_type=buy`

---

## How Data Flows Through the System

```
data/
├── 99acres_properties_full.json
├── resident_rent.json
└── buy_resident_latest.json
        │
        │  (one-time ingestion — run manually)
        ▼
backend/data_ingestion/ingest_all.py
        │  calls loaders
        ▼
backend/data_ingestion/load_*.py
        │  normalizes fields, inserts into MongoDB
        ▼
MongoDB: listings collection (status="approved")
        │
        │  served via API
        ▼
backend/apps/listings/views.py  →  GET /api/listings
        │
        ▼
frontend/src/api/listings.js  →  Dashboard, ListingDetail, etc.
```

---

## Key Notes for Developers

- **These files are NOT read at runtime** — they are seed data only. The running app reads from MongoDB
- **All ingested listings get `status="approved"`** — they bypass the admin review workflow. Only listings submitted by users go through `pending_review → approved/rejected`
- **The ingestion scripts are idempotent** in design: re-running them may create duplicates unless the loader checks for existing records (varies by loader — check `load_*.py` for upsert vs insert logic)
- **File sizes matter**: `resident_rent.json` (15MB) and `buy_resident_latest.json` (13MB) should be loaded with streaming/batch inserts, not read entirely into memory at once — the loaders handle this
- **Coordinates**: Some records may lack GPS coordinates; the `listings_repo.create_listing()` function defaults to Ahmedabad city center (`[72.539248, 23.020143]`) when coordinates are missing

## How This Connects to Other Parts of the App

- **backend/data_ingestion/**: These scripts read the JSON files and write to MongoDB
- **backend/ml/**: The ML models (`rent_prediction`, `suspicious_listing`) are trained using MongoDB data that was seeded from these files — so the quality of these datasets directly impacts ML accuracy
- **backend/db/listings_repo.py**: After ingestion, all listing data is accessed through this repo
- **frontend/**: Never touches these files directly; sees only the API results from MongoDB

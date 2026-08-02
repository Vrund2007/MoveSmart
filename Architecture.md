# Architecture.md — MoveSmart
### System Architecture & Technical Design
**Version:** 2.0 (MVP scope) · **Scope:** Ahmedabad · **Last updated:** July 31, 2026

> **Change log (v1.0 → v2.0):** Architecture updated to reflect PRD v2.0's expansion into a four-role marketplace (Find Accommodation, Property Owner, Broker/Agent, Company/HR) gated by an internal Admin approval workflow. The v1.0 architecture — Django + DRF + PyMongo/MongoDB, in-process ML (XGBoost, Isolation Forest, rule-based scoring), Gemini assistant, JWT auth, React/Tailwind frontend — is **unchanged as a stack** and is now the foundation the other three roles are built on top of. Nothing in this section is a stack substitution; it's additive: new apps, new collections, new endpoints, and a `role`/`status` model layered onto the existing design.

---

## 1. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | **React + JSX** | SPA, consumes REST API from backend |
| Backend | **Django + Django REST Framework (DRF)** | Serves API, hosts ML inference, orchestrates AI assistant calls |
| Database | **MongoDB** | Listings, users, preferences, saved items |
| DB access layer | **PyMongo** (not Django ORM) | See §2 for why |
| ML (in-process) | **XGBoost, scikit-learn (Isolation Forest)** | Loaded directly inside Django, no separate ML service |
| Conversational AI | **Gemini API (free tier)** | Called server-side from Django; never exposed to frontend directly |
| Auth | **JWT** (`djangorestframework-simplejwt`) | Stateless auth, works cleanly with a Mongo-backed user store |
| Maps/commute | **Google Maps Distance Matrix API** (or equivalent) | External dependency for Layer 3 (commute) — see PRD §8 gaps |

**Why no separate FastAPI/ML microservice:** the original concept doc proposed Python/FastAPI as a standalone ML layer. Since the backend is already Python (Django), the ML models run as plain Python functions/classes imported directly into Django views — one service, one deployment, no inter-service network calls for inference. This can be split out later if load requires it, but MVP doesn't need the extra complexity.

---

## 2. Django + MongoDB: The One Non-Default Decision

Django's ORM is built for relational databases. To use MongoDB without fighting the framework, this project uses:

- **PyMongo directly**, wrapped in a small `db/` access layer (not Django models with `models.Model`).
- **DRF Serializers** (not `ModelSerializer`) to validate/shape data going in and out — serializers work fine against plain dicts from PyMongo.
- **Django** is used for: URL routing, DRF views/viewsets, JWT auth, request/response handling, settings/config, and hosting ML inference code. It is **not** used for: ORM models or migrations.
- **Clarification (v2.0):** Django's built-in admin *site* (the auto-generated `/admin/` CRUD panel) is still deferred — it's not used and not needed. This is distinct from the **Admin role's listing-approval workflow**, which is now in MVP scope per PRD §3/§8. That workflow is a purpose-built `apps/admin_review/` app (DRF views + a `role == 'admin'` permission check), not Django's admin site. A full platform-wide admin dashboard (user management, analytics) remains Phase 2 per PRD §8.

This keeps things simple and avoids `djongo`/`mongoengine` compatibility risk with newer Django versions. If a future need arises for Django's admin panel or stricter schema enforcement, `mongoengine` can be introduced later without a full rewrite, since the PyMongo access layer is already isolated behind its own module.

---

## 3. High-Level System Flow

```
┌─────────────┐      REST (JSON)      ┌───────────────────────────────┐
│   React     │ ────────────────────▶ │           Django API           │
│  Frontend   │ ◀──────────────────── │   (DRF views + JWT auth)       │
└─────────────┘                       │                                 │
                                       │   ┌─────────────────────────┐  │
                                       │   │  ML Inference Layer     │  │
                                       │   │  - XGBoost (rent)       │  │
                                       │   │  - Isolation Forest     │  │
                                       │   │    (suspicious listing) │  │
                                       │   │  - Rule-based scoring   │  │
                                       │   │    (area + property)    │  │
                                       │   └─────────────────────────┘  │
                                       │                                 │
                                       │   ┌─────────────────────────┐  │
                                       │   │  External API Clients   │  │
                                       │   │  - Gemini API (assistant)│ │
                                       │   │  - Maps API (commute)   │  │
                                       │   └─────────────────────────┘  │
                                       └───────────────┬─────────────────┘
                                                        │ PyMongo
                                                        ▼
                                               ┌─────────────────┐
                                               │    MongoDB       │
                                               │  users, listings,│
                                               │  preferences,    │
                                               │  saved_items      │
                                               └─────────────────┘
```

**Request examples:**

- `POST /api/recommendations/areas` → Django loads user profile from Mongo → runs rule-based area scoring across the 4 districts → returns ranked localities with explanation.
- `GET /api/listings?locality=Vejalpur` → Django queries Mongo for listings in that locality, **filtered to `status: approved`** → runs XGBoost rent-fairness check + Isolation Forest anomaly flag per listing → returns enriched listing data.
- `POST /api/assistant/chat` → Django assembles context (user profile + relevant listing/locality data from Mongo) → calls Gemini API with that context → returns grounded answer.
- `GET /api/commute?from=Vejalpur&to=<office coords>` → Django calls Maps API → caches result in Mongo (commute data doesn't change often) → returns time/cost by mode.
- `POST /api/listings` (Owner/Broker) → Django validates via DRF serializer → writes to Mongo with `status: pending_review` → **not** returned by any search/browse/bulk-search endpoint until an Admin approves it.
- `PATCH /api/admin/listings/:id/review` (Admin only, enforced by role permission class) → transitions `pending_review` → `approved`/`rejected` (with reason on rejection) → on approval, listing becomes visible to `GET /api/listings`, Company/HR bulk search, and Broker inventory views.
- `POST /api/company/relocation-batches/:id/search` → Django runs the same rule-based scoring engine (`apps/recommendations/scoring.py`) used by Find Accommodation, scoped to office location + approved listings → returns candidate housing per employee.

**Role/status gating (v2.0):** every request that returns listing data passes through the same `status == 'approved'` filter at the query layer (in `db/listings_repo.py`), regardless of which role or endpoint is asking — Find Accommodation search, Broker inventory browsing, and Company/HR bulk search all call the same repo method rather than each re-implementing the filter. This is the single point where FR-3 is enforced, so it can't drift between features.

---

## 4. End-to-End User Flow (System View)

### 4.0 Signup & Role Routing (new in v2.0)

1. **Create account** → React form → `POST /api/auth/register` (email/password only at this step) → Django issues JWT → stored client-side.
2. **Choose Your Journey** → React screen → `PATCH /api/auth/role` with one of `find_accommodation | property_owner | broker | company_hr` → written once to `users.role` in Mongo. This field is **immutable from the client after first set** (role switching is Phase 2 per PRD §3) — enforced server-side in the serializer, not just hidden in the UI.
3. **`admin` is never accepted by this endpoint.** The role serializer's choices for the public-facing route exclude `admin` entirely (it's not merely omitted from a dropdown) — an Admin account can only be created via a separate, non-public provisioning path (a management command or a protected internal endpoint), satisfying FR-2.
4. **Role-specific onboarding** → each role's dedicated onboarding form (see §4.1–§4.4) → routes to that role's dashboard.

### 4.1 Find Accommodation (unchanged from v1.0)

1. **Profile setup** → React form (salary, work location, rent budget, lifestyle, commute tolerance) → `POST /api/profile` → stored in Mongo `users` collection.
2. **Get recommendations** → `POST /api/recommendations/areas` triggers:
   - Load candidate localities from `listings` collection (aggregated, **`status: approved` only**).
   - Score each locality across Residential / Business / Lifestyle / Transit dimensions using rule-based weighted scoring.
   - Return top 3 with explanation.
3. **Browse housing in a locality** → `GET /api/listings?locality=X` triggers:
   - Fetch approved listings from Mongo.
   - Run XGBoost regressor per listing → predicted fair-price range.
   - Run Isolation Forest per listing → anomaly/trust flag.
   - Return enriched, sorted list.
4. **Commute check** → `GET /api/commute` → Maps API call (cached) → time/cost by mode.
5. **Cost-of-living estimate** → `GET /api/cost-of-living?locality=X` → rule-based calculation using rent data + editable default categories (food, transport, utilities — see PRD §8 data gaps).
6. **Ask the assistant** → `POST /api/assistant/chat` → Django builds a grounded context payload (user profile + top localities + relevant listings) → sends to Gemini → returns explained answer.
7. **Save/bookmark** → `POST /api/saved-listings` → stored in Mongo, tied to user ID.
8. **Send an enquiry** → `POST /api/enquiries` (listing ID + message) → stored in Mongo `enquiries` collection, visible to the listing's Owner/Broker (see §4.2/§4.3).

### 4.2 Property Owner (new in v2.0)

1. **Create listing** → React form (details, photos, price, availability) → `POST /api/listings` → DRF serializer validates → written to Mongo with `status: pending_review`, `owner_id` set from the JWT.
2. **Await review** → listing does not appear in any Find Accommodation, Broker, or Company/HR result until an Admin acts on it (§4.5).
3. **Manage** → `GET/PUT/DELETE /api/listings/:id` scoped to `owner_id == current user` (never another Owner's listings — FR-7) → toggle availability, edit, delete.
4. **View enquiries** → `GET /api/enquiries?listing_owner=me` → enquiries for the Owner's own listings only.
5. **View analytics** → `GET /api/listings/:id/analytics` → view/enquiry counts (basic MVP counters, not a time-series — see PRD §8 Phase 2).

### 4.3 Broker/Agent (new in v2.0)

1. **Add owners & listings** → same `POST /api/listings` as §4.2, with a `submitted_by_broker_id` field in addition to `owner_id`, so provenance is preserved even though the broker is submitting on the owner's behalf → same `pending_review` → Admin approval path.
2. **Manage leads** → `GET /api/leads?broker=me` aggregates enquiries across all listings the broker manages, each with a `lead_status` (`new | contacted | converted | lost`) → `PATCH /api/leads/:id` to update status.
3. **Track commission** → `POST/PATCH /api/commissions` — manual entry tied to a converted lead; `GET /api/commissions?broker=me` for the broker's own records only (never visible to other roles — FR-7).
4. **AI-assisted client matching** → `POST /api/recommendations/areas` with a client-shaped payload (same contract as the Find Accommodation profile) → **reuses the exact same `scoring.py` service** (PRD §5, FR-8) rather than a broker-specific copy of the scoring logic.

### 4.4 Company/HR (new in v2.0)

1. **Onboarding** → company name, office location(s) → `POST /api/company/profile`.
2. **Start a relocation batch** → `POST /api/company/relocation-batches` (headcount, budget, office location) → stored in Mongo `relocation_batches`.
3. **Bulk housing search** → `POST /api/company/relocation-batches/:id/search` → runs `scoring.py` (same shared service as §4.1/§4.3) scoped to the batch's office location(s) and **`status: approved`** listings only → returns ranked candidates.
4. **Allocate** → `POST /api/company/relocation-batches/:id/allocate` (employee ↔ listing pairs) → stored against the batch.
5. **Track budget** → running total (sum of allocated listing costs) computed server-side against `relocation_batches.budget`, returned by `GET /api/company/relocation-batches/:id`.
6. **Report** → `GET /api/company/relocation-batches/:id/report` → basic export/summary of who was allocated where, at what cost (PRD §8 — no PDF generation required for MVP, a structured JSON/CSV export is sufficient).

### 4.5 Admin (new in v2.0, internal)

1. **Login** → separate, non-public flow — same JWT mechanism, but the account itself can only exist via manual provisioning (§4.0 step 3), and Admin-only endpoints are protected by a `role == 'admin'` DRF permission class, not by hiding a UI route.
2. **Review queue** → `GET /api/admin/listings?status=pending_review` → every Owner/Broker-submitted listing awaiting decision.
3. **Approve/reject** → `PATCH /api/admin/listings/:id/review` → `{decision: 'approved'}` or `{decision: 'rejected', reason: '...'}` → on rejection, the listing's status returns to editable-and-resubmittable (`pending_review` again once the Owner/Broker edits it), with `reason` surfaced to them via `GET /api/listings/:id`.
4. **No bypass path.** Every Owner/Broker-submitted listing is created with `status: pending_review` at the serializer level (§4.2 step 1) — there is no code path that writes a listing directly to `approved` outside this endpoint, satisfying FR-4. Seed listings are the one exception, ingested pre-approved (§6, FR-6) since they predate this workflow entirely.

---

## 5. Folder & File Structure

```
movesmart/
│
├── frontend/                          # React app
│   ├── public/
│   ├── src/
│   │   ├── api/                       # API client wrappers (axios instances per resource)
│   │   │   ├── auth.js
│   │   │   ├── listings.js
│   │   │   ├── recommendations.js
│   │   │   ├── commute.js
│   │   │   └── assistant.js
│   │   ├── components/
│   │   │   ├── common/                # Buttons, inputs, cards, layout shells
│   │   │   ├── auth/                  # Choose Your Journey role-select screen (new v2.0)
│   │   │   ├── onboarding/            # Per-role onboarding steps — find_accommodation (5 questions), property_owner, broker, company_hr (new v2.0: split by role)
│   │   │   ├── recommendations/       # District/locality recommendation cards (shared by Find Accommodation, Broker matching, Company/HR search)
│   │   │   ├── listings/              # Listing cards, filters, trust badges, status badge (pending/approved/rejected — new v2.0)
│   │   │   ├── commute/               # Commute insight panel
│   │   │   ├── cost/                  # Cost-of-living breakdown UI
│   │   │   ├── assistant/             # Chat widget UI
│   │   │   ├── enquiries/             # Enquiry form (Find Accommodation) + enquiry/lead list (Owner/Broker) (new v2.0)
│   │   │   ├── owner/                 # Listing create/edit form, availability toggle, per-listing analytics (new v2.0)
│   │   │   ├── broker/                # Lead status board, commission tracker (new v2.0)
│   │   │   ├── company/               # Relocation batch form, bulk search results, allocation grid, budget tracker (new v2.0)
│   │   │   ├── admin/                 # Review queue table, approve/reject panel with reason field (new v2.0)
│   │   │   └── city-story/            # Scroll-driven landing page (GSAP/Three.js — Phase 2)
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── ChooseYourJourney.jsx  # Role selection, new v2.0
│   │   │   ├── Onboarding.jsx         # Renders the correct onboarding flow per role
│   │   │   ├── Dashboard.jsx          # Find Accommodation Layer 1–5 results view
│   │   │   ├── ListingDetail.jsx
│   │   │   ├── SavedListings.jsx
│   │   │   ├── OwnerDashboard.jsx     # New v2.0
│   │   │   ├── BrokerDashboard.jsx    # New v2.0
│   │   │   ├── CompanyDashboard.jsx   # New v2.0
│   │   │   └── AdminReviewQueue.jsx   # New v2.0
│   │   ├── context/                   # Auth context (now carries role), user profile context
│   │   ├── hooks/
│   │   ├── styles/                    # Tailwind config + globals
│   │   ├── App.jsx
│   │   └── index.jsx
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                           # Django project
│   ├── manage.py
│   ├── config/                        # Django project settings
│   │   ├── settings.py
│   │   ├── urls.py                    # Root URL routing → includes each app's urls
│   │   └── wsgi.py / asgi.py
│   │
│   ├── apps/
│   │   ├── accounts/                  # Auth, JWT, user profile, role assignment (Choose Your Journey)
│   │   │   ├── views.py               # DRF views (register, login, profile, set-role)
│   │   │   ├── serializers.py         # RoleSerializer excludes 'admin' from public choices (FR-2)
│   │   │   ├── permissions.py         # Role-based DRF permission classes (IsOwner, IsBroker, IsCompanyHR, IsAdmin) — new v2.0
│   │   │   └── urls.py
│   │   │
│   │   ├── listings/                  # Listings browse, filter, save — now status-aware (pending_review/approved/rejected)
│   │   │   ├── views.py               # Owner/Broker create+manage; public browse always filters status=approved
│   │   │   ├── serializers.py
│   │   │   └── urls.py
│   │   │
│   │   ├── admin_review/              # Admin approval queue — new v2.0
│   │   │   ├── views.py               # List pending_review, approve/reject with reason
│   │   │   ├── serializers.py
│   │   │   └── urls.py
│   │   │
│   │   ├── enquiries/                 # Structured enquiry submissions (Find Accommodation → Owner/Broker) — new v2.0
│   │   │   ├── views.py
│   │   │   ├── serializers.py
│   │   │   └── urls.py
│   │   │
│   │   ├── broker/                    # Lead status tracking + commission — new v2.0
│   │   │   ├── views.py
│   │   │   ├── serializers.py
│   │   │   └── urls.py
│   │   │
│   │   ├── company/                   # Relocation batches, bulk search, allocation, budget, reports — new v2.0
│   │   │   ├── views.py
│   │   │   ├── serializers.py
│   │   │   └── urls.py
│   │   │
│   │   ├── recommendations/           # Area + property recommendation logic — shared service (Find Accommodation, Broker matching, Company/HR bulk search; FR-8)
│   │   │   ├── views.py
│   │   │   ├── scoring.py             # Rule-based area scoring (4-district weighting) — single implementation, multiple consumers
│   │   │   ├── ranking.py             # Rule-based property ranking
│   │   │   └── urls.py
│   │   │
│   │   ├── commute/                   # Commute estimation
│   │   │   ├── views.py
│   │   │   ├── maps_client.py         # Wrapper around Maps API
│   │   │   └── urls.py
│   │   │
│   │   ├── cost_of_living/            # Cost breakdown estimation
│   │   │   ├── views.py
│   │   │   ├── estimator.py
│   │   │   └── urls.py
│   │   │
│   │   └── assistant/                 # Conversational AI
│   │       ├── views.py
│   │       ├── gemini_client.py       # Wrapper around Gemini API
│   │       ├── context_builder.py     # Assembles grounded context from Mongo data
│   │       └── urls.py
│   │
│   ├── ml/                            # ML models — imported directly by app views, no separate service
│   │   ├── rent_prediction/
│   │   │   ├── model.py               # XGBoost load + predict()
│   │   │   ├── train.py               # Offline training script
│   │   │   └── artifacts/             # Saved model file (.json / .pkl)
│   │   ├── suspicious_listing/
│   │   │   ├── model.py               # Isolation Forest load + predict()
│   │   │   ├── train.py
│   │   │   └── artifacts/
│   │   └── shared/
│   │       └── feature_engineering.py # Shared feature prep (price/sqft, locality encoding, etc.)
│   │
│   ├── db/                            # PyMongo access layer (see §2)
│   │   ├── connection.py              # Mongo client/connection setup
│   │   ├── users_repo.py
│   │   ├── listings_repo.py           # Single source of truth for the status=approved filter (see §3) — new v2.0
│   │   ├── saved_items_repo.py
│   │   ├── enquiries_repo.py          # New v2.0
│   │   ├── leads_repo.py              # New v2.0
│   │   ├── commissions_repo.py        # New v2.0
│   │   └── relocation_batches_repo.py # New v2.0
│   │
│   ├── data_ingestion/                # One-off / scheduled scripts to load the provided JSON datasets into Mongo. Seed listings are written with status: approved directly (FR-6) — they don't pass through admin_review.
│   │   ├── load_99acres_condensed.py
│   │   ├── load_buy_listings.py
│   │   └── load_rent_listings.py
│   │
│   └── requirements.txt
│
├── docs/
│   ├── PRD.md
│   ├── Architecture.md
│   └── (future) API_Spec.md, Data_Model.md
│
└── README.md
```

---

## 6. Database Design (MongoDB Collections — Conceptual)

| Collection | Purpose | Key fields (indicative) |
|---|---|---|
| `users` | Account + profile, all four public roles + admin | `email`, `password_hash`, `role` (`find_accommodation`\|`property_owner`\|`broker`\|`company_hr`\|`admin`, set once), plus role-specific fields: `salary`/`work_location`/`rent_budget`/`lifestyle_pref`/`commute_tolerance` (Find Accommodation), `agency_name` (Broker), `company_name`/`office_locations` (Company/HR) |
| `listings` | Normalized listing data — seed-ingested **and** Owner/Broker-submitted | `deal_type` (rent/buy), `price`, `bhk`, `locality`, `coordinates`, `furnishing`, `area_sqft`, `verification_flags`, `source_url`, **`status`** (`pending_review`\|`approved`\|`rejected`, new v2.0), **`owner_id`**, **`submitted_by_broker_id`** (nullable), **`rejection_reason`** (nullable) |
| `saved_items` | User bookmarks | `user_id`, `listing_id`, `saved_at` |
| `commute_cache` | Cached Maps API results | `origin_locality`, `destination`, `mode`, `duration`, `fetched_at` |
| `chat_logs` | (Optional, Phase 2) Assistant conversation history | `user_id`, `messages[]`, `timestamp` |
| `enquiries` | Structured enquiry from a Find Accommodation user to a listing's Owner/Broker — new v2.0 | `listing_id`, `from_user_id`, `to_owner_or_broker_id`, `message`, `created_at` |
| `leads` | Broker's view of enquiries against their managed listings — new v2.0 | `broker_id`, `enquiry_id`, `lead_status` (`new`\|`contacted`\|`converted`\|`lost`), `updated_at` |
| `commissions` | Manual commission tracking per converted lead — new v2.0 | `broker_id`, `lead_id`, `amount`, `deal_date` |
| `relocation_batches` | Company/HR employee relocation batch — new v2.0 | `company_id`, `office_locations`, `headcount`, `budget`, `employees[]` (name/constraints), `allocations[]` (`employee_id` → `listing_id`), `created_at` |

Listings from `99acres_properties_condensed.json`, `buy_resident_latest.json`, and `resident_rent.json` are normalized into one `listings` schema at ingestion time (via `data_ingestion/`), with a `deal_type` and `source_detail` field preserving which original dataset/schema richness they came from, and are written with `status: approved` directly at ingestion (FR-6) since they predate the Admin workflow.

---

## 7. ML Module Integration (as specified)

| Module | Method | Where it lives | Trigger |
|---|---|---|---|
| Rent Prediction | XGBoost Regressor | `ml/rent_prediction/` | Called per-listing when listings are fetched, or on-demand for a specific rent-fairness check |
| Suspicious Listing Detection | Isolation Forest | `ml/suspicious_listing/` | Called per-listing alongside rent prediction; flags anomalies in price-per-sqft vs. comparable listings |
| Area Recommendation | Rule-based filtering + weighted scoring | `apps/recommendations/scoring.py` | Called once per recommendation request, using user profile + aggregated locality stats. **Shared service (v2.0, FR-8):** consumed by Find Accommodation (`apps/recommendations`), Broker client-matching (`apps/broker`), and Company/HR bulk search (`apps/company`) — one implementation, three callers, never forked per-role |
| Property Recommendation | Rule-based ranking | `apps/recommendations/ranking.py` | Called after area is selected, ranks listings within that locality (approved listings only) |
| AI Assistant | Gemini API (free tier) | `apps/assistant/gemini_client.py` | Called per chat message; context assembled server-side, never sends raw DB access to the model |

Trained model artifacts (`.json`/`.pkl`) are version-controlled or stored in an artifacts directory and loaded once at Django startup (not re-loaded per-request) for performance.

**Known constraint:** Gemini free tier has rate limits — the assistant should degrade gracefully (e.g., queue/backoff message) rather than fail hard if the quota is hit.

---

## 8. API Surface (MVP, indicative)

```
POST   /api/auth/register
POST   /api/auth/login
PATCH  /api/auth/role                       # Choose Your Journey — set once, excludes 'admin' (new v2.0)
GET    /api/profile
PUT    /api/profile

POST   /api/recommendations/areas          # Layer 1 — shared by Find Accommodation, Broker matching, Company/HR search
GET    /api/listings                        # Layer 2 (filterable by locality, bhk, budget, deal_type) — always status=approved for non-owner callers
GET    /api/listings/:id
POST   /api/listings                        # Owner/Broker create — status: pending_review (new v2.0)
PUT    /api/listings/:id                    # Owner/Broker edit (own listings only)
DELETE /api/listings/:id
GET    /api/listings/:id/analytics          # Owner/Broker basic view/enquiry counts (new v2.0)
GET    /api/commute                         # Layer 3
GET    /api/cost-of-living                  # Layer 4

POST   /api/assistant/chat                  # AI assistant
POST   /api/saved-listings
GET    /api/saved-listings
DELETE /api/saved-listings/:id

POST   /api/enquiries                       # Find Accommodation → Owner/Broker (new v2.0)
GET    /api/enquiries?listing_owner=me      # Owner's own enquiries (new v2.0)

GET    /api/leads?broker=me                 # Broker lead list (new v2.0)
PATCH  /api/leads/:id                       # Update lead_status (new v2.0)
POST   /api/commissions                     # Broker commission entry (new v2.0)
GET    /api/commissions?broker=me           # (new v2.0)

POST   /api/company/profile                 # Company/HR onboarding (new v2.0)
POST   /api/company/relocation-batches      # (new v2.0)
GET    /api/company/relocation-batches/:id
POST   /api/company/relocation-batches/:id/search    # Bulk housing search (new v2.0)
POST   /api/company/relocation-batches/:id/allocate  # (new v2.0)
GET    /api/company/relocation-batches/:id/report    # (new v2.0)

GET    /api/admin/listings?status=pending_review     # Admin review queue (new v2.0)
PATCH  /api/admin/listings/:id/review                # Approve/reject with reason (new v2.0)
```

Full request/response contracts belong in a separate `API_Spec.md` (not this document).

---

## 9. Deployment Shape (MVP)

- **Frontend:** static build (React), deployed to a static host (e.g., Vercel/Netlify).
- **Backend:** single Django app (API + ML inference in-process), deployed as one service (e.g., Render/Railway/EC2).
- **Database:** MongoDB Atlas (managed).
- **No separate ML microservice, no message queue, no caching layer** required for MVP — all deferred until real load data justifies them.

---

## 10. Explicitly Deferred (Phase 2+)

- Splitting ML inference into its own service if latency/load requires it.
- Django admin or `mongoengine` if structured admin tooling becomes necessary.
- Preference-learning personalization (behavioral tracking pipeline).
- Notifications system (price drops, new listings) — needs a scheduler/background job (e.g., Celery) not included in MVP scope.
- The animated scroll-driven city-story landing page (Three.js/GSAP) — structurally scaffolded in `city-story/` but not required for MVP functionality.
- **(v2.0)** Automated pre-screening assist for Admin using the Isolation Forest signal, surfaced in `admin_review` but never auto-deciding — human approval stays mandatory in MVP.
- **(v2.0)** Role switching / multi-role accounts — `users.role` is single-value and set-once for MVP.
- **(v2.0)** In-app messaging between Find Accommodation users and Owners/Brokers — `enquiries` stays a one-shot structured form submission, not a chat thread, in MVP.
- **(v2.0)** Owner claiming of pre-approved seed listings (and whether a claim re-triggers `admin_review`) — flagged in PRD §12, not resolved here.
- **(v2.0)** Structured Owner/Broker ↔ Company/HR partnership workflows — Company/HR's bulk search reads the same approved-listings pool in MVP, no preferred-partner relationship model yet.
- **(v2.0)** Full platform-wide Admin analytics dashboard and review-sentiment analysis — MVP Admin scope is limited to the approval queue (`admin_review`).

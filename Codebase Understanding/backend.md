# Backend — Codebase Understanding

The `backend/` folder is the entire **Django REST Framework** server for MoveSmart. It does **not** use Django's ORM — all data persistence is handled via **PyMongo** (raw MongoDB driver). There is no Django admin panel, no Django models file, and no relational DB. The backend exposes a JSON API consumed by the React frontend, handles JWT authentication, runs two ML inference pipelines (rent valuation + fraud detection), and organises every feature domain into a separate Django "app" under `apps/`.

---

## Folder Tree

```
backend/
├── manage.py
├── requirements.txt
├── .env / .env.example
├── test_platform_settings.py
│
├── config/                    ← Django project config (settings, URLs, middleware)
│   ├── __init__.py
│   ├── apps.py
│   ├── middleware.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
│
├── apps/                      ← All feature domains as Django apps (no models.py)
│   ├── accounts/              ← Auth, registration, JWT, roles, Razorpay payments
│   ├── activity/              ← User activity log
│   ├── admin_platform/        ← Super admin analytics, user mgmt, company mgmt
│   ├── admin_review/          ← Listing moderation queue (approve/reject)
│   ├── assistant/             ← AI chat assistant (Groq LLaMA)
│   ├── audit/                 ← Audit trail logging
│   ├── calendar/              ← Calendar event scheduling
│   ├── cms/                   ← Content management (platform banners etc.)
│   ├── common/                ← Shared utilities: constants, exceptions, responses
│   ├── commute/               ← Commute time calculations (maps + local resolver)
│   ├── company/               ← Company HR portal: employees, relocation, expenses
│   ├── cost_of_living/        ← Cost of living estimation engine
│   ├── enquiries/             ← Property enquiry submission & retrieval
│   ├── listings/              ← Listing CRUD + saved listings + ML inference
│   ├── messages/              ← Direct messaging between users
│   ├── notifications/         ← Notification creation & retrieval
│   ├── platform/              ← Platform settings (maintenance mode, public config)
│   ├── recommendations/       ← AI locality recommendation scoring engine
│   ├── reports/               ← Reports generation
│   ├── search/                ← Global search endpoint
│   └── visits/                ← Visit scheduling (seeker + owner views)
│
├── db/                        ← PyMongo repository layer (data access objects)
│   ├── __init__.py
│   ├── connection.py
│   ├── indexes.py
│   └── [28 *_repo.py files]   ← one per MongoDB collection/domain
│
├── ml/                        ← Machine learning inference pipeline
│   ├── shared/feature_engineering.py
│   ├── rent_prediction/ (model.py, train.py, artifacts/)
│   └── suspicious_listing/ (model.py, train.py, artifacts/)
│
├── data_ingestion/            ← One-time seed data loaders from data/ JSON files
├── tests/                     ← API integration tests
├── media/                     ← Local media uploads (dev only)
└── venv/                      ← Python virtual environment (not in git)
```

---

## `config/` — Django Project Configuration

### `config/__init__.py`
- Marks `config/` as a Python package

### `config/apps.py`
- Defines `MoveSmartCoreConfig(AppConfig)` — the core app config class
- **Critical**: overrides `ready()` to call `ml.rent_prediction.model.load_model()` and `ml.suspicious_listing.model.load_model()` at startup — ML models are warm in memory before any request

### `config/settings.py`
- All secrets loaded from `.env` via `python-dotenv`
- **No ORM DATABASES block** — MongoDB accessed via PyMongo only
- Key settings:
  - `MONGO_URI`, `DATABASE_NAME` — MongoDB connection
  - `GEMINI_API_KEY` — Google AI (legacy ref; actual AI uses Groq)
  - `GEOAPIFY_API_KEY` / `MAPS_API_KEY` — geocoding
  - `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET` — image storage
  - `RAZORPAY_KEY_ID/KEY_SECRET` — payment gateway
  - `GROQ_API_KEY` — LLM API for AI assistant
  - `JWT_ACCESS_TOKEN_LIFETIME_MINUTES` — JWT expiry (default 60 min)
  - `CORS_ALLOWED_ORIGINS` — allowed React origins
- DRF config: `MongoJWTAuthentication` + `custom_exception_handler`

### `config/urls.py`
- Root URL dispatcher — includes every app's `urls.py` under `/api/` prefix
- Admin review at `/api/admin/`; owner visits at `/api/owner/visits/`

### `config/middleware.py`
- `MaintenanceModeMiddleware` — reads `platform_settings_repo` on every request
- If `maintenance_mode=True`, blocks non-admin users with HTTP 503
- Exempt: `/api/auth/login`, `/api/health`, `/media/`, `/static/`, `/api/admin/`, `/api/platform/settings/public`
- **Gotcha**: silent pass-through if DB is unreachable (wrapped in try/except)

### `config/wsgi.py`
- Standard Django WSGI entry point for production

---

## `apps/` — Feature Apps

Each app: `__init__.py`, `urls.py`, `views.py`, optionally `serializers.py`, `services.py`, `repository.py`. **No `models.py`** anywhere — all data via `db/`.

---

### `apps/accounts/` — Authentication & User Management

**Purpose**: Registration, login, JWT tokens, role assignment, Google OAuth, Razorpay payments, password change, account deletion.

#### `accounts/__init__.py`
- Empty package marker

#### `accounts/authentication.py`
- `_MongoUser` — wraps a MongoDB user dict into a DRF-compatible user object
  - Fields: `id`, `pk`, `email`, `role`, `role_profile`, `is_authenticated=True`
- `MongoJWTAuthentication(JWTAuthentication)` — overrides `get_user()` to fetch from MongoDB using `'user_id'` JWT claim
- **Gotcha**: JWT payload uses `'user_id'` = MongoDB `_id` as string (not Django User pk)

#### `accounts/permissions.py`
- DRF permission classes: `IsFindAccommodation`, `IsOwner`, `IsBroker`, `IsCompanyHR`, `IsAdmin`, `IsOwnerOrBroker`
- All check `request.user.role` against `UserRoles` constants

#### `accounts/repository.py`
- Thin wrapper around `db/users_repo.py` functions

#### `accounts/serializers.py`
- `RegisterSerializer` — validates email, password, confirm_password, name
- `LoginSerializer` — email + password
- `RoleSerializer` — role against `UserRoles.PUBLIC_ROLES` (admin excluded per FR-2)
- `PROFILE_SERIALIZER_MAP` — dict mapping each role to its profile serializer

#### `accounts/services.py`
- `issue_tokens(user_id)` — generates simplejwt access + refresh tokens
- `register_user(email, password, name)` — duplicate check, hash password, create
- `authenticate_user(email, password)` — verify bcrypt hash, return safe_user + tokens
- `assign_role(user_id, role)` — sets role once; immutable after (FR-1)
- `update_profile(user_id, profile_data)` — updates `role_profile` subdocument
- `change_password`, `delete_account`, `google_auth_user`
- Custom exceptions: `AccountServiceError`, `DuplicateEmailError`, `InvalidCredentialsError`, `RoleImmutableError`

#### `accounts/views.py`
- `RegisterView` — `POST /api/auth/register`
- `LoginView` — `POST /api/auth/login`
- `RefreshView` — `POST /api/auth/refresh`
- `LogoutView` — `POST /api/auth/logout` (client-side token clearing only)
- `SetRoleView` — `PATCH /api/auth/role`
- `ProfileView` — `GET/PUT /api/profile`
- `RazorpayCreateOrderView` — `POST /api/auth/razorpay/create-order` (creates ₹30 Razorpay order)
- `RazorpayVerifyPaymentView` — `POST /api/auth/razorpay/verify-payment` (HMAC signature verify, calls `users_repo.unlock_feature`)
- `GoogleAuthView` — `POST /api/auth/google`
- `ChangePasswordView` — `POST /api/auth/change-password`
- `DeleteAccountView` — `POST /api/auth/delete-account`

---

### `apps/listings/` — Property Listings

**Purpose**: CRUD for listings, saved listings, ML inference on creation, analytics.

#### `listings/views.py`
- `ListingsView` — `GET /api/listings` (paginated + filtered) + `POST /api/listings`
- `ListingDetailView` — `GET/PUT/DELETE /api/listings/:id`
- `MyListingsView` — `GET /api/listings/my`
- `SavedListingsView` — `GET/POST /api/saved-listings`
- `SavedListingDetailView` — `DELETE /api/saved-listings/:id`
- `ListingAnalyticsView` — `GET /api/listings/:id/analytics`
- **Key pattern**: on listing creation, calls ML for `predicted_price_range` and `verification_flags`

#### `listings/serializers.py`
- `ListingSerializer` — validates title, locality, bhk, price, deal_type, furnishing, area_sqft, amenities, images, coordinates, description

---

### `apps/admin_review/` — Listing Moderation

**Purpose**: Admin-only review queue — approve or reject pending listings.

#### `admin_review/views.py`
- `AdminReviewQueueView` — `GET /api/admin/review-queue`
- `AdminReviewActionView` — `POST /api/admin/review-queue/:id/action`
- Requires `IsAdmin` permission

#### `admin_review/serializers.py`
- `ReviewActionSerializer` — validates `action` ('approved'/'rejected') + optional `rejection_reason`

---

### `apps/assistant/` — AI Chat Assistant

**Purpose**: AI-powered chat using Groq LLaMA-3.3-70B, scoped strictly to MoveSmart domain.

#### `assistant/gemini_client.py`
- `STRICT_MOVESMART_SYSTEM_PROMPT` — forces AI to answer only real estate / MoveSmart questions
- `call_gemini(context, user_message)` — calls Groq API via `urllib.request`
  - Model: `llama-3.3-70b-versatile`, temperature 0.2, max_tokens 500
- `generate_domain_fallback(user_message)` — offline fallback response
- **Gotcha**: despite the name `gemini_client.py`, it calls **Groq API** — naming artifact from earlier design

#### `assistant/context_builder.py`
- Builds grounded context string from user profile + listing data to inject into AI prompts

#### `assistant/views.py`
- `AssistantView` — `POST /api/assistant/chat`

#### `assistant/serializers.py`
- `AssistantMessageSerializer` — validates `message` field

---

### `apps/commute/` — Commute Calculator

**Purpose**: Compute commute time from any locality to a work destination. Uses local coordinate registry first (zero-latency), falls back to Geoapify API.

#### `commute/maps_client.py`
- `AHMEDABAD_COORDS` — hardcoded coordinates for 100+ Ahmedabad/Gandhinagar localities
- `get_commute_estimate(origin, destination, mode)` — resolves coordinates, Haversine road distance, applies speed multipliers per mode
- `get_batch_commute_estimates(origin, destinations, mode)` — batch version
- `clear_commute_cache()` — clears MongoDB `commute_cache` collection
- **Reads**: `GEOAPIFY_API_KEY` from settings

#### `commute/views.py`
- `CommuteView` — `POST /api/commute`

---

### `apps/recommendations/` — Locality Recommendations

**Purpose**: Score and rank localities based on user profile (budget, work area, lifestyle, commute tolerance).

#### `recommendations/scoring.py`
- `AHMEDABAD_LOCALITIES_KNOWLEDGE` — base quality/lifestyle data for 35+ localities
- `score_localities(profile, localities)` — main scoring engine
  - Inputs: `max_budget`, `lifestyle_preference`, `max_commute_minutes`, `work_area`, `commute_mode`, `preferred_bhk`
  - Outputs ranked list with `composite_score`, `commute_minutes`, `avg_rent`, `vibes`
- Calls `commute/maps_client.py` for distance calculation

#### `recommendations/ranking.py`
- Sorts scored localities by composite score

#### `recommendations/views.py`
- `RecommendationsView` — `GET /api/recommendations`

---

### `apps/cost_of_living/` — Cost of Living Estimator

**Purpose**: Monthly cost breakdown for any Ahmedabad locality.

#### `cost_of_living/estimator.py`
- `LOCALITY_BENCHMARKS` — base 2BHK rent data for 31 localities
- `estimate_cost_of_living(locality, rent_budget, bhk, household_type, lifestyle, commute_mode)` — returns groceries, utilities, dining, transport, entertainment, total, savings potential
- `_get_locality_rent_stats(locality, bhk)` — queries MongoDB for real rent data

#### `cost_of_living/views.py`
- `CostOfLivingView` — `POST /api/cost-of-living`

---

### `apps/company/` — Company HR Portal

**Purpose**: Corporate relocation management — employees, relocation batches, budget tracking, leads, commissions, expenses.

#### `company/views.py`
- Largest views file (~23KB): `EmployeeListView`, `EmployeeDetailView`, `RelocationBatchView`, `ClientsView`, `LeadsView`, `BulkSearchView`, `CommissionView`, `ExpensesView`, `FeedbackView`, `CompanyReportsView`

#### `company/services.py`
- Business logic for relocation batch creation, employee assignment, lead conversion

#### `company/serializers.py`
- Serializers for employee, relocation batch, client, lead, commission, expense

---

### `apps/enquiries/` — Property Enquiries

#### `enquiries/views.py`
- `EnquiryView` — `POST/GET /api/enquiries`
- Calls `db/listings_repo.increment_enquiry_count()` on creation

---

### `apps/messages/` — Direct Messaging

#### `messages/views.py`
- `ConversationsView`, `ConversationMessagesView`, `SendMessageView`

#### `messages/apps.py`
- Defines `AppConfig` with `ready()` for signal handlers

---

### `apps/notifications/` — Notifications

#### `notifications/views.py`
- `NotificationsView` — `GET/POST /api/notifications`
- `NotificationDetailView` — `PATCH /api/notifications/:id` (mark as read)

---

### `apps/visits/` — Visit Scheduling

#### `visits/views.py`
- Seeker-facing: `VisitsView` — `GET/POST /api/visits`, `VisitDetailView`

#### `visits/owner_views.py`
- Owner-facing: `OwnerVisitsView` — visits for the owner's own properties

#### `visits/owner_urls.py`
- Separate URL module at `/api/owner/visits/`

#### `visits/serializers.py`
- `VisitSerializer` — listing_id, proposed_date, message

---

### `apps/admin_platform/` — Super Admin Platform

#### `admin_platform/views.py`
- `AdminDashboardKPIView`, `AdminUsersView`, `AdminCompaniesView`, `AdminAnalyticsView`

#### `admin_platform/serializers.py`
- `AdminUserUpdateSerializer` — admin-modifiable user fields

---

### `apps/platform/` — Platform Settings

#### `platform/views.py`
- `PlatformSettingsView` — `GET/PATCH /api/platform/settings` (admin only)
- `PublicPlatformSettingsView` — `GET /api/platform/settings/public` (no auth — polled by frontend on every page load)

---

### `apps/cms/`, `apps/audit/`, `apps/calendar/`, `apps/search/`, `apps/activity/`, `apps/reports/`

| App | Main View | Endpoint |
|-----|-----------|----------|
| `cms` | `CMSContentView` | `GET/POST/PATCH /api/cms/content` |
| `audit` | `AuditLogView` | `GET /api/audit/logs` |
| `calendar` | `CalendarEventsView` | `GET/POST /api/calendar/events` |
| `search` | `GlobalSearchView` | `GET /api/search?q=...` |
| `activity` | `ActivityView` | `GET /api/activity` |
| `reports` | `ReportsView` | `GET /api/reports` |

---

### `apps/common/` — Shared Utilities (No URL Routes)

#### `common/constants.py`
- `UserRoles` — `FIND_ACCOMMODATION`, `PROPERTY_OWNER`, `BROKER`, `COMPANY_HR`, `ADMIN`
- `ListingStatus` — `PENDING_REVIEW`, `APPROVED`, `REJECTED`
- `DealType` — `RENT`, `BUY`
- `LeadStatus` — `NEW`, `CONTACTED`, `CONVERTED`, `LOST`
- `RelocationBatchStatus` — `OPEN`, `IN_PROGRESS`, `COMPLETED`

#### `common/exceptions.py`
- `custom_exception_handler(exc, context)` — global DRF exception handler
- Returns `{success, message, data, errors}` shape; prevents raw stack traces

#### `common/responses.py`
- `api_response(data, message, status_code, errors)` — standardized response wrapper

#### `common/validators.py`
- Shared validation helpers (email, phone, etc.)

#### `common/views.py`
- `HealthCheckView` — `GET /api/health` → `{status: ok}`

---

## `db/` — Repository Layer (PyMongo DAOs)

**Purpose**: The ONLY layer that touches MongoDB. Apps call `db/*_repo.py` — never call `get_db()` directly.

### `db/connection.py`
- `get_db()` — lazy singleton PyMongo client
- `_ensure_indexes(db)` — creates all indexes (email unique, listing geospatial, commute_cache TTL, etc.)

### `db/indexes.py`
- `ensure_indexes()` — standalone index creation function for ingestion scripts

### `db/listings_repo.py` — Most Critical Repo
- **Single source of truth** for `status=approved` filter (FR-3)
- `get_approved_listings_paginated(filters, page, page_size)` — paginated approved listings
- `get_approved_listings(filters, limit)` — non-paginated version
- `get_owner_listings(owner_id)` — all owner's listings (any status)
- `get_listing_by_id(listing_id, include_non_approved)` — single listing
- `increment_view_count(listing_id)` — atomic `$inc`
- `increment_enquiry_count(listing_id)` — atomic `$inc`
- `create_listing(listing_data)` — defaults: `status=pending_review`, `spid`, GeoJSON coordinates
- `update_listing(listing_id, data)` — **resets status to `pending_review`** on any update
- `set_listing_status(listing_id, status, rejection_reason)` — admin approve/reject
- `delete_listing(listing_id)` — handles both ObjectId and string IDs

### `db/users_repo.py`
- `get_user_by_id`, `get_user_by_email`, `create_user_record`
- `set_user_role` — raises `ValueError` if role already set
- `update_user_role_profile`, `update_user_password`, `delete_user_record`
- `unlock_feature(user_id, feature)` — adds to `unlocked_features` array (Razorpay payment result)

### Other Repos Summary

| File | MongoDB Collection | Key Purpose |
|------|--------------------|-------------|
| `activity_repo.py` | `activity` | log + fetch user activity events |
| `admin_platform_repo.py` | multiple | admin KPIs, user mgmt, company mgmt |
| `approvals_repo.py` | `approvals` | admin approval workflow |
| `audit_repo.py` | `audit_logs` | admin action logging |
| `broker_assignments_repo.py` | `broker_assignments` | broker↔listing assignment |
| `calendar_repo.py` | `calendar_events` | calendar CRUD |
| `clients_repo.py` | `clients` | broker CRM clients |
| `cms_repo.py` | `cms_content` | content CRUD |
| `commissions_repo.py` | `commissions` | broker commissions |
| `commute_cache_repo.py` | `commute_cache` | cache commute results (TTL) |
| `company_reports_repo.py` | multiple | company analytics |
| `employees_repo.py` | `employees` | HR employee management |
| `enquiries_repo.py` | `enquiries` | enquiry CRUD |
| `expenses_repo.py` | `expenses` | relocation expenses |
| `feedback_repo.py` | `feedback` | user feedback |
| `leads_repo.py` | `leads` | broker lead pipeline |
| `messages_repo.py` | `messages`, `conversations` | messaging |
| `notifications_repo.py` | `notifications` | notifications |
| `platform_settings_repo.py` | `platform_settings` | maintenance mode, feature flags |
| `relocation_batches_repo.py` | `relocation_batches` | HR batch relocation |
| `reports_repo.py` | `reports` | report data |
| `saved_items_repo.py` | `saved_items` | bookmarked listings |
| `search_repo.py` | multiple | cross-collection search |
| `tasks_repo.py` | `tasks` | broker tasks |
| `visits_repo.py` | `visits` | visit scheduling |

---

## `ml/` — Machine Learning Pipelines

### `ml/shared/feature_engineering.py`
- `LOCALITY_ENCODING` — numeric encoding for 7 localities
- `prepare_features(listing_dict)` — shared extractor used at both train AND infer time
  - Vector: `[bhk, area_sqft, price, price_per_sqft, furnishing_encoded, amenities_count, locality_code]`
  - **Critical rule**: must be identical in `train.py` and `model.py` or model breaks

### `ml/rent_prediction/model.py`
- `load_model()` — loads XGBoost Booster from `artifacts/rent_model.json`
- `predict_fair_price(listing_features)` — returns `{predicted_fair_rent, lower_range, upper_range, confidence}`
  - `deal_type='buy'`: heuristic (price × 0.97), not ML
  - `deal_type='rent'`: XGBoost inference

### `ml/rent_prediction/train.py`
- Trains XGBoost on MongoDB listing data → saves `artifacts/rent_model.json`
- Run manually when retraining

### `ml/suspicious_listing/model.py`
- `load_model()` — loads scikit-learn `IsolationForest` from `artifacts/suspicious_listing_model.pkl`
- `predict_suspicious(listing_features)` — returns `{is_suspicious, confidence, reason, checked_at}`
  - `-1` from IsolationForest = suspicious (anomaly), `1` = normal

### `ml/suspicious_listing/train.py`
- Trains Isolation Forest on MongoDB listings → saves `artifacts/suspicious_listing_model.pkl`

---

## `data_ingestion/` — Seed Data Loaders

### `data_ingestion/ingest_all.py`
- Master runner: ensure indexes → load 99acres → load rent → load buy
- Usage: `python movesmart/backend/data_ingestion/ingest_all.py`

### `data_ingestion/load_99acres_condensed.py`
- Reads `data/99acres_properties_condensed.json`, normalizes, upserts into `listings` with `status=approved`

### `data_ingestion/load_rent_listings.py`
- Reads `data/resident_rent.json` (15MB), normalizes rental fields, inserts into MongoDB

### `data_ingestion/load_buy_listings.py`
- Reads `data/buy_resident_latest.json` (13MB), normalizes buy listing fields, inserts into MongoDB

---

## `tests/` — API Integration Tests

### `tests/__init__.py`
- Sets up `DJANGO_SETTINGS_MODULE`, imports test modules

### `tests/test_auth.py`
- Tests register, login, token refresh flows

### `tests/test_health.py`
- Tests `GET /api/health`

### `tests/test_listings.py`
- Tests listing creation, retrieval, filtering

### `tests/test_ml.py`
- Tests ML inference endpoints

---

## Root-Level Backend Files

### `manage.py`
- Standard Django management script

### `requirements.txt`
- Locked dependencies: `django==5.0.6`, `djangorestframework==3.15.2`, `djangorestframework-simplejwt==5.3.1`, `pymongo==4.8.0`, `xgboost==2.0.3`, `scikit-learn==1.9.0`, `python-dotenv==1.0.1`, `requests==2.32.3`, `django-cors-headers==4.4.0`, `razorpay==2.0.1`

### `.env` / `.env.example`
- Secrets file — never commit `.env`

### `test_platform_settings.py`
- Standalone test script for platform settings functionality

---

## How This Connects to Other Parts of the App

```
frontend/ (React)
    │  HTTP via axios (lib/api.js) — base URL: /api
    ▼
backend/config/urls.py  →  apps/*/views.py
                                │
                          apps/*/services.py (optional)
                                │
                          db/*_repo.py (PyMongo queries)
                                │
                          MongoDB (movesmart_db)

backend/ml/              → called by apps/listings/views.py at listing creation
backend/data_ingestion/  → called once at setup; reads from data/*.json
```

- **All API responses** use `{success, message, data, errors}` wrapper (via `common/responses.py`)
- **Auth**: stateless JWT in `Authorization: Bearer <token>` header; `refresh_token` in localStorage
- **No Django sessions**, no Django ORM, no relational database

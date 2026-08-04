# MoveSmart — Smart Relocation & Accommodation Platform for Urban India

MoveSmart is a full-stack smart relocation platform designed to solve urban housing discovery and relocation friction in Indian cities (initially launched in Ahmedabad). The platform features role-based user onboarding, a rule-based district scoring recommendation engine, an admin listing review queue, property owner and broker management portals, corporate HR relocation batch management, a grounded Gemini AI assistant, XGBoost rent price range estimation, and Isolation Forest suspicious listing anomaly detection.

---

## Technical Architecture

```
                 ┌──────────────────────────────────────────────┐
                 │       MoveSmart Web Application (SPA)        │
                 │          React 18 + Tailwind CSS             │
                 └──────────────────────┬───────────────────────┘
                                        │ (JWT Bearer Token)
                                        ▼
                 ┌──────────────────────────────────────────────┐
                 │           Django REST Framework API          │
                 │         Python 3.11+ / Django 5.x            │
                 └──────┬───────────────┬───────────────┬───────┘
                        │               │               │
                        ▼               ▼               ▼
                 ┌────────────┐   ┌────────────┐   ┌────────────┐
                 │  PyMongo   │   │  Gemini AI │   │  ML Engine │
                 │ Data Layer │   │ Assistant  │   │ XGBoost &  │
                 └─────┬──────┘   └────────────┘   │ Iso Forest │
                       │                           └────────────┘
                       ▼
                 ┌────────────┐
                 │  MongoDB   │
                 │ Database   │
                 └────────────┘
```

---

## 1. Project Features & Core Modules

### 👤 Role-Based System (`apps/accounts`)
- **Seeker (`find_accommodation`)**: Onboarding preferences, weighted locality scoring, approved property browsing, saved bookmarks, cost of living estimator, commute calculator, Gemini AI guide.
- **Property Owner (`property_owner`)**: Listing creation (`pending_review` state), listing management, rejection reason banner, resubmission workflow, analytics view counter.
- **Broker / Agent (`broker`)**: Multi-owner listing submission, lead pipeline board (`new` -> `contacted` -> `converted` | `lost`), commission logger for converted leads, AI Client Matcher.
- **Company HR (`company`)**: Corporate relocation batches, embedded employee rosters, bulk housing search (reusing recommendation engine), employee housing allocation, server-side dynamic budget tracking, JSON relocation report exporter.
- **Admin Review Queue (`admin_review`)**: Review queue dashboard, mandatory rejection reasoning, approval action trigger.

### 🤖 Intelligence & ML (`apps/assistant`, `ml/`)
- **Grounded Gemini AI Assistant**: `POST /api/assistant/chat` with structured context builder, prompt safety sanitization, and graceful quota fallback.
- **XGBoost Fair Rent Predictor**: `GET /api/listings/:id/rent-prediction` producing fair rent range and confidence score.
- **Isolation Forest Anomaly Signal**: `GET /api/listings/:id/trust-score` returning non-accusatory anomaly feedback.

---

## 2. Environment Variables (`.env`)

Create a `.env` file inside `movesmart/backend/`:

```env
DJANGO_SECRET_KEY=your-django-production-secret-key
DJANGO_DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,testserver

MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority
DATABASE_NAME=movesmart_db

JWT_SECRET=your-jwt-signing-secret
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=60

GEMINI_API_KEY=your-google-gemini-api-key
MAPS_API_KEY=your-google-maps-api-key

CORS_ALLOWED_ORIGINS=http://localhost:3000
```

---

## 3. Installation & Local Setup

### Backend Setup (Django + DRF + PyMongo)

```bash
cd movesmart/backend

# 1. Create and activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Train ML Model Artifacts (Offline)
python ml/rent_prediction/train.py
python ml/suspicious_listing/train.py

# 4. Automate MongoDB Collection Indexes
python db/indexes.py

# 5. Run Django Unit Test Suite
python -m unittest discover tests

# 6. Start Local Django Dev Server
python manage.py runserver
```

### Frontend Setup (React + Tailwind CSS)

```bash
cd movesmart/frontend

# 1. Install NPM packages
npm install

# 2. Start Vite / React Dev Server
npm run dev
```

---

## 4. API Endpoints Overview

| App | Method | Endpoint | Description | Allowed Roles |
|---|---|---|---|---|
| Accounts | `POST` | `/api/auth/register` | Register new user account | Any |
| Accounts | `POST` | `/api/auth/login` | Login & receive JWT | Any |
| Accounts | `POST` | `/api/auth/role` | Select user role & save onboarding | Authenticated |
| Listings | `GET` | `/api/listings` | Browse approved property listings | Any |
| Listings | `POST` | `/api/listings` | Create property listing (`pending_review`) | Owner / Broker |
| Listings | `GET` | `/api/listings/:id` | View listing details & ML predictions | Any / Owner |
| Listings | `GET` | `/api/listings/:id/rent-prediction` | XGBoost fair rent price range | Any |
| Listings | `GET` | `/api/listings/:id/trust-score` | Isolation Forest trust signal | Any |
| Admin | `GET` | `/api/admin/review-queue` | List pending review listings | Admin |
| Admin | `POST` | `/api/admin/listings/:id/approve` | Approve listing for public search | Admin |
| Admin | `POST` | `/api/admin/listings/:id/reject` | Reject listing with mandatory reason | Admin |
| Recommendations | `POST` | `/api/recommendations/areas` | Weighted locality scoring engine | Authenticated |
| Assistant | `POST` | `/api/assistant/chat` | Grounded Gemini AI relocation assistant | Authenticated |
| Broker | `GET` | `/api/leads` | Fetch broker lead pipeline | Broker |
| Broker | `POST` | `/api/commissions` | Log commission for `converted` lead | Broker |
| Company | `GET` | `/api/company/relocation-batches` | List company relocation batches | Company HR |
| Company | `POST` | `/api/company/relocation-batches/:id/search` | Bulk housing search (reuses scoring) | Company HR |
| Health | `GET` | `/api/health` | System health & monitoring endpoint | Any |

---

## 5. MongoDB Collections Schema Summary

- `users`: User profiles, credentials hash, role, role_profile object.
- `listings`: Property listings (`status`: `"pending_review"`, `"approved"`, `"rejected"`).
- `saved_items`: Bookmarked listings (`user_id`, `listing_id`).
- `enquiries`: Property enquiries sent to owners/brokers.
- `leads`: Broker CRM lead entries (`lead_status`: `"new"`, `"contacted"`, `"converted"`, `"lost"`).
- `commissions`: Commission audit logs for `converted` leads.
- `relocation_batches`: Corporate relocation batches with embedded `employees[]` and `allocations[]`.
- `commute_cache`: Cached travel matrices with TTL index on `expires_at`.

---

## 6. Production Deployment Instructions

1. **Database Deployment**: Deploy MongoDB Atlas cluster and set `MONGO_URI` in production secrets. Run `python db/indexes.py` to build collection indexes.
2. **Backend Deployment**: Deploy Django backend to Gunicorn / App Platform (e.g. Railway, Render, AWS App Runner). Set `DJANGO_DEBUG=False` and configure `GEMINI_API_KEY`.
3. **Frontend Deployment**: Build React production bundle via `npm run build` and deploy static assets to Vercel / Netlify / Cloudflare Pages.

---

## 7. License & Authors

Developed for MoveSmart Urban Relocation Platform. Built using Python, Django, DRF, PyMongo, MongoDB, React, Tailwind CSS, XGBoost, Scikit-learn, and Google Gemini API.

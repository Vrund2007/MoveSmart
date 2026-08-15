<div align="center">
  <img src="movesmart/frontend/public/smart-Building.png" width="64" alt="MoveSmart Logo" />
  <h1>MoveSmart</h1>
  <p><strong>Smart Relocation & Accommodation Platform for Urban India</strong></p>

  [![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
  [![Django](https://img.shields.io/badge/Django-5.0.6-092E20?style=flat&logo=django&logoColor=white)](https://www.djangoproject.com/)
  [![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.6-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-4.8.0-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![XGBoost](https://img.shields.io/badge/XGBoost-2.0.3-FF6F00?style=flat&logo=xgboost&logoColor=white)](https://xgboost.ai/)
  [![Google Gemini](https://img.shields.io/badge/Google_Gemini-1.5_/_2.0-8E75B2?style=flat&logo=googlegemini&logoColor=white)](https://ai.google.dev/)
  [![Three.js](https://img.shields.io/badge/Three.js-0.160.0-000000?style=flat&logo=three.js&logoColor=white)](https://threejs.org/)
  [![GSAP](https://img.shields.io/badge/GSAP-3.15.0-88CE02?style=flat&logo=greensock&logoColor=white)](https://greensock.com/gsap/)
</div>

---

## 📌 Overview

**MoveSmart** is an intelligent, full-stack smart relocation and housing discovery platform engineered to address urban housing friction and relocation challenges across Indian tier-1 & tier-2 cities (initially launched in **Ahmedabad**).

The platform bridges the gap between accommodation seekers, property owners, certified brokers, and corporate HR teams by combining a **weighted district recommendation engine**, **Grounded AI conversational assistance (Google Gemini)**, **XGBoost fair rent estimation**, and **Isolation Forest anomaly detection for trust verification**.

---

## 🛠️ Technology Stack

MoveSmart is built with modern, industry-standard technologies organized into decoupled frontend and backend layers:

### **Frontend Architecture**
- **Framework & UI Library**: React 18.3.1 (SPA with Vite / React Scripts)
- **Styling & Design Token System**: Tailwind CSS 3.4.6, PostCSS, Custom CSS Variables (Design System Tokenized)
- **3D City Visualization**: Three.js 0.160.0, `@react-three/fiber` 8.17.10, `@react-three/drei` 9.121.5 (Interactive 3D GLB City Model)
- **Animations & Scrollytelling**: GSAP 3.15.0 (`@gsap/react`, `ScrollTrigger`, `ScrollSmoother`, `SplitText`, `Draggable`)
- **Icons & Typography**: Lucide React icons, Inter typography via Google Fonts
- **HTTP Client**: Axios 1.7.2 with centralized JWT request/response interceptors

### **Backend Architecture**
- **Core Framework**: Python 3.11+, Django 5.0.6, Django REST Framework (DRF) 3.15.2
- **Authentication**: JWT Bearer Tokens via `djangorestframework-simplejwt` 5.3.1
- **Database & Data Layer**: PyMongo 4.8.0 (Direct schema-less MongoDB integration without Django ORM overhead)
- **Server Middleware**: WhiteNoise 6.7.0 (Static asset handling), `django-cors-headers` 4.4.0 (CORS management)
- **WSGI Production Server**: Gunicorn 22.0.0

### **Artificial Intelligence & Machine Learning**
- **Grounded AI Relocation Assistant**: Google Gemini API (`google-generativeai` 0.7.2) with context-bound prompt sanitization and fallback mechanisms
- **Fair Rent Estimation Engine**: XGBoost Regressor (`xgboost` 2.0.3, `scikit-learn` 1.9.0) producing expected rent ranges and confidence intervals
- **Listing Trust & Anomaly Detection**: Isolation Forest (`scikit-learn` 1.9.0) analyzing multi-feature listing outliers

### **Database & Data Storage**
- **Database**: MongoDB 6.0+ (MongoDB Atlas Cloud Cluster or local MongoDB instance)
- **Collections & Indexes**: Compound geospatial, text, and TTL indexing managed via `backend/db/indexes.py`

---

## 📐 System Architecture

```
                               ┌──────────────────────────────────────────────┐
                               │       MoveSmart Web Application (SPA)        │
                               │  React 18 + Tailwind CSS + Three.js + GSAP   │
                               └──────────────────────┬───────────────────────┘
                                                      │ (JWT Bearer Token / HTTPS)
                                                      ▼
                               ┌──────────────────────────────────────────────┐
                               │           Django REST Framework API          │
                               │         Python 3.11+ / Django 5.0.6          │
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

## 👥 Roles & Platform Modules

MoveSmart features strict Role-Based Access Control (RBAC) supporting 5 specialized user personas:

### 1. 👤 **Accommodation Seeker (`find_accommodation`)**
- **Onboarding Questionnaire**: Budget range, preferred transit modes, lifestyle priorities (Safety, Connectivity, Budget, Lifestyle).
- **Locality Recommendation Engine**: Multi-criteria weighted scoring algorithm evaluating 12+ Ahmedabad districts.
- **Listing Discovery & Search**: Filter approved property listings by locality, budget, bedrooms, amenities, and commute duration.
- **Grounded Gemini AI Assistant**: Interactive chatbot answering location-specific moving, legal, neighborhood, and living query contexts.
- **Bookmarks & Enquiries**: Save favorite listings and submit direct property inquiry forms.

### 2. 🏠 **Property Owner (`property_owner`)**
- **Listing Submission Flow**: Submit new properties requiring mandatory admin approval (`status: pending_review`).
- **Listing Management Dashboard**: View listing statuses (`pending_review`, `approved`, `rejected`), view counts, and inquiry counts.
- **Resubmission & Rejection Notice**: Clear rejection reason banners allowing owners to edit and resubmit corrected listings.

### 3. 💼 **Certified Broker / Agent (`broker`)**
- **Multi-Owner Listing Management**: Create and manage property listings on behalf of multiple property owners.
- **CRM Lead Pipeline**: Interactive kanban board tracking client leads through status stages: `new` ➔ `contacted` ➔ `converted` | `lost`.
- **Commission Tracker**: Log commission fees for converted leads with automated earnings summaries.
- **AI Client Matcher**: Match broker portfolio listings against seeker relocation preferences.

### 4. 🏢 **Company HR Relocation Lead (`company`)**
- **Relocation Batch Management**: Create corporate employee relocation batches (e.g., Tech Hires Q3).
- **Employee Roster & Allocation**: Bulk import employees, assign housing allocations, and track relocation progress.
- **Bulk Housing Recommendation Engine**: Reuses seeker scoring engine across entire employee cohorts.
- **Budget Tracking & JSON Exporter**: Server-side real-time corporate budget tracking and one-click JSON report generation.

### 5. 🛡️ **Admin Queue Reviewer (`admin_review`)**
- **Listing Review Queue**: Review submitted owner/broker property listings before public search visibility.
- **One-Click Approval / Rejection**: Approve listings (`status: approved`) or reject listings with mandatory feedback (`status: rejected`).
- **Platform Analytics**: Monitor active listings, review backlog, and trust anomaly flags.

---

## 📂 Project Directory Structure

```
MoveSmart/
├── README.md                           # Main Project Documentation (This File)
├── Codebase Understanding/             # Architecture overview docs & specifications
└── movesmart/
    ├── .env                            # Unified local environment secrets
    ├── .env.example                    # Sample environment configurations template
    ├── Memory.md                       # Development log & implementation history
    ├── render.yaml                     # Production Render deployment manifest
    ├── scratch_test_groq.py            # Utility script for LLM benchmark tests
    │
    ├── backend/                        # Django REST Framework Backend
    │   ├── manage.py                   # Django CLI management executable
    │   ├── requirements.txt            # Locked Python dependencies
    │   ├── Procfile                    # Web process config for deployment
    │   ├── config/                     # Django core settings & URL routing
    │   │   ├── settings.py             # App configuration reading from .env
    │   │   ├── urls.py                 # Root API routing table
    │   │   └── wsgi.py                 # WSGI entry point
    │   ├── apps/                       # Modular Django application apps
    │   │   ├── accounts/               # Auth, registration, role management
    │   │   ├── admin_review/           # Listing approval queue
    │   │   ├── assistant/              # Grounded Gemini AI chat handler
    │   │   ├── broker/                 # Broker CRM & lead pipeline
    │   │   ├── company/                # Corporate relocation batches
    │   │   ├── listings/               # Property listing CRUD & search
    │   │   ├── recommendations/        # Locality weighted scoring engine
    │   │   ├── commute/                # Commute matrix calculator & cache
    │   │   └── cost_of_living/         # Cost of living estimator
    │   ├── db/                         # MongoDB database access layer & indexing
    │   │   ├── connection.py           # PyMongo client singleton
    │   │   └── indexes.py              # Automated collection index builder
    │   ├── ml/                         # Machine learning model pipelines
    │   │   ├── rent_prediction/        # XGBoost fair rent model & training
    │   │   └── suspicious_listing/     # Isolation Forest anomaly detector
    │   └── tests/                      # Automated unit test suites
    │
    ├── frontend/                       # React 18 + Tailwind CSS Frontend
    │   ├── package.json                # Frontend dependencies & scripts
    │   ├── tailwind.config.js          # Custom color tokens & Inter font styling
    │   ├── public/                     # Static public assets
    │   │   ├── smart-Building.png      # MoveSmart Logo Asset
    │   │   └── model.glb               # 3D City Model GLB Asset
    │   └── src/                        # Application source code
    │       ├── App.jsx                 # Route manager & top-level layout
    │       ├── api/                    # Axios API integration modules
    │       ├── components/             # Reusable UI components & 3D canvases
    │       │   ├── hero/               # 3D City Model canvas & hero section
    │       │   └── common/             # Badges, toasts, cards, navbars
    │       ├── pages/                  # Top-level view pages (Landing, Login, Dashboard)
    │       └── styles/                 # Tailwind directives & entrance keyframes
    │
    ├── data/                           # Seed datasets & locality geo-matrices
    └── scripts/                        # Ingestion & setup scripts
```

---

## ⚙️ Environment Variables (`.env`)

Create a `.env` file in `movesmart/` or `movesmart/backend/` using the following keys:

```env
# -----------------------------------------------------------------------------
# Django Core Settings
# -----------------------------------------------------------------------------
DJANGO_SECRET_KEY=django-insecure-your-super-secret-key-change-this-in-production
DJANGO_DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,testserver

# -----------------------------------------------------------------------------
# Database Configuration (MongoDB Atlas or Local MongoDB)
# -----------------------------------------------------------------------------
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
DATABASE_NAME=movesmart_db

# -----------------------------------------------------------------------------
# Authentication & JWT Configuration
# -----------------------------------------------------------------------------
JWT_SECRET=your-jwt-signing-secret-key
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=60

# -----------------------------------------------------------------------------
# External APIs & Services
# -----------------------------------------------------------------------------
GEMINI_API_KEY=your-google-gemini-api-key
MAPS_API_KEY=your-google-maps-api-key

# -----------------------------------------------------------------------------
# CORS Configuration
# -----------------------------------------------------------------------------
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

---

## 🚀 Step-by-Step Installation & Local Setup

### **Prerequisites**
Ensure you have the following installed on your machine:
- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **Python**: v3.11.0 or higher ([Download](https://www.python.org/))
- **MongoDB**: A running local MongoDB instance (`mongodb://localhost:27017`) or a free [MongoDB Atlas Cluster](https://www.mongodb.com/cloud/atlas).

---

### **1. Clone the Repository**
```bash
git clone https://github.com/your-username/MoveSmart.git
cd MoveSmart
```

---

### **2. Backend Setup (Django + PyMongo + ML)**

Navigate to the backend directory and set up Python environment:

```bash
cd movesmart/backend

# Step 2.1: Create virtual environment
python -m venv venv

# Step 2.2: Activate virtual environment
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

# Step 2.3: Install backend dependencies
pip install -r requirements.txt

# Step 2.4: Create environment file
# Copy .env.example to .env and configure your MONGO_URI & GEMINI_API_KEY
cp ../.env.example .env

# Step 2.5: Build MongoDB Collection Indexes
python db/indexes.py

# Step 2.6: Train ML Models (Offline Training Step)
python ml/rent_prediction/train.py
python ml/suspicious_listing/train.py

# Step 2.7: Run Backend Unit Tests
python -m unittest discover tests

# Step 2.8: Start Django Development Server
python manage.py runserver
```

The Django REST API backend will start at:  
👉 **`http://localhost:8000/`** (Health check endpoint: `http://localhost:8000/api/health`)

---

### **3. Frontend Setup (React + Tailwind + Three.js)**

Open a new terminal window and navigate to the frontend directory:

```bash
cd MoveSmart/movesmart/frontend

# Step 3.1: Install NPM dependencies
npm install

# Step 3.2: Launch React Development Server
npm run dev # or npm start
```

The React frontend web application will open at:  
👉 **`http://localhost:3000/`**

---

## 🌐 API Endpoint Quick Reference

| Module | Method | Endpoint | Description | Auth Required |
|---|---|---|---|---|
| **Auth** | `POST` | `/api/auth/register` | Register new user account | No |
| **Auth** | `POST` | `/api/auth/login` | Authenticate user & issue JWT | No |
| **Auth** | `POST` | `/api/auth/role` | Select role & complete onboarding | Yes |
| **Listings** | `GET` | `/api/listings` | Search & browse approved listings | No |
| **Listings** | `POST` | `/api/listings` | Create property listing (`pending_review`) | Yes (Owner/Broker) |
| **Listings** | `GET` | `/api/listings/:id` | View single listing details | No |
| **ML Models** | `GET` | `/api/listings/:id/rent-prediction` | XGBoost predicted fair rent range | No |
| **ML Models** | `GET` | `/api/listings/:id/trust-score` | Isolation Forest trust anomaly score | No |
| **Scoring** | `POST` | `/api/recommendations/areas` | Locality weighted scoring recommendation | Yes |
| **AI Assistant** | `POST` | `/api/assistant/chat` | Grounded Gemini relocation assistant | Yes |
| **Broker** | `GET` | `/api/leads` | Fetch broker CRM leads | Yes (Broker) |
| **Broker** | `POST` | `/api/commissions` | Log lead conversion commission | Yes (Broker) |
| **Company HR** | `GET` | `/api/company/relocation-batches` | List corporate relocation batches | Yes (Company HR) |
| **Company HR** | `POST` | `/api/company/relocation-batches/:id/search` | Bulk relocation cohort search | Yes (Company HR) |
| **Admin** | `GET` | `/api/admin/review-queue` | List listings pending approval | Yes (Admin) |
| **Admin** | `POST` | `/api/admin/listings/:id/approve` | Approve property listing | Yes (Admin) |
| **Admin** | `POST` | `/api/admin/listings/:id/reject` | Reject listing with reason | Yes (Admin) |
| **System** | `GET` | `/api/health` | Health & system monitoring | No |

---

## 🗄️ Database Collections Summary

MoveSmart operates on MongoDB schema-less collections optimized with PyMongo:

- `users`: User authentication credentials, profiles, assigned role, and role-specific metadata.
- `listings`: Property inventory (`status`: `"pending_review"`, `"approved"`, `"rejected"`), rent price, specs, locality, amenities, and owner/broker IDs.
- `saved_items`: Seeker bookmarked property listings.
- `enquiries`: Direct tenant-to-owner property inquiries.
- `leads`: Broker CRM leads pipeline (`lead_status`: `"new"`, `"contacted"`, `"converted"`, `"lost"`).
- `commissions`: Financial audit logs for broker converted leads.
- `relocation_batches`: Corporate HR batches with embedded `employees[]` rosters and allocations.
- `commute_cache`: Matrix distance & travel duration cache with TTL indexes.

---

## 🧪 Testing & Quality Assurance

MoveSmart includes automated unit tests for backend API routes, role permissions, and ML engine endpoints:

```bash
cd movesmart/backend

# Run all test suites
python -m unittest discover tests

# Test specific app suite (e.g. listings)
python -m unittest tests.test_listings
```

---

## 🚢 Production Deployment

1. **MongoDB Atlas**: Deploy a MongoDB cluster, create a database user, and configure `MONGO_URI` in production secrets. Run `python db/indexes.py`.
2. **Backend (Render / App Runner / Railway)**: Deploy Django backend using Gunicorn (`gunicorn config.wsgi:application`). Set `DJANGO_DEBUG=False` and set production environment variables.
3. **Frontend (Vercel / Netlify)**: Build frontend static bundle using `npm run build` and connect to backend API domain.

---

## 📜 License & Acknowledgments

Designed & Developed for the **MoveSmart Urban Relocation Platform**.  
Built using Python, Django, DRF, PyMongo, MongoDB, React, Tailwind CSS, Three.js, GSAP, XGBoost, Scikit-Learn, and Google Gemini API.

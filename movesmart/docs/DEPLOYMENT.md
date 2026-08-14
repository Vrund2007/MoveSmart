# MoveSmart Production Deployment Guide

This guide details how to deploy the **MoveSmart** platform (Django REST Backend + React Frontend + MongoDB) to cloud hosting environments (such as Render, Vercel, Railway, or AWS).

---

## 1. Overview of Deployment Architecture

```
                       ┌─────────────────────────┐
                       │   React Frontend (SPA)  │
                       │ (Vercel / Render Static)│
                       └────────────┬────────────┘
                                    │ HTTPS API Requests
                                    ▼
                       ┌─────────────────────────┐
                       │   Django Backend (WSGI) │
                       │    (Gunicorn + Render)  │
                       └────────────┬────────────┘
                                    │ PyMongo
                                    ▼
                       ┌─────────────────────────┐
                       │  MongoDB Cloud (Atlas)  │
                       └─────────────────────────┘
```

---

## 2. Environment Variables Matrix

### Backend Environment Variables (`backend/.env`)

| Variable | Description | Production Example |
| :--- | :--- | :--- |
| `DJANGO_SECRET_KEY` | Cryptographic key for session/token security | `django-prod-sec-key-...` |
| `DJANGO_DEBUG` | Enable/Disable debug mode | `False` |
| `ALLOWED_HOSTS` | Comma-separated allowed domain hosts | `backend.onrender.com,movesmart.app` |
| `MONGO_URI` | MongoDB Connection String | `mongodb+srv://user:pass@cluster.mongodb.net/` |
| `DATABASE_NAME` | Database name | `movesmart` |
| `CORS_ALLOWED_ORIGINS` | Allowed origins for cross-origin API calls | `https://movesmart.vercel.app` |
| `GROQ_API_KEY` | Groq LLaMA AI Guide key | `gsk_...` |
| `GEOAPIFY_API_KEY` | Geoapify Maps / Routing key | `43536...` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary storage cloud name | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `your-api-key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | `your-api-secret` |
| `RAZORPAY_KEY_ID` | Razorpay payment gateway Key ID | `rzp_live_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay payment gateway Secret | `secret_...` |

### Frontend Environment Variables (`frontend/.env`)

| Variable | Description | Production Example |
| :--- | :--- | :--- |
| `REACT_APP_API_URL` / `VITE_API_URL` | Base URL of deployed Django API | `https://movesmart-backend.onrender.com/api` |
| `REACT_APP_GEOAPIFY_API_KEY` / `VITE_GEOAPIFY_API_KEY` | Geoapify Key for location picker | `43536...` |
| `REACT_APP_CLOUDINARY_CLOUD_NAME` / `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name | `your-cloud-name` |

---

## 3. Step-by-Step Deployment Instructions

### Option A: Render One-Click Deployment (Recommended)

1. Connect your repository to **Render**.
2. Go to **Blueprints** -> **New Blueprint Instance**.
3. Select `render.yaml` from the root of the project repository.
4. Fill in the requested secret environment variables (`MONGO_URI`, `GROQ_API_KEY`, etc.).
5. Click **Apply**. Render will automatically build and deploy both the backend service and the frontend static site.

### Option B: Manual Backend & Frontend Split Deployment

#### 1. Backend (Render / Railway / Heroku)
- **Root Directory**: `movesmart/backend`
- **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --noinput`
- **Start Command**: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 2`
- Add all Backend Environment Variables.

#### 2. Frontend (Vercel / Netlify / Render Static)
- **Root Directory**: `movesmart/frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `build` (or `dist`)
- **Environment Variables**: Add `REACT_APP_API_URL` pointing to your deployed backend URL.

---

## 4. Post-Deployment Verification

1. Verify backend health endpoint: `GET /api/health` (Returns `{ "status": "ok" }`).
2. Verify static files collection: Static assets should be served via Whitenoise (`/static/...`).
3. Verify CORS: Ensure browser requests from frontend URL succeed without CORS preflight block.
4. Verify database seed: Run `python data_ingestion/load_rent_listings.py` if database is empty.

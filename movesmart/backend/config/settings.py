"""
config/settings.py — Django project settings (Architecture.md §2, §5)
Reads all secrets from environment variables via python-dotenv; no secrets hardcoded (Rules.md §5).
No ORM DATABASES block — MongoDB is accessed via PyMongo in db/ (Architecture.md §2).
"""
import os
from pathlib import Path
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# ─── Core ─────────────────────────────────────────────────────────────────────
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'change-me-in-env')
DEBUG = os.environ.get('DJANGO_DEBUG', 'True') == 'True'
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1,testserver').split(',')
if 'testserver' not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append('testserver')

# ─── Installed Apps ───────────────────────────────────────────────────────────
INSTALLED_APPS = [
    # Core app config (loads ML models once at startup)
    'config.apps.MoveSmartCoreConfig',

    # Django apps
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party apps
    'rest_framework',
    'corsheaders',

    # Your apps
    'apps.accounts',
    'apps.listings',
    'apps.admin_review',
    'apps.enquiries',
    'apps.broker',
    'apps.company',
    'apps.recommendations',
    'apps.commute',
    'apps.cost_of_living',
    'apps.assistant',
    'apps.visits',
    'apps.messages',
    'apps.payments',
    'apps.reviews',
    'apps.documents',
]

# ─── Middleware ────────────────────────────────────────────────────────────────
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',

    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',

    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',

    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# ─── Database ─────────────────────────────────────────────────────────────────
MONGO_URI = os.environ.get('MONGO_URI', '')
DATABASE_NAME = os.environ.get('DATABASE_NAME', 'movesmart_db')

# ─── Static files ─────────────────────────────────────────────────────────────
STATIC_URL = '/static/'

# ─── DRF ──────────────────────────────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'apps.accounts.authentication.MongoJWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'EXCEPTION_HANDLER': 'apps.common.exceptions.custom_exception_handler',
}

# ─── JWT ──────────────────────────────────────────────────────────────────────
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(
        minutes=int(os.environ.get('JWT_ACCESS_TOKEN_LIFETIME_MINUTES', 60))
    ),
    'SIGNING_KEY': os.environ.get('JWT_SECRET', SECRET_KEY),
}

# ─── CORS ─────────────────────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = os.environ.get(
    'CORS_ALLOWED_ORIGINS', 'http://localhost:3000'
).split(',')
CORS_ALLOW_CREDENTIALS = True

# ─── External APIs ────────────────────────────────────────────────────────────
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
MAPS_API_KEY = os.environ.get('MAPS_API_KEY', '')

# ─── Default auto field ───────────────────────────────────────────────────────
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

"""
Django settings for TraceScene AI backend.

This file wires together every app in Section 20 of the PRD and reads all
tunable values (SigNoz connection, correlation thresholds, OTel target) from
environment variables per Section 37, so nothing sensitive is hardcoded.
"""
import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


def env_bool(name: str, default: bool) -> bool:
    return os.environ.get(name, str(default)).lower() in ("1", "true", "yes")


def env_list(name: str, default: str) -> list:
    return [item.strip() for item in os.environ.get(name, default).split(",") if item.strip()]


SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "insecure-dev-key-change-me")
DEBUG = env_bool("DJANGO_DEBUG", True)
ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework.authtoken",
    "corsheaders",
    "django_filters",
    # TraceScene AI apps (Section 20)
    "accounts",
    "services",
    "cases",
    "evidence",
    "findings",
    "integrations",
    "assistant",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# MVP uses SQLite (Section 21). Models deliberately avoid SQLite-specific
# field types so the Postgres upgrade path (Section 39) only requires
# changing DATABASE_URL + installing psycopg2-binary.
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --- DRF (Section 22) ---
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_PAGINATION_CLASS": "common.pagination.StandardResultsSetPagination",
    "PAGE_SIZE": 20,
    "EXCEPTION_HANDLER": "common.exceptions.standard_exception_handler",
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.ScopedRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "webhook": "60/min",
        "assistant": "30/min",
    },
}

# --- CORS (Section 36: restricted origin list, never "*") ---
CORS_ALLOWED_ORIGINS = env_list("CORS_ALLOWED_ORIGINS", "http://localhost:5173")

# --- SigNoz / correlation tuning (Section 37) ---
SIGNOZ_BASE_URL = os.environ.get("SIGNOZ_BASE_URL", "http://localhost:3301")
SIGNOZ_API_KEY = os.environ.get("SIGNOZ_API_KEY", "")
SIGNOZ_WEBHOOK_SECRET = os.environ.get("SIGNOZ_WEBHOOK_SECRET", "")
CORRELATION_WINDOW_BEFORE_MIN = int(os.environ.get("CORRELATION_WINDOW_BEFORE_MIN", 10))
CORRELATION_WINDOW_AFTER_MIN = int(os.environ.get("CORRELATION_WINDOW_AFTER_MIN", 5))
MIN_CORRELATION_SCORE = float(os.environ.get("MIN_CORRELATION_SCORE", 30))

# --- OpenTelemetry (Section 26, dogfooding NFR from Section 7) ---
OTEL_EXPORTER_OTLP_ENDPOINT = os.environ.get("OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:4317")
OTEL_SERVICE_NAME = os.environ.get("OTEL_SERVICE_NAME", "tracescene-backend")

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

LOGIN_REDIRECT_URL = "/admin/"

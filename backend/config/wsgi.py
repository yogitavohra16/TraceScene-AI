"""
WSGI entrypoint. OpenTelemetry is initialized here (before the Django app
object is created) so every request handled by gunicorn/runserver is traced
from the very first request (Section 26).
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

from integrations.otel_setup import setup_otel  # noqa: E402

setup_otel()

application = get_wsgi_application()

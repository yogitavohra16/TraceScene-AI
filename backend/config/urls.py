"""
Root URL configuration. Every route here maps 1:1 to Section 22 of the PRD;
each app owns its own urls.py so the mapping is easy to audit per app.
"""
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include("accounts.urls")),
    path("api/v1/services/", include("services.urls")),
    path("api/v1/", include("cases.urls")),
    path("api/v1/", include("evidence.urls")),
    path("api/v1/", include("findings.urls")),
    path("api/v1/", include("assistant.urls")),
    path("api/v1/webhooks/", include("integrations.webhook_urls")),
    path("api/v1/settings/", include("integrations.settings_urls")),
]

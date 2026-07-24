"""
Persisted SigNoz connection settings (Settings screen, Section 11.7).

Not explicitly named in Section 20's folder structure, but required to make
GET/PUT /api/v1/settings/signoz/ (Section 22) actually persist across
restarts rather than only living in environment variables. This is recorded
as a deviation in PROJECT_DECISIONS.md per Appendix A.

A singleton row (id is always 1) is simplest for a single-tenant MVP -
multi-tenant per-connection config is Post-MVP (Section 55).
"""
from django.db import models


class SignozConnectionSettings(models.Model):
    base_url = models.CharField(max_length=255, default="http://localhost:3301")
    api_key = models.CharField(max_length=255, blank=True, default="")
    webhook_secret = models.CharField(max_length=255, blank=True, default="")
    updated_at = models.DateTimeField(auto_now=True)

    @classmethod
    def load(cls) -> "SignozConnectionSettings":
        from django.conf import settings as django_settings

        obj, _ = cls.objects.get_or_create(
            pk=1,
            defaults={
                "base_url": django_settings.SIGNOZ_BASE_URL,
                "api_key": django_settings.SIGNOZ_API_KEY,
                "webhook_secret": django_settings.SIGNOZ_WEBHOOK_SECRET,
            },
        )
        return obj

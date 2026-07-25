"""
SigNoz alert webhook receiver (PRD Section 22/25/33/36):
    POST /api/v1/webhooks/signoz/

Validates the shared-secret header, creates a Case (FR-1), and kicks off
the CorrelationEngine. Per Section 33's error-handling rules, a malformed
payload is logged with its raw body and still creates a minimal Case
flagged `needs_review` - alerts are never silently dropped.
"""

import logging

from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from cases.models import Case
from evidence.correlation import CorrelationEngine
from services.models import Service

from .models import SignozConnectionSettings

logger = logging.getLogger(__name__)


class SignozWebhookView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "webhook"

    def post(self, request):
        logger.info("SigNoz webhook received: %s", request.data)

        connection_settings = SignozConnectionSettings.load()
        provided_secret = request.headers.get("X-Signoz-Webhook-Secret", "")
        if (
            connection_settings.webhook_secret
            and provided_secret != connection_settings.webhook_secret
        ):
            return Response(
                {
                    "error": {
                        "code": "invalid_secret",
                        "message": "Webhook secret did not match.",
                        "field": None,
                    }
                },
                status=401,
            )

        payload = request.data
        try:
            case = self._create_case_from_payload(payload)
        except (KeyError, TypeError, ValueError):
            case = self._create_minimal_case(payload)

        CorrelationEngine(case).run_async()
        return Response(
            {"case_id": case.id, "status": case.status, "correlation_job": "queued"},
            status=202,
        )

    def _create_case_from_payload(self, payload: dict) -> Case:
        service_name = payload["service"]
        service, _ = Service.objects.get_or_create(name=service_name)
        return Case.objects.create(
            title=payload.get("ruleName", f"Alert on {service_name}"),
            description=f"Auto-created from SigNoz alert {payload.get('alertId', 'unknown')}.",
            service=service,
            severity=self._map_severity(payload.get("severity", "medium")),
            linked_alert_id=payload.get("alertId"),
        )

    def _create_minimal_case(self, payload: dict) -> Case:
        """Fallback for a malformed payload - the Case still gets created
        (never dropped, Section 33) but flagged needs_review."""
        unknown_service, _ = Service.objects.get_or_create(name="unknown-service")
        return Case.objects.create(
            title="Unparsed SigNoz alert - needs review",
            description=str(payload),
            service=unknown_service,
            severity=Case.Severity.MEDIUM,
            needs_review=True,
        )

    def _map_severity(self, raw: str) -> str:
        raw = (raw or "").lower()
        return raw if raw in Case.Severity.values else Case.Severity.MEDIUM

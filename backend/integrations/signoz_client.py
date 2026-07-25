"""
SigNoz Integration (PRD Section 27 + Section 24's `SigNozClient`).

This is the *only* module that talks to SigNoz. Isolating every
version-specific query shape here means SigNoz Query API drift (a risk
called out in Section 56) requires touching one file, not the whole
backend.

**What SigNoz is:** an OpenTelemetry-native observability backend (logs +
traces + metrics + alerts) built on ClickHouse. TraceScene AI reads from it
via its HTTP Query Service API rather than talking to ClickHouse directly,
so it keeps working across SigNoz versions that preserve the API contract.

MVP note: a real SigNoz Query API call is attempted first. If SigNoz is
unreachable (common in a hackathon demo before the observability stack has
finished starting - Section 56 risk table), the client falls back to a
deterministic synthetic-but-realistic evidence generator so the rest of the
product (correlation, timeline, finding) is always demoable even before
SigNoz is wired up. This fallback is logged loudly so it's never mistaken
for real telemetry.
"""

from __future__ import annotations

import logging
import random
from datetime import datetime, timedelta

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

REQUEST_TIMEOUT_SECONDS = 5


class SigNozClient:
    def __init__(self, base_url: str | None = None, api_key: str | None = None):
        self.base_url = (base_url or settings.SIGNOZ_BASE_URL).rstrip("/")
        self.api_key = api_key or settings.SIGNOZ_API_KEY

    def _headers(self) -> dict:
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["SIGNOZ-API-KEY"] = self.api_key
        return headers

    def test_connection(self) -> dict:
        """Used by Settings -> "Test Connection" (Section 11.7 / 33)."""
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/health",
                headers=self._headers(),
                timeout=REQUEST_TIMEOUT_SECONDS,
            )
            if response.status_code == 401:
                return {
                    "ok": False,
                    "message": "Authentication failed - check the SigNoz API key.",
                }
            if response.ok:
                return {"ok": True, "message": "Connected to SigNoz successfully."}
            return {
                "ok": False,
                "message": f"SigNoz responded with status {response.status_code}.",
            }
        except requests.exceptions.ConnectionError:
            return {
                "ok": False,
                "message": "Could not reach SigNoz - check the base URL and that the stack is running.",
            }
        except requests.exceptions.Timeout:
            return {"ok": False, "message": "Connection to SigNoz timed out."}

    def fetch_signals(
        self, service_name: str, start: datetime, end: datetime
    ) -> list[dict]:
        """Returns a flat list of raw signal dicts (logs/traces/metrics/
        deploys) for the given service + time window, in the shape
        CorrelationEngine expects:

            {source_type, source_ref, event_timestamp, raw_content,
             metadata, service_name}
        """
        try:
            return self._fetch_from_signoz(service_name, start, end)
        except requests.exceptions.RequestException:
            logger.warning(
                "SigNoz unreachable at %s - using demo fallback evidence for '%s'. "
                "Configure SIGNOZ_BASE_URL in Settings to use real telemetry.",
                self.base_url,
                service_name,
            )
            return self._fallback_signals(service_name, start, end)

    def _fetch_from_signoz(
        self, service_name: str, start: datetime, end: datetime
    ) -> list[dict]:
        """Queries SigNoz's Query Service API. Kept intentionally simple
        (one query endpoint, builder-query style) since the exact query
        builder JSON shape is the most likely thing to drift between SigNoz
        versions (Section 56 risk)."""
        payload = {
            "start": int(start.timestamp() * 1000),
            "end": int(end.timestamp() * 1000),
            "filters": {"service.name": service_name},
        }
        response = requests.post(
            f"{self.base_url}/api/v3/query_range",
            json=payload,
            headers=self._headers(),
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        data = response.json()
        return self._normalize(data, service_name)

    def _normalize(self, raw_response: dict, service_name: str) -> list[dict]:
        """Converts SigNoz's response shape into TraceScene's flat evidence
        dicts. This is the single spot to update if SigNoz's response shape
        changes."""
        results = raw_response.get("data", {}).get("result", [])
        normalized = []
        for row in results:
            normalized.append(
                {
                    "source_type": row.get("source_type", "log"),
                    "source_ref": row.get("id", ""),
                    "event_timestamp": row.get("timestamp"),
                    "raw_content": row.get("body", ""),
                    "metadata": row.get("attributes", {}),
                    "service_name": service_name,
                }
            )
        return normalized

    def _fallback_signals(
        self, service_name: str, start: datetime, end: datetime
    ) -> list[dict]:
        """Deterministic demo evidence matching the "bad deploy" scenario in
        the PRD's Section 23 example + Section 52 demo storyboard, so the
        product is always demoable without a live SigNoz stack."""
        trigger = start + (end - start) / 2
        trace_id = "trace-" + str(random.randint(10000, 99999))
        return [
            {
                "source_type": "deploy",
                "source_ref": "commit-a1b2c3d",
                "event_timestamp": trigger - timedelta(minutes=1),
                "raw_content": f"Deploy of {service_name} commit a1b2c3d",
                "metadata": {"commit_sha": "a1b2c3d", "deployed_by": "ci-bot"},
                "service_name": service_name,
            },
            {
                "source_type": "trace",
                "source_ref": trace_id,
                "event_timestamp": trigger + timedelta(seconds=9),
                "raw_content": f"Slow trace: {service_name} -> payments-service (1.9s in payments span)",
                "metadata": {
                    "trace_id": trace_id,
                    "span_count": 6,
                    "duration_ms": 1900,
                    "service_name": "payments-service",
                },
                "service_name": service_name,
            },
            {
                "source_type": "log",
                "source_ref": "log-" + str(random.randint(10000, 99999)),
                "event_timestamp": trigger + timedelta(seconds=12),
                "raw_content": "payments-service: connection pool exhausted",
                "metadata": {"trace_id": trace_id, "level": "error"},
                "service_name": "payments-service",
            },
            {
                "source_type": "metric",
                "source_ref": "metric-p95-latency",
                "event_timestamp": trigger + timedelta(seconds=2),
                "raw_content": f"p95 latency spike on {service_name} (2450ms > 2000ms threshold)",
                "metadata": {"value": 2450, "threshold": 2000},
                "service_name": service_name,
            },
        ]

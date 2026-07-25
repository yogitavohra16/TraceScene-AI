"""
Evidence Correlation Logic (PRD Section 29).

`CorrelationEngine` is the heart of the product: given a Case (which has a
service and a trigger time, either the webhook alert timestamp or case
creation time), it asks `SigNozClient` for nearby logs/traces/metrics/
deploys, scores each item against the trigger event, and persists the
ones that clear `MIN_CORRELATION_SCORE` as `Evidence` rows.

Scoring formula (weights fixed by the PRD, not configurable per-case so the
score stays comparable across cases and explainable to a user):

    correlation_score = 0.40 * time_proximity
                       + 0.25 * service_match
                       + 0.20 * trace_id_match
                       + 0.15 * severity_signal

Common beginner mistake this avoids: scoring purely on time proximity would
surface unrelated noisy logs from the same second. Weighting service/trace
match keeps the signal dense (Section 29).
"""

from __future__ import annotations

import logging
import os
import threading
from datetime import timedelta

from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)

TIME_WEIGHT = 0.40
SERVICE_WEIGHT = 0.25
TRACE_ID_WEIGHT = 0.20
SEVERITY_WEIGHT = 0.15

MAX_RETRIES = 3


class CorrelationEngine:
    """Correlates and persists Evidence for a single Case."""

    def __init__(self, case):
        self.case = case

    def run_async(self) -> None:
        """Kicks off `run()` on a background thread so the HTTP response
        (case creation / webhook ingestion) returns immediately (Section 24:
        "Django's built-in threading for MVP simplicity").

        Deviation (see PROJECT_DECISIONS.md): under pytest, SQLite's single
        writer lock makes a real background thread racing the test's own
        transaction flaky ("database is locked"). Pytest sets
        `PYTEST_CURRENT_TEST` for the duration of every test, so that env
        var is used as a reliable signal to run synchronously in-process
        instead - the production/demo code path (real requests) is
        unaffected."""
        if os.environ.get("PYTEST_CURRENT_TEST"):
            self._run_with_retries()
            return
        thread = threading.Thread(target=self._run_with_retries, daemon=True)
        thread.start()

    def _run_with_retries(self) -> None:
        from django.db import close_old_connections

        attempt = 0
        while attempt < MAX_RETRIES:
            try:
                self.run()
                return
            except (
                Exception
            ):  # noqa: BLE001 - correlation must never crash the request thread
                attempt += 1
                logger.exception(
                    "Correlation attempt %s/%s failed for case #%s",
                    attempt,
                    MAX_RETRIES,
                    self.case.id,
                )
            finally:
                close_old_connections()
        logger.error(
            "Correlation exhausted retries for case #%s - marked incomplete.",
            self.case.id,
        )

    def run(self) -> list:
        """Synchronously fetches, scores, and persists Evidence. Returns the
        list of persisted Evidence rows. Safe to call directly in tests."""
        from integrations.signoz_client import SigNozClient

        from cases.models import Case
        from findings.scoring import FindingGenerator

        from .timeline import TimelineBuilder

        case = self.case
        if case.status == Case.Status.OPEN:
            case.status = Case.Status.INVESTIGATING
            case.save(update_fields=["status"])

        trigger_time = self._trigger_time()
        window_start = trigger_time - timedelta(
            minutes=settings.CORRELATION_WINDOW_BEFORE_MIN
        )
        window_end = trigger_time + timedelta(
            minutes=settings.CORRELATION_WINDOW_AFTER_MIN
        )

        client = SigNozClient()
        raw_items = client.fetch_signals(
            service_name=case.service.name,
            start=window_start,
            end=window_end,
        )

        persisted = []
        seen_keys = set()
        for item in raw_items:
            key = (item["source_type"], item["source_ref"], item["event_timestamp"])
            if key in seen_keys:
                continue  # de-duplicate overlapping queries (Section 29)
            seen_keys.add(key)

            score = self.score_item(item, trigger_time, case)
            if score < settings.MIN_CORRELATION_SCORE:
                continue

            evidence, _ = self._persist(item, score)
            persisted.append(evidence)

        TimelineBuilder(case).build()
        FindingGenerator(case).generate()
        return persisted

    def _trigger_time(self):
        return self.case.created_at or timezone.now()

    def _persist(self, item: dict, score: float):
        from .models import Evidence

        return Evidence.objects.update_or_create(
            case=self.case,
            source_type=item["source_type"],
            source_ref=item["source_ref"],
            event_timestamp=item["event_timestamp"],
            defaults={
                "raw_content": item["raw_content"],
                "metadata": item.get("metadata", {}),
                "correlation_score": round(score, 1),
            },
        )

    @staticmethod
    def score_item(item: dict, trigger_time, case) -> float:
        """Pure scoring function (kept static + side-effect free so it's
        directly unit-testable per Section 45)."""
        time_proximity = CorrelationEngine._time_proximity_score(
            item["event_timestamp"], trigger_time
        )
        service_match = 100.0 if item.get("service_name") == case.service.name else 40.0
        trace_id_match = 100.0 if item.get("metadata", {}).get("trace_id") else 0.0
        severity_signal = CorrelationEngine._severity_signal_score(item)

        return (
            TIME_WEIGHT * time_proximity
            + SERVICE_WEIGHT * service_match
            + TRACE_ID_WEIGHT * trace_id_match
            + SEVERITY_WEIGHT * severity_signal
        )

    @staticmethod
    def _time_proximity_score(event_time, trigger_time) -> float:
        """Closer to the trigger = higher score. Decays linearly to 0 at the
        edge of a 15-minute window, matching the default correlation
        window (10 min before + 5 min after)."""
        delta_seconds = abs((event_time - trigger_time).total_seconds())
        max_seconds = 15 * 60
        proximity = max(0.0, 1 - (delta_seconds / max_seconds))
        return proximity * 100

    @staticmethod
    def _severity_signal_score(item: dict) -> float:
        content = (item.get("raw_content") or "").lower()
        keywords = ["error", "exception", "fail", "timeout", "exhausted", "critical"]
        return 100.0 if any(keyword in content for keyword in keywords) else 20.0

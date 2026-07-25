"""Unit tests for the correlation scoring math (Section 45 - 80%+ target on
evidence/ app)."""

from datetime import datetime, timedelta
from datetime import timezone as dt_timezone

from django.test import TestCase

from cases.models import Case
from evidence.correlation import CorrelationEngine
from services.models import Service


class ScoreItemTests(TestCase):
    def setUp(self):
        self.service = Service.objects.create(name="checkout-service")
        self.case = Case.objects.create(
            title="Test", service=self.service, severity="high"
        )

    def test_close_time_and_matching_service_scores_high(self):
        trigger_time = datetime(2026, 7, 20, 9, 10, 32, tzinfo=dt_timezone.utc)
        item = {
            "event_timestamp": trigger_time - timedelta(seconds=3),
            "service_name": "checkout-service",
            "raw_content": "connection pool exhausted",
            "metadata": {"trace_id": "abc123"},
        }
        score = CorrelationEngine.score_item(item, trigger_time, self.case)
        self.assertGreater(score, 80)

    def test_distant_time_and_other_service_scores_low(self):
        trigger_time = datetime(2026, 7, 20, 9, 10, 32, tzinfo=dt_timezone.utc)
        item = {
            "event_timestamp": trigger_time - timedelta(minutes=20),
            "service_name": "unrelated-service",
            "raw_content": "routine health check ok",
            "metadata": {},
        }
        score = CorrelationEngine.score_item(item, trigger_time, self.case)
        self.assertLess(score, 30)

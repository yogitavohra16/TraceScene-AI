"""Tests for SigNozClient's demo fallback path (Section 45)."""
from datetime import datetime, timezone

from django.test import TestCase

from integrations.signoz_client import SigNozClient


class SigNozClientFallbackTests(TestCase):
    def test_fallback_signals_cover_all_source_types(self):
        client = SigNozClient(base_url="http://unreachable-host:9999")
        start = datetime(2026, 7, 20, 9, 0, tzinfo=timezone.utc)
        end = datetime(2026, 7, 20, 9, 15, tzinfo=timezone.utc)

        signals = client.fetch_signals("checkout-service", start, end)

        source_types = {item["source_type"] for item in signals}
        self.assertEqual(source_types, {"deploy", "trace", "log", "metric"})

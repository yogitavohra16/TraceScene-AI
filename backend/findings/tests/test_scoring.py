"""Unit tests for the confidence scoring formula (Section 45)."""

from datetime import timedelta

from django.test import TestCase
from django.utils import timezone

from cases.models import Case
from evidence.models import Evidence
from findings.scoring import FindingGenerator
from services.models import Service


class FindingGeneratorTests(TestCase):
    def setUp(self):
        self.service = Service.objects.create(name="checkout-service")
        self.case = Case.objects.create(
            title="Latency spike", service=self.service, severity="high"
        )

    def test_generate_returns_none_with_no_evidence(self):
        self.assertIsNone(FindingGenerator(self.case).generate())

    def test_bad_deploy_pattern_produces_high_confidence(self):
        now = timezone.now()
        Evidence.objects.create(
            case=self.case,
            source_type="deploy",
            source_ref="commit-abc",
            event_timestamp=now - timedelta(minutes=1),
            raw_content="Deploy of commit abc123",
            correlation_score=92,
            relevance="relevant",
        )
        Evidence.objects.create(
            case=self.case,
            source_type="log",
            source_ref="log-1",
            event_timestamp=now,
            raw_content="payments-service: connection pool exhausted",
            correlation_score=95,
            relevance="relevant",
            metadata={},
        )
        Evidence.objects.create(
            case=self.case,
            source_type="metric",
            source_ref="metric-1",
            event_timestamp=now,
            raw_content="p95 latency breach",
            correlation_score=90,
            relevance="relevant",
        )

        finding = FindingGenerator(self.case).generate()
        self.assertIsNotNone(finding)
        self.assertGreater(finding.confidence_score, 70)

"""
Confidence Scoring Strategy (PRD Section 32).

`FindingGenerator` turns a Case's scored Evidence into a `Finding`: a
plain-English hypothesis plus an explainable 0-100 confidence score. The
score is a transparent formula, not a black-box model, per the "Detective's
Case Board" philosophy (Section 13) and the "explainable, not black-box"
theme repeated through Sections 29/31/32.

    confidence_score = clamp(
        0.5 * avg_relevant_score
      + 0.3 * evidence_convergence_bonus
      + 0.2 * causal_pattern_bonus,
      0, 100,
    )
"""
from __future__ import annotations

from django.utils import timezone

from evidence.models import Evidence

from .models import Finding

AVG_SCORE_WEIGHT = 0.5
CONVERGENCE_WEIGHT = 0.3
CAUSAL_PATTERN_WEIGHT = 0.2
DISTINCT_SOURCE_TYPES = 4

RESOURCE_KEYWORDS = ["pool", "connection", "memory", "timeout", "exhausted"]


class FindingGenerator:
    def __init__(self, case):
        self.case = case

    def generate(self) -> Finding | None:
        evidence_qs = self.case.evidence.exclude(relevance=Evidence.Relevance.IRRELEVANT)
        relevant = list(evidence_qs.filter(relevance=Evidence.Relevance.RELEVANT).order_by("-correlation_score"))
        scored_set = relevant or list(evidence_qs.order_by("-correlation_score")[:3])

        if not scored_set:
            return None

        avg_score = sum(item.correlation_score for item in scored_set) / len(scored_set)
        convergence_bonus = self._convergence_bonus(scored_set)
        causal_bonus = self._causal_pattern_bonus(scored_set)

        confidence = (
            AVG_SCORE_WEIGHT * avg_score
            + CONVERGENCE_WEIGHT * convergence_bonus
            + CAUSAL_PATTERN_WEIGHT * causal_bonus
        )
        confidence = max(0.0, min(100.0, confidence))

        hypothesis = self._build_hypothesis(scored_set)
        supporting_ids = [item.id for item in scored_set[:5]]

        finding, _ = Finding.objects.update_or_create(
            case=self.case,
            defaults={
                "hypothesis": hypothesis,
                "confidence_score": round(confidence, 1),
                "supporting_evidence_ids": supporting_ids,
                "status": Finding.FindingStatus.PROPOSED,
                "reviewed_at": None,
            },
        )
        return finding

    def _convergence_bonus(self, evidence_list: list) -> float:
        """Rewards multiple independent source types agreeing (Section 32)."""
        distinct_types = {item.source_type for item in evidence_list}
        return 100 * (len(distinct_types) / DISTINCT_SOURCE_TYPES)

    def _causal_pattern_bonus(self, evidence_list: list) -> float:
        """Matches evidence against the known incident-shape library
        (Section 32 table). Returns the bonus for the strongest match."""
        types = {item.source_type for item in evidence_list}
        contents = " ".join(item.raw_content.lower() for item in evidence_list)

        has_deploy_near_alert = "deploy" in types and self._deploy_precedes_alert(evidence_list)
        has_resource_error = any(keyword in contents for keyword in RESOURCE_KEYWORDS) and "metric" in types
        has_cross_service_trace = self._has_cross_service_failure(evidence_list)
        has_traffic_spike = "metric" in types and "spike" in contents

        if has_deploy_near_alert or has_resource_error:
            return 100.0
        if has_cross_service_trace or has_traffic_spike:
            return 50.0
        return 0.0

    def _deploy_precedes_alert(self, evidence_list: list) -> bool:
        deploys = [item for item in evidence_list if item.source_type == "deploy"]
        if not deploys:
            return False
        trigger_time = self.case.created_at
        return any((trigger_time - deploy.event_timestamp).total_seconds() < 600 for deploy in deploys)

    def _has_cross_service_failure(self, evidence_list: list) -> bool:
        traces = [item for item in evidence_list if item.source_type == "trace"]
        return any(item.metadata.get("service_name") not in (None, self.case.service.name) for item in traces)

    def _build_hypothesis(self, evidence_list: list) -> str:
        top = evidence_list[0]
        deploy = next((item for item in evidence_list if item.source_type == "deploy"), None)

        summary = top.raw_content[:160].rstrip(".")
        if deploy:
            return (
                f"This incident on {self.case.service.name} is most likely related to {summary}, "
                f"which began shortly after a deploy at {timezone.localtime(deploy.event_timestamp).strftime('%H:%M:%S')}."
            )
        return (
            f"This incident on {self.case.service.name} is most likely explained by: {summary}."
        )

"""
AI Assistant query view (Section 22/31):
    POST /api/v1/cases/{id}/assistant/query/

MVP scope: rule-based Q&A over the case's structured data - no external LLM
call, so the demo has zero external API/network dependency during judging
(Section 31, Section 53 talking points). The Assistant always cites the
evidence IDs it used, matching the "explainable" product thesis.
"""

from django.shortcuts import get_object_or_404
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from cases.models import Case

from .grounding import EvidenceGrounder


class AssistantQuerySerializer(serializers.Serializer):
    question = serializers.CharField()


class CaseAssistantQueryView(APIView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "assistant"

    def post(self, request, case_id):
        case = get_object_or_404(Case, pk=case_id)
        serializer = AssistantQuerySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        question = serializer.validated_data["question"].lower()

        context = EvidenceGrounder(case).build_context()
        if not context:
            return Response(
                {
                    "answer": "Still investigating - no evidence has been correlated for this case yet. Check back in a few seconds.",
                    "cited_evidence_ids": [],
                }
            )

        answer, cited_ids = self._answer(question, context, case)
        return Response({"answer": answer, "cited_evidence_ids": cited_ids})

    def _answer(self, question: str, context: list[dict], case: Case):
        if "changed" in question or "before" in question:
            earliest = context[0]
            return (
                f"The earliest notable event was a {earliest['source_type']} at {earliest['timestamp']}: "
                f"{earliest['summary']} (evidence #{earliest['evidence_id']}, score {earliest['score']:.0f}).",
                [earliest["evidence_id"]],
            )

        if "confidence" in question:
            finding = getattr(case, "finding", None)
            if not finding:
                return "No finding has been generated yet.", []
            return (
                f"Current confidence is {finding.confidence_score:.0f}%, based on "
                f"{len(finding.supporting_evidence_ids)} supporting evidence item(s).",
                finding.supporting_evidence_ids,
            )

        top = max(context, key=lambda item: item["score"])
        return (
            f"The strongest signal so far is a {top['source_type']} event: {top['summary']} "
            f"(evidence #{top['evidence_id']}, score {top['score']:.0f}).",
            [top["evidence_id"]],
        )

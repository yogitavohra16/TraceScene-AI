"""
AI Investigation Assistant grounding (PRD Section 31).

`EvidenceGrounder` builds the compact, cited context block the Assistant
reasons over - and ONLY ever the case's own evidence, never the full SigNoz
dataset. This is what keeps the Assistant "explainable, not black-box" and
bounds cost/latency once an LLM is wired in (Post-MVP).

Context is capped to the top N=20 evidence items by correlation_score
(Section 31's "common beginner mistake" to avoid: not capping context size).
"""
from __future__ import annotations

MAX_EVIDENCE_ITEMS = 20


class EvidenceGrounder:
    def __init__(self, case):
        self.case = case

    def build_context(self) -> list[dict]:
        """Returns a chronological, numbered list of evidence dicts ready to
        render into a prompt (Post-MVP) or feed the rule-based responder
        (MVP)."""
        evidence_qs = (
            self.case.evidence.exclude(relevance="irrelevant")
            .order_by("-correlation_score")[:MAX_EVIDENCE_ITEMS]
        )
        ordered = sorted(evidence_qs, key=lambda item: item.event_timestamp)
        return [
            {
                "number": index + 1,
                "evidence_id": item.id,
                "timestamp": item.event_timestamp,
                "source_type": item.source_type,
                "summary": item.raw_content[:160],
                "score": item.correlation_score,
            }
            for index, item in enumerate(ordered)
        ]

"""Findings app: the AI-proposed root-cause hypothesis + confidence score
for a Case (Section 21 ERD - FINDING entity, one-to-one with Case)."""

from django.db import models


class Finding(models.Model):
    class FindingStatus(models.TextChoices):
        PROPOSED = "proposed", "Proposed"
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"

    case = models.OneToOneField(
        "cases.Case", on_delete=models.CASCADE, related_name="finding"
    )
    hypothesis = models.TextField()
    confidence_score = models.FloatField(default=0)
    supporting_evidence_ids = models.JSONField(default=list, blank=True)
    status = models.CharField(
        max_length=20, choices=FindingStatus.choices, default=FindingStatus.PROPOSED
    )
    generated_at = models.DateTimeField(auto_now=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Finding for case #{self.case_id} ({self.confidence_score:.0f}%)"

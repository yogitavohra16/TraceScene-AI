"""Evidence app: the raw logs/traces/metrics/deploys pulled from SigNoz and
scored against a Case (Section 21 ERD - EVIDENCE entity)."""
from django.db import models


class Evidence(models.Model):
    class SourceType(models.TextChoices):
        LOG = "log", "Log"
        TRACE = "trace", "Trace"
        METRIC = "metric", "Metric"
        DEPLOY = "deploy", "Deploy"
        ALERT = "alert", "Alert"

    class Relevance(models.TextChoices):
        UNREVIEWED = "unreviewed", "Unreviewed"
        RELEVANT = "relevant", "Relevant"
        IRRELEVANT = "irrelevant", "Irrelevant"

    case = models.ForeignKey("cases.Case", on_delete=models.CASCADE, related_name="evidence")
    source_type = models.CharField(max_length=20, choices=SourceType.choices)
    # A stable reference to the underlying SigNoz record (log line id, trace
    # id, metric series name, etc). Used for de-duplication (Section 29).
    source_ref = models.CharField(max_length=255)
    event_timestamp = models.DateTimeField()
    raw_content = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    correlation_score = models.FloatField(default=0)
    relevance = models.CharField(max_length=20, choices=Relevance.choices, default=Relevance.UNREVIEWED)
    fetched_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["event_timestamp"]
        # Enforces the de-duplication rule from Section 29: the same
        # (source_type, source_ref, event_timestamp) should only be stored
        # once per case, even if two correlation queries both return it.
        unique_together = ("case", "source_type", "source_ref", "event_timestamp")

    def __str__(self):
        return f"{self.source_type} evidence #{self.id} for case #{self.case_id}"

"""
Cases app: the core Case lifecycle entity plus its Notes (Section 21 ERD).

A Case is the "case file" the whole product is built around - it is created
either manually (FR-2) or automatically from a SigNoz webhook alert (FR-1).
"""

from django.conf import settings
from django.db import models


class Case(models.Model):
    class Severity(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"
        CRITICAL = "critical", "Critical"

    class Status(models.TextChoices):
        OPEN = "open", "Open"
        INVESTIGATING = "investigating", "Investigating"
        CLOSED = "closed", "Closed"

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    service = models.ForeignKey(
        "services.Service", on_delete=models.CASCADE, related_name="cases"
    )
    severity = models.CharField(
        max_length=20, choices=Severity.choices, default=Severity.MEDIUM
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.OPEN
    )
    linked_alert_id = models.CharField(max_length=120, blank=True, null=True)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_cases",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    resolution_summary = models.TextField(blank=True, default="")
    # Set true when a webhook payload couldn't be fully parsed (Section 33)
    # so the Case is still created (never silently dropped) but flagged.
    needs_review = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Case #{self.id}: {self.title}"


class Note(models.Model):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name="notes")
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notes"
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Note on Case #{self.case_id} by {self.author}"

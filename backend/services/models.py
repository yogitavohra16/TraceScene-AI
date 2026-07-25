"""Service app: the registry of instrumented services a Case can belong to
(Section 21 ERD - SERVICE entity)."""

from django.db import models


class Service(models.Model):
    name = models.CharField(max_length=120, unique=True)
    description = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name

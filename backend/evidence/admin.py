from django.contrib import admin

from .models import Evidence


@admin.register(Evidence)
class EvidenceAdmin(admin.ModelAdmin):
    list_display = ["id", "case", "source_type", "correlation_score", "relevance", "event_timestamp"]
    list_filter = ["source_type", "relevance"]

from django.contrib import admin

from .models import Finding


@admin.register(Finding)
class FindingAdmin(admin.ModelAdmin):
    list_display = ["id", "case", "confidence_score", "status", "generated_at"]

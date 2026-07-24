from django.contrib import admin

from .models import Case, Note


@admin.register(Case)
class CaseAdmin(admin.ModelAdmin):
    list_display = ["id", "title", "service", "severity", "status", "created_at"]
    list_filter = ["status", "severity", "service"]
    search_fields = ["title"]


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ["id", "case", "author", "created_at"]

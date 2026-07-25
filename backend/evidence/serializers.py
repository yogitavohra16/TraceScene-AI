from rest_framework import serializers

from .models import Evidence


class EvidenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evidence
        fields = [
            "id",
            "case",
            "source_type",
            "source_ref",
            "event_timestamp",
            "raw_content",
            "metadata",
            "correlation_score",
            "relevance",
            "fetched_at",
        ]
        read_only_fields = [
            "case",
            "source_type",
            "source_ref",
            "event_timestamp",
            "raw_content",
            "metadata",
            "correlation_score",
            "fetched_at",
        ]


class EvidenceUpdateSerializer(serializers.ModelSerializer):
    """Used for PATCH /api/v1/evidence/{id}/ - the only field a user may
    change is relevance (Section 23 example)."""

    class Meta:
        model = Evidence
        fields = ["id", "source_type", "relevance", "correlation_score"]
        read_only_fields = ["id", "source_type", "correlation_score"]

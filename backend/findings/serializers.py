from rest_framework import serializers

from .models import Finding


class FindingSerializer(serializers.ModelSerializer):
    case_id = serializers.IntegerField(source="case.id", read_only=True)

    class Meta:
        model = Finding
        fields = [
            "id", "case_id", "hypothesis", "confidence_score",
            "supporting_evidence_ids", "status", "generated_at", "reviewed_at",
        ]

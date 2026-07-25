"""Serializers for Case and Note (Section 23 request/response examples)."""

from django.contrib.auth.models import User
from rest_framework import serializers

from services.models import Service
from services.serializers import ServiceSerializer

from .models import Case, Note


class UserBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]


class NoteSerializer(serializers.ModelSerializer):
    author = UserBriefSerializer(read_only=True)

    class Meta:
        model = Note
        fields = ["id", "case", "author", "content", "created_at"]
        read_only_fields = ["case", "author", "created_at"]


class CaseListSerializer(serializers.ModelSerializer):
    """Lighter-weight serializer for the Case List screen (Section 11.3) -
    avoids serializing every nested evidence/finding relation for a list of
    potentially many cases."""

    service = ServiceSerializer(read_only=True)
    assigned_to = UserBriefSerializer(read_only=True)
    evidence_count = serializers.IntegerField(source="evidence.count", read_only=True)
    confidence_score = serializers.SerializerMethodField()

    class Meta:
        model = Case
        fields = [
            "id",
            "title",
            "service",
            "severity",
            "status",
            "linked_alert_id",
            "assigned_to",
            "created_at",
            "updated_at",
            "evidence_count",
            "confidence_score",
        ]

    def get_confidence_score(self, obj):
        finding = getattr(obj, "finding", None)
        return finding.confidence_score if finding else None


class CaseDetailSerializer(serializers.ModelSerializer):
    """Full Case payload used on the Investigation Room (Section 11.4)."""

    service = ServiceSerializer(read_only=True)
    assigned_to = UserBriefSerializer(read_only=True)
    evidence_count = serializers.IntegerField(source="evidence.count", read_only=True)
    finding = serializers.SerializerMethodField()

    class Meta:
        model = Case
        fields = [
            "id",
            "title",
            "description",
            "service",
            "severity",
            "status",
            "linked_alert_id",
            "assigned_to",
            "created_at",
            "updated_at",
            "closed_at",
            "resolution_summary",
            "needs_review",
            "evidence_count",
            "finding",
        ]

    def get_finding(self, obj):
        # Local import avoids a circular import between the cases and
        # findings apps (findings.serializers imports nothing from cases).
        from findings.serializers import FindingSerializer

        finding = getattr(obj, "finding", None)
        return FindingSerializer(finding).data if finding else None


class CaseCreateSerializer(serializers.ModelSerializer):
    """Used for POST /api/v1/cases/ (manual creation, FR-2)."""

    service = serializers.PrimaryKeyRelatedField(queryset=Service.objects.all())

    class Meta:
        model = Case
        fields = [
            "id",
            "title",
            "description",
            "service",
            "severity",
            "linked_alert_id",
        ]


class CaseUpdateSerializer(serializers.ModelSerializer):
    """Used for PATCH /api/v1/cases/{id}/ - only fields a user may edit
    in-place (Section 22)."""

    class Meta:
        model = Case
        fields = ["title", "status", "severity"]


class CaseCloseSerializer(serializers.Serializer):
    resolution_summary = serializers.CharField()

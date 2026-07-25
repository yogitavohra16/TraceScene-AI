"""
Case views (Section 22).

Views stay thin per Section 42's coding standard: they validate input via a
serializer, delegate any real work to a service module, then serialize the
response. The only "logic" that lives here is orchestration (e.g. kicking
off the CorrelationEngine after a Case is created).
"""

import django_filters
from django.utils import timezone
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from evidence.correlation import CorrelationEngine

from .models import Case
from .serializers import (
    CaseCloseSerializer,
    CaseCreateSerializer,
    CaseDetailSerializer,
    CaseListSerializer,
    CaseUpdateSerializer,
    NoteSerializer,
)


class CaseFilter(django_filters.FilterSet):
    class Meta:
        model = Case
        fields = ["status", "severity", "service"]


class CaseViewSet(viewsets.ModelViewSet):
    """Handles /api/v1/cases/ list+create+detail+patch, plus the /close/
    action. Evidence, timeline, finding, and notes sub-resources are
    exposed as further actions/other apps' viewsets, matching Section 22."""

    queryset = Case.objects.select_related("service", "assigned_to").all()
    filter_backends = [
        django_filters.rest_framework.DjangoFilterBackend,
        filters.SearchFilter,
    ]
    filterset_class = CaseFilter
    search_fields = ["title", "id"]
    http_method_names = ["get", "post", "patch", "head", "options"]

    def get_serializer_class(self):
        if self.action == "list":
            return CaseListSerializer
        if self.action == "create":
            return CaseCreateSerializer
        if self.action == "partial_update":
            return CaseUpdateSerializer
        return CaseDetailSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        case = serializer.save(status=Case.Status.OPEN)
        # Section 23's example response includes status/evidence_count/
        # finding, so the full detail shape is returned here rather than
        # the leaner create-input serializer. Serialized BEFORE kicking off
        # correlation because correlation flips status to "investigating"
        # once it starts - the create response should reflect the
        # just-created "open" state, per Section 23's example.
        response_data = CaseDetailSerializer(case).data
        # Correlation runs synchronously-but-backgrounded via a thread for
        # MVP simplicity (Section 24) - the user is redirected immediately
        # and the Evidence Panel polls until it completes (Section 35).
        CorrelationEngine(case).run_async()
        return Response(response_data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(CaseDetailSerializer(instance).data)

    @action(detail=True, methods=["post"])
    def close(self, request, pk=None):
        case = self.get_object()
        serializer = CaseCloseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        case.status = Case.Status.CLOSED
        case.resolution_summary = serializer.validated_data["resolution_summary"]
        case.closed_at = timezone.now()
        case.save()
        return Response(CaseDetailSerializer(case).data)

    @action(detail=True, methods=["get", "post"])
    def notes(self, request, pk=None):
        case = self.get_object()
        if request.method == "GET":
            notes = case.notes.select_related("author").all()
            return Response(NoteSerializer(notes, many=True).data)

        serializer = NoteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        note = serializer.save(case=case, author=request.user)
        return Response(NoteSerializer(note).data, status=status.HTTP_201_CREATED)

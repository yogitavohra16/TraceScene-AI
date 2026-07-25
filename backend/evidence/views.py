"""
Evidence + Timeline views (Section 22):
  GET  /api/v1/cases/{id}/evidence/
  PATCH /api/v1/evidence/{id}/
  GET  /api/v1/cases/{id}/timeline/
"""

from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from cases.models import Case

from .models import Evidence
from .serializers import EvidenceSerializer, EvidenceUpdateSerializer
from .timeline import TimelineBuilder


class CaseEvidenceListView(ListAPIView):
    serializer_class = EvidenceSerializer

    def get_queryset(self):
        return Evidence.objects.filter(case_id=self.kwargs["case_id"]).order_by(
            "-correlation_score"
        )


class EvidenceDetailView(RetrieveUpdateAPIView):
    queryset = Evidence.objects.all()
    http_method_names = ["get", "patch", "head", "options"]

    def get_serializer_class(self):
        return (
            EvidenceUpdateSerializer
            if self.request.method == "PATCH"
            else EvidenceSerializer
        )

    def perform_update(self, serializer):
        evidence = serializer.save()
        # Relevance changed -> recompute the timeline + finding so the UI's
        # confidence score visibly reacts to the user's judgment (Section 32).
        from findings.scoring import FindingGenerator

        TimelineBuilder(evidence.case).build()
        FindingGenerator(evidence.case).generate()


class CaseTimelineView(APIView):
    def get(self, request, case_id):
        case = Case.objects.get(pk=case_id)
        return Response(TimelineBuilder(case).build())

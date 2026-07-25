"""
Finding views (Section 22):
  GET  /api/v1/cases/{id}/finding/
  POST /api/v1/cases/{id}/finding/regenerate/
  POST /api/v1/findings/{id}/accept/
  POST /api/v1/findings/{id}/reject/
"""

from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from cases.models import Case

from .models import Finding
from .scoring import FindingGenerator
from .serializers import FindingSerializer


class CaseFindingView(APIView):
    def get(self, request, case_id):
        case = get_object_or_404(Case, pk=case_id)
        finding = getattr(case, "finding", None)
        if not finding:
            return Response(
                {
                    "error": {
                        "code": "not_found",
                        "message": "Finding not yet generated.",
                        "field": None,
                    }
                },
                status=404,
            )
        return Response(FindingSerializer(finding).data)


class CaseFindingRegenerateView(APIView):
    def post(self, request, case_id):
        case = get_object_or_404(Case, pk=case_id)
        finding = FindingGenerator(case).generate()
        if not finding:
            return Response(
                {
                    "error": {
                        "code": "no_evidence",
                        "message": "No evidence available to score yet.",
                        "field": None,
                    }
                },
                status=400,
            )
        return Response(FindingSerializer(finding).data)


class FindingAcceptView(APIView):
    def post(self, request, pk):
        finding = get_object_or_404(Finding, pk=pk)
        finding.status = Finding.FindingStatus.ACCEPTED
        finding.reviewed_at = timezone.now()
        finding.save()
        return Response(FindingSerializer(finding).data)


class FindingRejectView(APIView):
    def post(self, request, pk):
        finding = get_object_or_404(Finding, pk=pk)
        finding.status = Finding.FindingStatus.REJECTED
        finding.reviewed_at = timezone.now()
        finding.save()
        return Response(FindingSerializer(finding).data)

from django.urls import path

from .views import CaseEvidenceListView, CaseTimelineView, EvidenceDetailView

urlpatterns = [
    path(
        "cases/<int:case_id>/evidence/",
        CaseEvidenceListView.as_view(),
        name="case-evidence",
    ),
    path(
        "cases/<int:case_id>/timeline/",
        CaseTimelineView.as_view(),
        name="case-timeline",
    ),
    path("evidence/<int:pk>/", EvidenceDetailView.as_view(), name="evidence-detail"),
]

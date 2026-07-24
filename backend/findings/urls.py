from django.urls import path

from .views import (
    CaseFindingRegenerateView,
    CaseFindingView,
    FindingAcceptView,
    FindingRejectView,
)

urlpatterns = [
    path("cases/<int:case_id>/finding/", CaseFindingView.as_view(), name="case-finding"),
    path("cases/<int:case_id>/finding/regenerate/", CaseFindingRegenerateView.as_view(), name="case-finding-regenerate"),
    path("findings/<int:pk>/accept/", FindingAcceptView.as_view(), name="finding-accept"),
    path("findings/<int:pk>/reject/", FindingRejectView.as_view(), name="finding-reject"),
]

from django.urls import path

from .views import CaseAssistantQueryView

urlpatterns = [
    path(
        "cases/<int:case_id>/assistant/query/",
        CaseAssistantQueryView.as_view(),
        name="case-assistant-query",
    ),
]

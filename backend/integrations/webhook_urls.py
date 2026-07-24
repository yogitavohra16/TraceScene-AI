from django.urls import path

from .webhook_views import SignozWebhookView

urlpatterns = [
    path("signoz/", SignozWebhookView.as_view(), name="signoz-webhook"),
]

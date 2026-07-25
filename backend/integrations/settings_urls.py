from django.urls import path

from .views import SignozSettingsView, SignozTestConnectionView

urlpatterns = [
    path("signoz/", SignozSettingsView.as_view(), name="signoz-settings"),
    path(
        "signoz/test/", SignozTestConnectionView.as_view(), name="signoz-settings-test"
    ),
]

"""
SigNoz connection Settings views (Section 22/11.7):
    GET/PUT /api/v1/settings/signoz/
    POST    /api/v1/settings/signoz/test/
"""

from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import SignozConnectionSettings
from .signoz_client import SigNozClient


class SignozConnectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SignozConnectionSettings
        fields = ["base_url", "api_key", "webhook_secret", "updated_at"]
        read_only_fields = ["updated_at"]


class SignozSettingsView(APIView):
    def get(self, request):
        return Response(
            SignozConnectionSerializer(SignozConnectionSettings.load()).data
        )

    def put(self, request):
        instance = SignozConnectionSettings.load()
        serializer = SignozConnectionSerializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class SignozTestConnectionView(APIView):
    def post(self, request):
        settings_row = SignozConnectionSettings.load()
        client = SigNozClient(
            base_url=settings_row.base_url, api_key=settings_row.api_key
        )
        result = client.test_connection()
        return Response(result)

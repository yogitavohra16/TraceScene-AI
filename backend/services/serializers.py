from rest_framework import serializers

from .models import Service


class ServiceSerializer(serializers.ModelSerializer):
    open_case_count = serializers.SerializerMethodField()
    closed_case_count = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = ["id", "name", "description", "created_at", "open_case_count", "closed_case_count"]

    def get_open_case_count(self, obj):
        return obj.cases.exclude(status="closed").count()

    def get_closed_case_count(self, obj):
        return obj.cases.filter(status="closed").count()

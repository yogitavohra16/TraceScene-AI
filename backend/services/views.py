"""
Service registry views (Section 22: GET /services/, GET /services/{id}/).

Read-only in the API surface - services are expected to be created via the
Django admin or auto-created when a webhook/case references a new service
name (see cases/serializers.py), matching the PRD's "no unused endpoint"
rule (Appendix A) since nothing in the UI creates a Service directly.
"""

from .models import Service
from .serializers import ServiceSerializer


from rest_framework import mixins, viewsets


class ServiceViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer

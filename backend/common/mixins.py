"""Small reusable ViewSet mixins shared across apps."""

from rest_framework.response import Response


class ServiceErrorMixin:
    """Lets a view return a clean {"error": {...}} response for handled
    service-layer exceptions (e.g. SigNoz unreachable) without going
    through the generic DRF exception handler."""

    def error_response(
        self, code: str, message: str, status_code: int, field: str = None
    ) -> Response:
        return Response(
            {"error": {"code": code, "message": message, "field": field}},
            status=status_code,
        )

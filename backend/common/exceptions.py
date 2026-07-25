"""
Custom DRF exception handler.

Converts every error DRF would normally raise into the single standard
error shape documented in Section 23 of the PRD:

    {"error": {"code": "...", "message": "...", "field": "..."}}

This keeps the frontend's error handling (ToastContext) simple - it only
ever has to read `response.data.error.message`.
"""

from rest_framework.views import exception_handler


def standard_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return None

    detail = response.data
    field = None
    message = "An unexpected error occurred."
    code = "error"

    if isinstance(detail, dict):
        # DRF validation errors look like {"field_name": ["message"]}
        for key, value in detail.items():
            field = None if key == "detail" else key
            message = value[0] if isinstance(value, list) else str(value)
            break
        code = "validation_error" if field else _code_for_status(response.status_code)
    elif isinstance(detail, list) and detail:
        message = str(detail[0])
        code = _code_for_status(response.status_code)

    response.data = {"error": {"code": code, "message": message, "field": field}}
    return response


def _code_for_status(status_code: int) -> str:
    return {
        400: "validation_error",
        401: "authentication_error",
        403: "permission_denied",
        404: "not_found",
        429: "throttled",
    }.get(status_code, "error")

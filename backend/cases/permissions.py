"""
Case-level permissions.

MVP has a single authenticated-user role (RBAC is Post-MVP per Section 8/15),
so this is intentionally a thin pass-through today. It exists as its own
module now so adding Viewer/Investigator/Admin checks later doesn't require
touching views.py (Appendix A: single responsibility).
"""
from rest_framework.permissions import BasePermission


class IsAuthenticatedForWrite(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

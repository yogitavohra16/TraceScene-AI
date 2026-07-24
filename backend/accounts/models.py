"""
Accounts app (Section 20).

MVP auth is intentionally simple: Django's built-in User model plus DRF
Token Authentication (Section 36). Role-based access control (Viewer /
Investigator / Admin, FR-15) is explicitly Post-MVP (Section 8), so no
custom User model or role field is introduced here - that would be scope
creep the PRD's risk table (Section 56) specifically warns against.
"""

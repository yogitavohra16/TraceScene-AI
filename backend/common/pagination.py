"""Shared DRF pagination class so every list endpoint in Section 22 returns
the same envelope shape, instead of each ViewSet configuring its own."""

from rest_framework.pagination import PageNumberPagination


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 200

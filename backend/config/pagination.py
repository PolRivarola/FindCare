"""Common pagination classes for the project."""

from rest_framework.pagination import LimitOffsetPagination, PageNumberPagination


class StandardResultsSetPagination(PageNumberPagination):
    """Default pagination for most list endpoints."""

    page_size = 25
    page_size_query_param = "page_size"
    max_page_size = 100


class ConversationPagination(PageNumberPagination):
    """Smaller page size tailored for inbox-style listings."""

    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class MessagePagination(LimitOffsetPagination):
    """Allow clients to page through chat messages efficiently."""

    default_limit = 50
    max_limit = 200


class SearchPagination(PageNumberPagination):
    """Expose shorter pages for catalogue/search results."""

    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 100

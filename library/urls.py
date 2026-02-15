from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookViewSet, IssueViewSet

# Create Router and register our ViewSets
router = DefaultRouter()
router.register(r'books', BookViewSet)   # API: /api/library/books/
router.register(r'issues', IssueViewSet) # API: /api/library/issues/

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
]
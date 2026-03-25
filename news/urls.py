from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NewsCategoryViewSet, NewsTagViewSet, NewsArticleViewSet, BannerViewSet

router = DefaultRouter()
router.register(r'categories', NewsCategoryViewSet, basename='news-category')
router.register(r'tags', NewsTagViewSet, basename='news-tag')
router.register(r'articles', NewsArticleViewSet, basename='news-article')
router.register(r'banners', BannerViewSet, basename='news-banner')

urlpatterns = [
    path('', include(router.urls)),
]

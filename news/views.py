from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import NewsCategory, NewsTag, NewsArticle, Banner
from .serializers import NewsCategorySerializer, NewsTagSerializer, NewsArticleSerializer, BannerSerializer

class NewsCategoryViewSet(viewsets.ModelViewSet):
    queryset = NewsCategory.objects.filter(is_active=True)
    serializer_class = NewsCategorySerializer

class NewsTagViewSet(viewsets.ModelViewSet):
    queryset = NewsTag.objects.all()
    serializer_class = NewsTagSerializer

class NewsArticleViewSet(viewsets.ModelViewSet):
    serializer_class = NewsArticleSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'state', 'district', 'is_featured']
    search_fields = ['title', 'content', 'state', 'district']
    ordering_fields = ['created_at', 'views_count']

    def get_queryset(self):
        # Frontend par sirf 'Published' news dikhegi, par Admin sab kuch dekh sakta hai
        if self.request.user.is_staff or self.request.user.is_superuser:
            return NewsArticle.objects.all().order_by('-created_at')
        return NewsArticle.objects.filter(status='published').order_by('-created_at')

class BannerViewSet(viewsets.ModelViewSet):
    queryset = Banner.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = BannerSerializer

from rest_framework import serializers
from .models import NewsCategory, NewsTag, NewsArticle, Banner

class NewsCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsCategory
        fields = '__all__'

class NewsTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsTag
        fields = '__all__'

class NewsArticleSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    tags_names = serializers.StringRelatedField(source='tags', many=True, read_only=True)
    # 🔥 FIXED: Changed author.username to author.full_name
    author_name = serializers.CharField(source='author.full_name', read_only=True, default='Admin')

    class Meta:
        model = NewsArticle
        fields = [
            'id', 'title', 'slug', 'content', 'category', 'category_name', 
            'tags', 'tags_names', 'author', 'author_name', 'state', 'district', 
            'featured_image', 'is_featured', 'status', 'views_count', 
            'created_at', 'updated_at'
        ]

class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = '__all__'

from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import NewsCategory, NewsTag, NewsArticle, Banner

@admin.register(NewsArticle)
class NewsArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'status', 'is_featured', 'created_at')
    list_filter = ('status', 'category', 'is_featured', 'state')
    search_fields = ('title', 'content')
    prepopulated_fields = {'slug': ('title',)} # Auto-generate slug from title
    filter_horizontal = ('tags',)

admin.site.register(NewsCategory)
admin.site.register(NewsTag)
admin.site.register(Banner)
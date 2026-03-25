from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

# 1. News Categories (e.g., Education, Board Exams, Competitions)
class NewsCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "News Categories"

    def __str__(self):
        return self.name

# 2. News Tags for SEO and Filtering
class NewsTag(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

# 3. Main News Article Model
class NewsArticle(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived')
    )

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True, null=True, help_text="URL friendly title")
    content = models.TextField(help_text="Rich Text Content (TipTap/Quill format)")
    
    category = models.ForeignKey(NewsCategory, on_delete=models.SET_NULL, null=True, related_name="articles")
    tags = models.ManyToManyField(NewsTag, blank=True, related_name="articles")
    
    # Author/Editor
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="authored_news")
    
    # Place Tagging (State & District as per 10k Scope PDF)
    state = models.CharField(max_length=100, blank=True, null=True)
    district = models.CharField(max_length=100, blank=True, null=True)
    
    featured_image = models.ImageField(upload_to='news_images/', blank=True, null=True)
    
    is_featured = models.BooleanField(default=False, help_text="Show in Hero Section / Top Banner")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    views_count = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

# 4. Frontend Banners / Sliders
class Banner(models.Model):
    title = models.CharField(max_length=150)
    image = models.ImageField(upload_to='banners/')
    link_url = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
from django.core.management.base import BaseCommand
from news.models import NewsCategory, NewsTag, NewsArticle, Banner
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with initial News data'

    def handle(self, *args, **kwargs):
        self.stdout.write("⏳ Seeding News Data started...")

        # 🔥 FIXED: Used 'email' and 'full_name' instead of 'username'
        admin_user, _ = User.objects.get_or_create(email='admin@shivadda.com', defaults={'password': 'password123', 'full_name': 'News Admin'})

        # 1. Categories
        cat1, _ = NewsCategory.objects.get_or_create(name='Competitions News')
        cat2, _ = NewsCategory.objects.get_or_create(name='Board Exam Updates')
        cat3, _ = NewsCategory.objects.get_or_create(name='Career Guidance')

        # 2. Tags
        tag1, _ = NewsTag.objects.get_or_create(name='UPSC')
        tag2, _ = NewsTag.objects.get_or_create(name='GSEB')
        tag3, _ = NewsTag.objects.get_or_create(name='BCA')

        # 3. Banners
        Banner.objects.get_or_create(
            title='Prepare for Exams 2026', 
            image='https://images.unsplash.com/photo-1513258496099-4816c0245304?w=1200&q=80'
        )

        # 4. Articles
        art1, _ = NewsArticle.objects.get_or_create(
            title='UPSC CSE 2026 Notification Released',
            slug='upsc-cse-2026-notification',
            defaults={
                'content': 'The Union Public Service Commission has released the much-awaited notification for the 2026 Civil Services Examination...',
                'category': cat1, 'author': admin_user, 'status': 'published', 'is_featured': True,
                'state': 'Delhi', 'views_count': 1250,
                'featured_image': 'https://images.unsplash.com/photo-1585432959315-d9342fd58eb6?w=800&q=80'
            }
        )
        art1.tags.add(tag1)

        art2, _ = NewsArticle.objects.get_or_create(
            title='Gujarat Board Class 12 Results Date Announced',
            slug='gseb-class-12-results-2026',
            defaults={
                'content': 'GSEB is set to announce the Class 12 board results by next week. Students are advised to keep their roll numbers ready...',
                'category': cat2, 'author': admin_user, 'status': 'published', 'is_featured': False,
                'state': 'Gujarat', 'views_count': 840,
                'featured_image': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80'
            }
        )
        art2.tags.add(tag2)

        art3, _ = NewsArticle.objects.get_or_create(
            title='Top 10 Career Options After BCA',
            slug='career-after-bca',
            defaults={
                'content': 'Explore the best career paths in Data Science, AI, and Software Engineering. The IT sector is booming...',
                'category': cat3, 'author': admin_user, 'status': 'published', 'is_featured': False,
                'state': 'All India', 'views_count': 3200,
                'featured_image': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80'
            }
        )
        art3.tags.add(tag3)

        self.stdout.write(self.style.SUCCESS("✅ News Database Seeded Successfully! Refresh your Frontend."))

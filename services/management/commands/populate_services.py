from django.core.management.base import BaseCommand
from services.models import ServiceType, ServiceMode, EducationLevel
from django.utils.text import slugify

class Command(BaseCommand):
    help = "Populates initial master data for Services app safely"

    def handle(self, *args, **kwargs):
        self.stdout.write("🌱 Seeding Service Master Data...")

        def get_code(text):
            return slugify(text).upper().replace("-", "_")

        # --- 1. SERVICE TYPES (Isme 'code' field hai) ---
        types = [
            "School", 
            "College / University", 
            "Coaching Institute", 
            "Vocational Training Center",
            "Library",
            "Hostel / PG",
            "Sports Academy",
            "Online Platform"
        ]
        for name in types:
            ServiceType.objects.update_or_create(
                name=name, 
                defaults={'code': get_code(name)}
            )
        self.stdout.write(self.style.SUCCESS(f"✅ Service Types Processed"))

        # --- 2. SERVICE MODES (Isme 'code' nahi hai - Sirf Name) ---
        modes = [
            "Offline (On-Campus)", 
            "Online (Live Classes)", 
            "Recorded (Self-Paced)", 
            "Hybrid (Blended Learning)"
        ]
        for name in modes:
            ServiceMode.objects.get_or_create(name=name)
        self.stdout.write(self.style.SUCCESS(f"✅ Service Modes Processed"))

        # --- 3. EDUCATION LEVELS (Isme bhi 'code' nahi hai - Sirf Name) ---
        levels = [
            "Pre-Primary",
            "Primary",
            "Middle",
            "Secondary",
            "Senior Secondary",
            "Undergraduate (UG)",
            "Postgraduate (PG)",
            "Diploma / Certification",
            "Competitive Exams",
            "Skill Development"
        ]
        for name in levels:
            EducationLevel.objects.get_or_create(name=name)
        self.stdout.write(self.style.SUCCESS(f"✅ Education Levels Processed"))

        self.stdout.write(self.style.SUCCESS("\n🎉 SERVICE MASTER DATA POPULATED SUCCESSFULLY!"))

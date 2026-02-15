from django.core.management.base import BaseCommand
from institutions.models import Institution
from locations.models import LocationMaster, City, State, Country, Continent
from services.models import ServiceType, ServiceMode, EducationLevel
import random

class Command(BaseCommand):
    help = "Populates dummy institutions safely (Minimal Fields)"

    def handle(self, *args, **kwargs):
        self.stdout.write("🌱 Seeding Institutions...")

        # --- STEP 1: Ensure Location Exists (Minimal) ---
        continent, _ = Continent.objects.get_or_create(name="Asia")
        country, _ = Country.objects.get_or_create(name="India", continent=continent)
        state, _ = State.objects.get_or_create(name="Delhi", country=country)
        city, _ = City.objects.get_or_create(name="New Delhi", state=state)
        
        # FIX: Sirf City pass kar rahe hain, koi extra field nahi jo error de
        location, _ = LocationMaster.objects.get_or_create(
            city=city
        )
        self.stdout.write(f"📍 Location checked: {city.name}")

        # --- STEP 2: Fetch Services ---
        try:
            type_school = ServiceType.objects.filter(name__icontains="School").first()
            type_coaching = ServiceType.objects.filter(name__icontains="Coaching").first()
            
            mode_offline = ServiceMode.objects.filter(name__icontains="Offline").first()
            mode_hybrid = ServiceMode.objects.filter(name__icontains="Hybrid").first()
            
            if not type_school or not type_coaching:
                self.stdout.write(self.style.ERROR("❌ Service Types missing! Run 'python manage.py populate_services' first."))
                return
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Error fetching services: {e}"))
            return

        # --- STEP 3: Create Institutions ---
        demos = [
            {
                "name": "Delhi Public School (Demo)",
                "code": "DPS-DEL-01",
                "email": "info@dpsdemo.com",
                "phone": "9876543210",
                "type": type_school,
                "mode": mode_offline,
                "principal": "Dr. R.K. Sharma"
            },
            {
                "name": "Allen Career Institute (Demo)",
                "code": "ALLEN-DEL-01",
                "email": "contact@allendemo.com",
                "phone": "9123456780",
                "type": type_coaching,
                "mode": mode_hybrid,
                "principal": "Mr. Maheshwari"
            },
            {
                "name": "Physics Wallah Vidyapeeth (Demo)",
                "code": "PW-VP-01",
                "email": "support@pwdemo.com",
                "phone": "8800880088",
                "type": type_coaching,
                "mode": mode_offline,
                "principal": "Alakh Sir"
            }
        ]

        for data in demos:
            inst, created = Institution.objects.update_or_create(
                code=data['code'],
                defaults={
                    'name': data['name'],
                    'contact_email': data['email'],
                    'contact_phone': data['phone'],
                    'location': location,
                    'service_type': data['type'],
                    'service_mode': data['mode'],
                    'principal_name': data['principal'],
                    'subscription_plan': 'PREMIUM',
                    'is_active': True
                }
            )
            
            # Education Levels add karein
            levels = EducationLevel.objects.all()[:4]
            inst.levels.set(levels)
            inst.save()
            
            status = "Created" if created else "Updated"
            self.stdout.write(f"🏫 {status}: {inst.name}")

        self.stdout.write(self.style.SUCCESS("\n🎉 INSTITUTIONS POPULATED SUCCESSFULLY!"))

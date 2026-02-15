import os
import django
import random

# --- DJANGO SETUP ---
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

# --- CORRECT IMPORTS ---
from api.models import Institution, Location, Service
from django.contrib.auth.models import User  # User yahan se aata hai

print("ðŸŒ Seeding Global Data (Schools, Locations, Services)...")

# --- 1. SEED LOCATIONS ---
locations_data = [
    {"city": "New Delhi", "state": "Delhi", "country": "India"},
    {"city": "Bangalore", "state": "Karnataka", "country": "India"},
    {"city": "Mumbai", "state": "Maharashtra", "country": "India"},
    {"city": "New York", "state": "NY", "country": "USA"},
    {"city": "London", "state": "England", "country": "UK"},
]

loc_objs = []
for loc in locations_data:
    try:
        l, created = Location.objects.get_or_create(
            city=loc["city"],
            defaults={"state": loc["state"], "country": loc["country"]}
        )
        if created:
            print(f"âœ… Added Location: {loc['city']}")
        loc_objs.append(l)
    except Exception as e:
        print(f"âš ï¸ Skipped Location {loc['city']}: {e}")

# --- 2. SEED INSTITUTIONS (Schools) ---
schools_data = [
    "Shivadda High School",
    "Global Tech Academy",
    "Sunrise Public School",
    "Green Valley International",
    "Elite Scholars Hub"
]

for name in schools_data:
    try:
        # Assign a random location
        loc = random.choice(loc_objs) if loc_objs else None
        s, created = Institution.objects.get_or_create(
            name=name,
            defaults={"address": f"123 Street, {loc.city if loc else 'City'}", "contact_email": f"info@{name.lower().replace(' ', '')}.com"}
        )
        if created:
            print(f"ðŸ« Added School: {name}")
    except Exception as e:
        print(f"âš ï¸ Skipped School {name}: {e}")

# --- 3. SEED SERVICES ---
services = ["LMS Access", "Transport", "Hostel", "Library", "Canteen"]
for srv in services:
    try:
        s, created = Service.objects.get_or_create(name=srv, defaults={"price": random.randint(500, 5000)})
        if created:
            print(f"ðŸ› ï¸ Added Service: {srv}")
    except Exception as e:
        pass

print("\nðŸŽ‰ Global Data Populated! Refresh your Dashboard.")

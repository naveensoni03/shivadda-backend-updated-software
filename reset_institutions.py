import os
import sys
import django
from django.db import connection

# ✅ FIX: Current folder ko system path me jodo
sys.path.append(os.getcwd())

# Settings module setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shivadda_platform.settings')
django.setup()

def reset_app():
    print("🛠️  Fixing Database Tables...")
    with connection.cursor() as cursor:
        # 1. Purani Migration History Delete
        try:
            cursor.execute("DELETE FROM django_migrations WHERE app = 'institutions';")
            print("✅ Migration History Cleared.")
        except Exception:
            print("ℹ️  Migration history was already clean.")

        # 2. Purana Table Delete
        try:
            cursor.execute("DROP TABLE IF EXISTS institutions_institution;")
            print("✅ Old Table 'institutions_institution' Dropped.")
        except Exception as e:
            print(f"⚠️ Table drop skipped: {e}")

    print("\n🚀 DONE! Now run these commands:")
    print("1. python manage.py makemigrations institutions")
    print("2. python manage.py migrate")

if __name__ == "__main__":
    reset_app()

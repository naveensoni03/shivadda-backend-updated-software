from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = "Resets the institutions app database tables safely (Including Many-to-Many)"

    def handle(self, *args, **kwargs):
        self.stdout.write("🛠️  Fixing Database Tables via Django...")
        with connection.cursor() as cursor:
            # 1. Clear Migration History
            try:
                cursor.execute("DELETE FROM django_migrations WHERE app = 'institutions';")
                self.stdout.write(self.style.SUCCESS("✅ Migration History Cleared."))
            except Exception:
                pass

            # 2. Drop Main Table
            try:
                cursor.execute("DROP TABLE IF EXISTS institutions_institution;")
                self.stdout.write(self.style.SUCCESS("✅ Main Table 'institutions_institution' Dropped."))
            except Exception as e:
                pass

            # 3. Drop Many-to-Many Tables (Jahan fas raha hai)
            try:
                cursor.execute("DROP TABLE IF EXISTS institutions_institution_levels;")
                self.stdout.write(self.style.SUCCESS("✅ M2M Table 'institutions_institution_levels' Dropped."))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"⚠️ M2M Table drop skipped: {e}"))

        self.stdout.write(self.style.SUCCESS("\n🚀 DATABASE CLEANED! Ready for new migrations."))

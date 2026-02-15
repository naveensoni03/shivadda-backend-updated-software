from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = "Resets Academic Suite including Profiles"

    def handle(self, *args, **kwargs):
        self.stdout.write("🛠️  Cleaning Database (Adding Profiles)...")
        with connection.cursor() as cursor:
            # 1. Apps to clean (Added profiles)
            apps = ['courses', 'batches', 'fees', 'exams', 'students', 'attendance', 'profiles']
            
            for app in apps:
                try:
                    cursor.execute(f"DELETE FROM django_migrations WHERE app = '{app}';")
                    self.stdout.write(self.style.SUCCESS(f"✅ History Cleared for '{app}'"))
                except Exception:
                    pass

            # 2. Drop Tables (Added profiles tables)
            tables = [
                'profiles_profile',      # Generic profile
                'profiles_studentprofile',
                'profiles_teacherprofile',
                'fees_fee',
                'attendance_attendance',
                'exams_result',
                'exams_exam',
                'students_student',
                'courses_resource', 
                'courses_lesson', 
                'courses_subject', 
                'courses_virtualclass', 
                'courses_batch',
                'batches_batch',
                'courses_course'
            ]
            
            for table in tables:
                try:
                    cursor.execute(f"DROP TABLE IF EXISTS {table};")
                    self.stdout.write(self.style.SUCCESS(f"✅ Table '{table}' Dropped."))
                except Exception as e:
                    pass

        self.stdout.write(self.style.SUCCESS("\n🚀 SYSTEM CLEANED! Ready to rebuild."))

from django.core.management.base import BaseCommand
from exams.models import EducationLevel, AcademicClass, SubClass, Subject, SyllabusUnit, Chapter, ExamBlueprint

class Command(BaseCommand):
    help = 'Seeds the database with initial Academic Hierarchy and Exam Blueprint data'

    def handle(self, *args, **kwargs):
        self.stdout.write("⏳ Seeding Academic Data started...")

        # 1. Education Levels (FIXED: Removed 'description')
        sec_level, _ = EducationLevel.objects.get_or_create(name="Secondary")
        higher_sec_level, _ = EducationLevel.objects.get_or_create(name="Higher Secondary")
        ug_level, _ = EducationLevel.objects.get_or_create(name="Undergraduate (UG)")

        # 2. Academic Classes
        class_10, _ = AcademicClass.objects.get_or_create(level=sec_level, name="Class 10")
        class_12, _ = AcademicClass.objects.get_or_create(level=higher_sec_level, name="Class 12")
        bca, _ = AcademicClass.objects.get_or_create(level=ug_level, name="BCA")

        # 3. Subclasses (Sections / Streams)
        sec_a_10, _ = SubClass.objects.get_or_create(academic_class=class_10, name="Section A")
        science_12, _ = SubClass.objects.get_or_create(academic_class=class_12, name="Science Stream")
        bca_sem1, _ = SubClass.objects.get_or_create(academic_class=bca, name="Semester 1")

        # 4. Subjects
        physics, _ = Subject.objects.get_or_create(subclass=science_12, name="Physics")
        maths, _ = Subject.objects.get_or_create(subclass=science_12, name="Mathematics")
        c_prog, _ = Subject.objects.get_or_create(subclass=bca_sem1, name="C Programming")

        # 5. Syllabus Units
        unit_1_phy, _ = SyllabusUnit.objects.get_or_create(subject=physics, name="Unit 1: Mechanics")
        unit_1_maths, _ = SyllabusUnit.objects.get_or_create(subject=maths, name="Unit 1: Calculus")

        # 6. Chapters
        Chapter.objects.get_or_create(unit=unit_1_phy, name="Laws of Motion")
        Chapter.objects.get_or_create(unit=unit_1_phy, name="Work, Energy and Power")
        Chapter.objects.get_or_create(unit=unit_1_maths, name="Limits and Derivatives")

        self.stdout.write(self.style.SUCCESS("✅ Academic Hierarchy Seeded Successfully!"))

        # 7. Exam Blueprints
        self.stdout.write("⏳ Seeding Exam Blueprints...")
        
        ExamBlueprint.objects.get_or_create(
            name="Standard 100 Marks MCQ",
            defaults={
                'total_questions': 100,
                'max_marks': 100.0,
                'positive_mark_per_q': 1.0,
                'negative_mark_per_q': 0.25,
                'unattempted_mark_per_q': 0.0,
                'passing_percentage': 33.0
            }
        )

        ExamBlueprint.objects.get_or_create(
            name="JEE Mains Pattern",
            defaults={
                'total_questions': 90,
                'max_marks': 300.0,
                'positive_mark_per_q': 4.0,
                'negative_mark_per_q': 1.0,
                'unattempted_mark_per_q': 0.0,
                'passing_percentage': 0.0
            }
        )

        self.stdout.write(self.style.SUCCESS("✅ Exam Blueprints Seeded Successfully!"))
        self.stdout.write(self.style.SUCCESS("🚀 All Setup Complete. Ready for Frontend Integration!"))

from django.contrib import admin
from .models import (
    Course, Batch, Subject, Lesson, Resource, VirtualClass, LessonProgress,
    AcademicLevel, AcademicClass, SubClass, AcademicSubject, Timetable, StudyMaterial
)

# ==========================================
# 🛑 OLD SYSTEM: COURSES, BATCHES, LESSONS
# ==========================================
class CourseAdmin(admin.ModelAdmin):
    # 🔥 NAYA: Client ki hierarchy (state, service, class) ko table aur filter me add kar diya
    list_display = ('name', 'code', 'institution', 'state', 'service_id', 'student_class', 'is_active')
    search_fields = ('name', 'code', 'place_id')
    list_filter = ('institution', 'service_id', 'student_class', 'state', 'is_active')

class BatchAdmin(admin.ModelAdmin):
    list_display = ('name', 'course', 'start_date', 'max_students', 'is_active')

class VirtualClassAdmin(admin.ModelAdmin):
    list_display = ('title', 'batch', 'scheduled_at', 'meeting_link')

# Registering old models
admin.site.register(Course, CourseAdmin)
admin.site.register(Batch, BatchAdmin)
admin.site.register(Subject)
admin.site.register(Lesson)
admin.site.register(Resource)
admin.site.register(VirtualClass, VirtualClassAdmin)
admin.site.register(LessonProgress)

# ==========================================
# 🚀 NEW SYSTEM: PHASE 2 ACADEMIC HIERARCHY 
# (Client's Management Area / Editor)
# ==========================================

@admin.register(AcademicLevel)
class AcademicLevelAdmin(admin.ModelAdmin):
    list_display = ('name', 'get_description')
    search_fields = ('name',)
    
    def get_description(self, obj):
        return obj.description[:50] + '...' if obj.description else 'No Description'
    get_description.short_description = 'Description'

@admin.register(AcademicClass)
class AcademicClassAdmin(admin.ModelAdmin):
    list_display = ('name', 'level', 'code')
    list_filter = ('level',)  # Right side filter (Client's Universal Selection)
    search_fields = ('name', 'code')

@admin.register(SubClass)
class SubClassAdmin(admin.ModelAdmin):
    list_display = ('name', 'academic_class', 'class_incharge')
    list_filter = ('academic_class__level', 'academic_class')
    search_fields = ('name',)
    raw_id_fields = ('class_incharge',) # Teacher select karne ke liye smart box

@admin.register(AcademicSubject)
class AcademicSubjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'subclass', 'subject_teacher', 'is_ai_assisted')
    list_filter = ('is_ai_assisted', 'subclass__academic_class')
    search_fields = ('name',)
    raw_id_fields = ('subject_teacher',)
    list_editable = ('is_ai_assisted',) # Bahar se hi AI on/off karne ka toggle

@admin.register(Timetable)
class TimetableAdmin(admin.ModelAdmin):
    list_display = ('subject', 'day_of_week', 'start_time', 'end_time', 'is_ai_scheduled')
    list_filter = ('day_of_week', 'is_ai_scheduled')
    list_editable = ('is_ai_scheduled',)

@admin.register(StudyMaterial)
class StudyMaterialAdmin(admin.ModelAdmin):
    list_display = ('title', 'subject', 'material_type', 'uploaded_at')
    list_filter = ('material_type', 'uploaded_at')
    search_fields = ('title',)
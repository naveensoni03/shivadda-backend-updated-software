from django.contrib import admin
from .models import Course, Batch, Subject, Lesson, Resource, VirtualClass

# Better Admin View for Courses
class CourseAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'institution', 'fee_per_year', 'is_active')
    search_fields = ('name', 'code')
    list_filter = ('institution', 'is_active')

class BatchAdmin(admin.ModelAdmin):
    list_display = ('name', 'course', 'start_date', 'max_students', 'is_active')

class VirtualClassAdmin(admin.ModelAdmin):
    list_display = ('title', 'batch', 'scheduled_at', 'meeting_link')

admin.site.register(Course, CourseAdmin)
admin.site.register(Batch, BatchAdmin)
admin.site.register(Subject)
admin.site.register(Lesson)
admin.site.register(Resource)
admin.site.register(VirtualClass, VirtualClassAdmin)
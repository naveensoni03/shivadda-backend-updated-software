from django.contrib import admin
from .models import Place

@admin.register(Place)
class PlaceAdmin(admin.ModelAdmin):
    list_display = ('name', 'place_type', 'hierarchy_code', 'virtual_id', 'parent', 'status')
    list_filter = ('place_type', 'status')
    search_fields = ('name', 'hierarchy_code', 'virtual_id')
    ordering = ('hierarchy_code',)
    readonly_fields = ('hierarchy_code', 'virtual_id') # Ye auto-generate hote hain
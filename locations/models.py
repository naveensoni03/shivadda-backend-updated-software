from django.db import models
import uuid

class Place(models.Model):
    PLACE_TYPES = (
        ('Global', 'Global'),
        ('Continent', 'Continent'),
        ('Country', 'Country'),
        ('State', 'State'),
        ('District', 'District'),
        ('Tehsil', 'Tehsil'),
        ('Block', 'Block'),
        ('Village', 'Village'),
        ('School', 'School/Center'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    
    # ✅ Parent Link (Recursive Relationship)
    parent = models.ForeignKey('self', null=True, blank=True, related_name='children', on_delete=models.CASCADE)
    
    # ✅ Auto-Generated Codes
    hierarchy_code = models.CharField(max_length=100, blank=True, help_text="Auto: 0.1.1.1")
    virtual_id = models.CharField(max_length=50, unique=True, blank=True, editable=False)
    
    place_type = models.CharField(max_length=50, choices=PLACE_TYPES, default='Global')
    
    # Extra Data
    latitude = models.CharField(max_length=50, blank=True, null=True)
    longitude = models.CharField(max_length=50, blank=True, null=True)
    status = models.CharField(max_length=20, default='Active', choices=[('Active', 'Active'), ('Inactive', 'Inactive')])
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['hierarchy_code']

    def save(self, *args, **kwargs):
        # 1. Hierarchy Code Logic (0.1.1...)
        if not self.hierarchy_code:
            if self.parent:
                parent_code = self.parent.hierarchy_code
                count = self.parent.children.count() + 1
                self.hierarchy_code = f"{parent_code}.{count}"
            else:
                count = Place.objects.filter(parent__isnull=True).count()
                self.hierarchy_code = f"0.{count}" if count > 0 else "0"

        # 2. Virtual ID Logic (SHIV-IND-DL-001)
        if not self.virtual_id:
            prefix = self.name[:3].upper()
            unique_seq = str(uuid.uuid4().int)[:6]
            self.virtual_id = f"SHIV-{prefix}-{unique_seq}"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.hierarchy_code})"
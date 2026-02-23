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
        ('Colony', 'Colony'),
        ('Village', 'Village'),
        ('School', 'School/Center'),
    )

    # ✅ FIXED: Status choices ko React Frontend ke payload ('ACTIVE', 'INACTIVE') se match kiya gaya
    STATUS_CHOICES = (
        ('ACTIVE', 'Active / Show'),
        ('INACTIVE', 'Inactive / Hide'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    
    # Parent Link (Recursive Relationship for Hierarchy)
    parent = models.ForeignKey('self', null=True, blank=True, related_name='children', on_delete=models.CASCADE)
    
    # Auto-Generated Codes
    hierarchy_code = models.CharField(max_length=100, blank=True, help_text="Auto: 0.1.1.1")
    
    # Virtual ID Frontend se bhi aa sakti hai ya Auto-generate hogi
    virtual_id = models.CharField(max_length=100, unique=True, blank=True, null=True) 
    
    place_type = models.CharField(max_length=50, choices=PLACE_TYPES, default='Global')
    
    # --- SUPER ADMIN FIELDS (Geographical & Deep Config) ---
    space_type = models.CharField(max_length=50, null=True, blank=True)
    place_uses_for = models.CharField(max_length=100, null=True, blank=True)
    pin_code = models.CharField(max_length=20, null=True, blank=True)
    zip_code = models.CharField(max_length=20, null=True, blank=True)
    beat_no = models.CharField(max_length=50, null=True, blank=True)
    village_code = models.CharField(max_length=50, null=True, blank=True)
    google_map_id = models.CharField(max_length=255, null=True, blank=True)
    latitude = models.CharField(max_length=100, null=True, blank=True)
    longitude = models.CharField(max_length=100, null=True, blank=True)
    work_status = models.CharField(max_length=50, null=True, blank=True)
    
    status = models.CharField(max_length=20, default='ACTIVE', choices=STATUS_CHOICES)
    
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

        # 2. Virtual ID Logic - Agar frontend ne Virtual ID nahi bheji, tabhi auto-generate kare
        if not self.virtual_id:
            prefix = self.name[:3].upper() if self.name else "PLC"
            unique_seq = str(uuid.uuid4().int)[:6]
            self.virtual_id = f"SHIV-{prefix}-{unique_seq}"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.hierarchy_code})"
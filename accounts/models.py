from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone
from django.conf import settings

# ----------------------------------------------------------------
# 1. Custom User Manager
# ----------------------------------------------------------------
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, role="STUDENT", **extra_fields):
        if not email:
            raise ValueError("Email is required")

        email = self.normalize_email(email)
        user = self.model(email=email, role=role, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "SUPER_ADMIN")
        extra_fields.setdefault("account_status", "ACTIVE")
        return self.create_user(email, password, **extra_fields)


# ----------------------------------------------------------------
# 2. Main Custom User Model (Updated)
# ----------------------------------------------------------------
class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ("SUPER_ADMIN", "Super Admin"),
        ("SCHOOL_ADMIN", "School Admin"),
        ("STAFF", "Staff"),
        ("AGENT", "Agent"),
        ("ADMIN", "Admin"),
        ("TEACHER", "Teacher"),
        ("STUDENT", "Student"),
        ("PARENT", "Parent"),
    )

    # ✅ New: Deep Feature Status
    STATUS_CHOICES = [
        ('ACTIVE', 'Active (Can Login)'),
        ('INACTIVE', 'Inactive (Suspended)'),
        ('HIBERNATE', 'Hibernate (Long Leave/Backup)'),
    ]

    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, blank=True, null=True) # Global Phone Field
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default="STUDENT")
    
    # Status Control
    account_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    # ✅ Audit Log (Kisne Banaya)
    created_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)

    # Virtual Storage Fields
    storage_limit_mb = models.IntegerField(default=500, help_text="Total Allocated Space in MB")
    storage_used_mb = models.FloatField(default=0.0, help_text="Space Used in MB")

    groups = models.ManyToManyField("auth.Group", related_name="accounts_users", blank=True)
    user_permissions = models.ManyToManyField("auth.Permission", related_name="accounts_users_permissions", blank=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    def save(self, *args, **kwargs):
        # ✅ Deep Feature: Sync 'is_active' with 'account_status'
        if self.account_status == 'ACTIVE':
            self.is_active = True
        else:
            self.is_active = False # Inactive aur Hibernate me login band
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.email} ({self.role})"


# ----------------------------------------------------------------
# 3. Agent Profile Model
# ----------------------------------------------------------------
class Agent(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="agent_profile")
    phone = models.CharField(max_length=15)
    department = models.CharField(max_length=50)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.email


# ----------------------------------------------------------------
# 4. Parent Profile Model
# ----------------------------------------------------------------
class ParentProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='parent_profile')
    students = models.ManyToManyField('students.Student', related_name='parents') 
    phone = models.CharField(max_length=15)

    def __str__(self):
        return f"Parent: {self.user.full_name}"
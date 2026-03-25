"""
Django settings for core project.
"""
import os
from dotenv import load_dotenv
load_dotenv()
from pathlib import Path
from datetime import timedelta
import dj_database_url

# --------------------------------------------------
# BASE DIR
# --------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

# --------------------------------------------------
# SECURITY
# --------------------------------------------------
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-r3o(a=*ksfv+bpb3f%7fr3y8^_x%cb@+l+#tm4h@5+ge8)v!)m')

DEBUG = True 

# 🔥 UPDATED: Added specific hosts for production
ALLOWED_HOSTS = [
    'shivadda-backend-updated-software.onrender.com', 
    'shivadda-backend-updated-software.vercel.app',
    'localhost', 
    '127.0.0.1',
    '*' # Testing ke liye allow rakha hai
]

# --------------------------------------------------
# APPLICATIONS
# --------------------------------------------------
INSTALLED_APPS = [
    'interactions',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    'rest_framework',
    'corsheaders', # 🔥 CORS is important
    'django_filters',
    'django_cleanup.apps.CleanupConfig',
    'rest_framework_simplejwt',

    'api', 'accounts', 'dashboard', 'chatbot', 'centers', 
    'locations', 'visitors', 'logs', 'students', 'teachers',
    'institutions', 'courses', 'batches', 'enrollments',
    'attendance', 'fees', 'exams', 'lms', 'library',
    'inventory', 'hostel', 'transport', 'payroll',
    'services', 'classifieds', 'payments', 'profiles',
    'agents', 'timetable','news','parents',
]

# --------------------------------------------------
# MIDDLEWARE
# --------------------------------------------------
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', # 🔥 Must be at the top
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', 
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'core.middleware.LicenseVerificationMiddleware',
]

ROOT_URLCONF = 'core.urls'  

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application' 

DATABASES = {
    'default': dj_database_url.config(
        default='sqlite:///db.sqlite3',
        conn_max_age=600
    )
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = 'accounts.User'

# --------------------------------------------------
# 🔥 CORS & CSRF SETTINGS (FIXED FOR VERCEL ERROR)
# --------------------------------------------------
CORS_ALLOW_ALL_ORIGINS = True # Development ke liye easy rakha hai
CORS_ALLOW_CREDENTIALS = True

# Specific origins for safety
CORS_ALLOWED_ORIGINS = [
    "https://shivadda-backend-updated-software.vercel.app",
    "http://localhost:5173",
]

# CSRF Trusted origins (Render needs this)
CSRF_TRUSTED_ORIGINS = [
    "https://shivadda-backend-updated-software.onrender.com",
    "https://shivadda-backend-updated-software.vercel.app"
]

# --------------------------------------------------
# DRF + JWT SETTINGS
# --------------------------------------------------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication', 
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny', 
    ],
    'DEFAULT_PAGINATION_CLASS': None,
    'PAGE_SIZE': None,
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1), 
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'AUTH_HEADER_TYPES': ('Bearer',),
}

TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
TWILIO_PHONE_NUMBER = os.getenv('TWILIO_PHONE_NUMBER')

# --------------------------------------------------
# 🔥 EMAIL SETTINGS (REAL MODE) 🔥
# --------------------------------------------------
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend' 
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER') 
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD') 
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER
EMAIL_TIMEOUT = 10 # Latency kam karne ke liye
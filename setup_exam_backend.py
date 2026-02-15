import os

# --- PATH SETUP (Change this if your app name is different) ---
BASE_DIR = os.getcwd()
BACKEND_APP_DIR = os.path.join(BASE_DIR, "backend", "api")

# Ensure directory exists
if not os.path.exists(BACKEND_APP_DIR):
    print(f"âš ï¸ Directory {BACKEND_APP_DIR} not found. Creating it...")
    os.makedirs(BACKEND_APP_DIR, exist_ok=True)

print(f"ðŸ”§ Setting up Django Backend for Exam Controller...")

# ==========================================
# 1. MODELS.PY (Database Table)
# ==========================================
models_code = """from django.db import models

class Question(models.Model):
    QUESTION_TYPES = [
        ('Descriptive', 'Descriptive'),
        ('MCQ', 'MCQ'),
        ('True/False', 'True/False'),
    ]
    DIFFICULTY_LEVELS = [
        ('Easy', 'Easy'),
        ('Medium', 'Medium'),
        ('Hard', 'Hard'),
    ]

    text = models.TextField()
    q_type = models.CharField(max_length=20, choices=QUESTION_TYPES, default='Descriptive')
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_LEVELS, default='Medium')
    marks = models.IntegerField(default=5)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.text[:50]
"""

with open(os.path.join(BACKEND_APP_DIR, "models.py"), "w") as f:
    f.write(models_code)
print("âœ… Created models.py (Question Table)")

# ==========================================
# 2. SERIALIZERS.PY (Data Converter)
# ==========================================
serializers_code = """from rest_framework import serializers
from .models import Question

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'
"""

with open(os.path.join(BACKEND_APP_DIR, "serializers.py"), "w") as f:
    f.write(serializers_code)
print("âœ… Created serializers.py")

# ==========================================
# 3. VIEWS.PY (API Logic)
# ==========================================
views_code = """from rest_framework import viewsets
from .models import Question
from .serializers import QuestionSerializer

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all().order_by('-created_at')
    serializer_class = QuestionSerializer
"""

with open(os.path.join(BACKEND_APP_DIR, "views.py"), "w") as f:
    f.write(views_code)
print("âœ… Created views.py")

# ==========================================
# 4. URLS.PY (API Links)
# ==========================================
urls_code = """from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuestionViewSet

router = DefaultRouter()
router.register(r'questions', QuestionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
"""

with open(os.path.join(BACKEND_APP_DIR, "urls.py"), "w") as f:
    f.write(urls_code)
print("âœ… Created urls.py")

print("\nðŸŽ‰ Backend Code Ready! Now run migrations.")

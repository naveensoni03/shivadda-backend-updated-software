import os
import django

# --- DJANGO SETUP ---
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Question

print("ðŸ”„ Seeding Database with Demo Questions...")

# --- DEMO DATA ---
questions_data = [
    {"text": "What is the capital of India?", "q_type": "MCQ", "difficulty": "Easy", "marks": 2},
    {"text": "Explain the Theory of Relativity in detail.", "q_type": "Descriptive", "difficulty": "Hard", "marks": 15},
    {"text": "Python is a compiled language.", "q_type": "True/False", "difficulty": "Easy", "marks": 1},
    {"text": "Who is known as the father of Computer?", "q_type": "MCQ", "difficulty": "Medium", "marks": 5},
    {"text": "Write a Python program to check prime numbers.", "q_type": "Descriptive", "difficulty": "Medium", "marks": 10},
    {"text": "What does HTML stand for?", "q_type": "MCQ", "difficulty": "Easy", "marks": 2},
    {"text": "Define Newton's Third Law of Motion.", "q_type": "Descriptive", "difficulty": "Medium", "marks": 5},
    {"text": "The Earth is flat.", "q_type": "True/False", "difficulty": "Easy", "marks": 1},
    {"text": "What is the chemical formula of Water?", "q_type": "MCQ", "difficulty": "Easy", "marks": 2},
    {"text": "Explain the difference between RAM and ROM.", "q_type": "Descriptive", "difficulty": "Hard", "marks": 10},
    {"text": "Which planet is known as the Red Planet?", "q_type": "MCQ", "difficulty": "Easy", "marks": 2},
    {"text": "Describe the process of Photosynthesis.", "q_type": "Descriptive", "difficulty": "Medium", "marks": 8},
]

# --- INSERT LOOP ---
count = 0
for q in questions_data:
    # Check if exists to avoid duplicates
    if not Question.objects.filter(text=q["text"]).exists():
        Question.objects.create(
            text=q["text"],
            q_type=q["q_type"],
            difficulty=q["difficulty"],
            marks=q["marks"]
        )
        count += 1
        print(f"âœ… Added: {q['text'][:30]}...")
    else:
        print(f"âš ï¸ Skipped (Already exists): {q['text'][:30]}...")

print(f"\nðŸŽ‰ Successfully added {count} new questions to Database!")

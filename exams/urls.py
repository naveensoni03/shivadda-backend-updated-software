from django.urls import path
from .views import (
    ExamAPI,
    QuestionAPI,             # 🚀 ADDED MISSING IMPORT
    QuestionBankAPI,
    SubmitExamAPI,
    EvaluationAPI,           # 🚀 ADDED MISSING IMPORT
    LiveQuizSessionAPI,      # 🚀 ADDED MISSING IMPORT
    UpdateQuizGroupScoreAPI, # 🚀 ADDED MISSING IMPORT
    AIEvaluateAPI,
    AIStudyPlanAPI,
    NotifyParentsAPI,
    generate_ai_quiz,
    save_ai_quiz,
    send_sms,
    receive_sms,
    get_incoming_messages,
    AssignmentAPI,           # 🚀 ADDED MISSING IMPORT
    AssignmentEvaluationAPI, # 🚀 ADDED MISSING IMPORT
    StudentResultsAPI,
    TeacherExamResultsAPI,
    StudentAttemptDetailsAPI
)

urlpatterns = [
    # ==========================================
    # 🚀 CORE EXAM & RESULTS ROUTES
    # ==========================================
    path("", ExamAPI.as_view(), name='exam-list'),
    path("<int:pk>/", ExamAPI.as_view(), name='exam-detail'),
    path("<int:exam_id>/submit/", SubmitExamAPI.as_view(), name='exam-submit'),
    path("my-results/", StudentResultsAPI.as_view(), name='student-results'),
    path("<int:exam_id>/results/", TeacherExamResultsAPI.as_view(), name='teacher-exam-results'),
    path("attempt/<int:attempt_id>/details/", StudentAttemptDetailsAPI.as_view(), name='attempt-details'),

    # ==========================================
    # 📝 QUESTIONS & QUESTION BANK
    # ==========================================
    path("questions/", QuestionAPI.as_view(), name='question-list'),
    path("questions/<int:pk>/", QuestionAPI.as_view(), name='question-detail'),
    path("question-bank/", QuestionBankAPI.as_view(), name='qbank-list'),
    path("question-bank/<int:pk>/", QuestionBankAPI.as_view(), name='qbank-detail'),

    # ==========================================
    # 👨‍🏫 TEACHER EVALUATIONS
    # ==========================================
    path("evaluations/", EvaluationAPI.as_view(), name='evaluation-list'),
    path("evaluations/<int:pk>/", EvaluationAPI.as_view(), name='evaluation-detail'),

    # ==========================================
    # 📚 ASSIGNMENTS (Missing in your code)
    # ==========================================
    path("assignments/", AssignmentAPI.as_view(), name='assignment-list'),
    path("assignments/<int:pk>/", AssignmentAPI.as_view(), name='assignment-detail'),
    path("assignments/<int:assignment_id>/evaluations/", AssignmentEvaluationAPI.as_view(), name='assignment-eval'),
    path("assignments/evaluations/<int:submission_id>/", AssignmentEvaluationAPI.as_view(), name='assignment-eval-update'),

    # ==========================================
    # 🏆 LIVE QUIZ (Missing in your code)
    # ==========================================
    path("live-quiz/", LiveQuizSessionAPI.as_view(), name='live-quiz-list'),
    path("live-quiz/group/<int:group_id>/update/", UpdateQuizGroupScoreAPI.as_view(), name='live-quiz-update'),

    # ==========================================
    # 🤖 AI & NOTIFICATIONS
    # ==========================================
    path("ai-evaluate/", AIEvaluateAPI.as_view(), name='ai-evaluate'),
    path("ai-study-plan/", AIStudyPlanAPI.as_view(), name='ai-study-plan'),
    path("generate-quiz/", generate_ai_quiz, name='generate_ai_quiz'),
    path("save-quiz/", save_ai_quiz, name='save_ai_quiz'),
    path("notify/", NotifyParentsAPI.as_view(), name='notify-parents'),

    # ==========================================
    # 📱 SMS
    # ==========================================
    path("send-sms/", send_sms, name='send-sms'),
    path("receive-sms/", receive_sms, name='receive-sms'),
    path("messages/", get_incoming_messages, name='messages'),
]
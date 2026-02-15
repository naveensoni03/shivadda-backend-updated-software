from django.urls import path
from .views import (
    ExamAPI,
    QuestionBankAPI,
    SubmitExamAPI,
    AIStudyPlanAPI,
    NotifyParentsAPI,
    generate_ai_quiz,
    save_ai_quiz,
    send_sms,
    receive_sms,
    get_incoming_messages,
    EvaluationAPI,
    AIEvaluateAPI
)

urlpatterns = [
    path("", ExamAPI.as_view()),

    # ✅ FULL CRUD
    path("questions/", QuestionBankAPI.as_view()),
    path("questions/<int:pk>/", QuestionBankAPI.as_view()),

    path("<int:exam_id>/submit/", SubmitExamAPI.as_view()),
    path("ai-study-plan/", AIStudyPlanAPI.as_view()),
    path("notify/", NotifyParentsAPI.as_view()),

    path("generate-quiz/", generate_ai_quiz, name='generate_ai_quiz'),
    path("save-quiz/", save_ai_quiz, name='save_ai_quiz'),

    # ✅ Evaluation APIs
    path("evaluations/", EvaluationAPI.as_view()),
    path("ai-evaluate/", AIEvaluateAPI.as_view()),

    path("send-sms/", send_sms),
    path("receive-sms/", receive_sms),
    path("messages/", get_incoming_messages),
]
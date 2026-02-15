from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Exam, Question, QuestionBank, DescriptiveSubmission, AIEvaluationLog, AnswerEvaluation

User = get_user_model()

# --- PAPER SETTER SERIALIZERS (UNTOUCHED) ---
class ExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        fields = "__all__"


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = "__all__"


class QuestionBankSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionBank
        fields = "__all__"


# --- EVALUATION SERIALIZERS (UPDATED) ---

# 1. Teacher Evaluation Serializer
class AnswerEvaluationSerializer(serializers.ModelSerializer):
    evaluator_name = serializers.CharField(source='evaluator.username', read_only=True)
    
    class Meta:
        model = AnswerEvaluation
        fields = ['id', 'evaluator_name', 'score_awarded', 'remarks', 'evaluated_at']

# 2. AI Evaluation Serializer
class AIEvaluationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIEvaluationLog
        fields = ['ai_score', 'ai_feedback', 'confidence_score']

# 3. Main Submission Serializer (Connects everything)
class EvaluationSerializer(serializers.ModelSerializer):
    # Nested data fetch kar raha hai
    manual_evaluations = AnswerEvaluationSerializer(source='evaluations', many=True, read_only=True)
    ai_result = AIEvaluationLogSerializer(source='aievaluationlog', read_only=True)
    student_name = serializers.CharField(source='student.username', read_only=True, default="Student")
    question_text = serializers.CharField(source='question.text', read_only=True)

    class Meta:
        model = DescriptiveSubmission
        fields = [
            'id', 'student_name', 'question_text', 'answer_text', 
            'submitted_at', 'manual_evaluations', 'ai_result'
        ]
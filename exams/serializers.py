from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Exam, Question, QuestionBank, DescriptiveSubmission, 
    AIEvaluationLog, AnswerEvaluation, Assignment, AssignmentSubmission
)

User = get_user_model()

# --- 🚀 UPDATED QUESTION SERIALIZER ---
class QuestionSerializer(serializers.ModelSerializer):
    # Frontend se options ek Array/List me aayenge: ["Delhi", "Mumbai", "Pune", "Kolkata"]
    # Hum usko receive karke backend me option_a, option_b banayenge
    options = serializers.ListField(
        child=serializers.CharField(allow_blank=True, required=False),
        write_only=True, 
        required=False
    )

    class Meta:
        model = Question
        # Saare naye fields yahan add kar diye hain
        fields = ['id', 'q_type', 'text', 'image', 'options', 'correct_option_index', 'marks', 'negative_marks']


# --- 🚀 UPDATED EXAM SERIALIZER (NESTED SAVE LOGIC) ---
class ExamSerializer(serializers.ModelSerializer):
    # Exam ke sath uske saare Questions bhi return honge aur save honge
    questions = QuestionSerializer(many=True, required=False)
    
    # Frontend se variables slightly alag naam se aa sakte hain, unko map kar diya
    subject = serializers.CharField(source='subject_name', required=False, allow_blank=True)
    date = serializers.DateField(source='exam_date', required=False, allow_null=True)

    class Meta:
        model = Exam
        fields = [
            'id', 'title', 'subject', 'date', 'start_time', 'end_time', 
            'duration_minutes', 'total_marks', 'negative_marks', 'status', 'questions'
        ]

    # 🔥 Create Exam + Multiple Questions together
    def create(self, validated_data):
        questions_data = validated_data.pop('questions', [])
        exam = Exam.objects.create(**validated_data)
        
        for q_data in questions_data:
            options = q_data.pop('options', ["", "", "", ""])
            Question.objects.create(
                exam=exam,
                option_a=options[0] if len(options) > 0 else "",
                option_b=options[1] if len(options) > 1 else "",
                option_c=options[2] if len(options) > 2 else "",
                option_d=options[3] if len(options) > 3 else "",
                **q_data
            )
        return exam

    # 🔥 Update Exam + Edit Questions together
    def update(self, instance, validated_data):
        questions_data = validated_data.pop('questions', None)
        
        # 1. Update Exam Meta details
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # 2. Update Questions (Purane delete karke naye fresh save kar rahe hain simplicity ke liye)
        if questions_data is not None:
            instance.questions.all().delete()
            for q_data in questions_data:
                options = q_data.pop('options', ["", "", "", ""])
                Question.objects.create(
                    exam=instance,
                    option_a=options[0] if len(options) > 0 else "",
                    option_b=options[1] if len(options) > 1 else "",
                    option_c=options[2] if len(options) > 2 else "",
                    option_d=options[3] if len(options) > 3 else "",
                    **q_data
                )
        return instance


# =========================================================================
# 👇 PURANA CODE EXACTLY SAME HAI BINA KISI CHANGE KE 👇
# =========================================================================

class QuestionBankSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionBank
        fields = "__all__"

class AnswerEvaluationSerializer(serializers.ModelSerializer):
    evaluator_name = serializers.CharField(source='evaluator.username', read_only=True)
    
    class Meta:
        model = AnswerEvaluation
        fields = ['id', 'evaluator_name', 'score_awarded', 'remarks', 'evaluated_at']

class AIEvaluationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIEvaluationLog
        fields = ['ai_score', 'ai_feedback', 'confidence_score']

class EvaluationSerializer(serializers.ModelSerializer):
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

# =========================================================================
# 🔥 NEW: ASSIGNMENT SERIALIZERS 🔥
# =========================================================================

class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.username', read_only=True)
    
    class Meta:
        model = AssignmentSubmission
        fields = ['id', 'assignment', 'student', 'student_name', 'submitted_file', 'submitted_at', 'status', 'marks_awarded', 'feedback']

class AssignmentSerializer(serializers.ModelSerializer):
    submitted_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Assignment
        fields = ['id', 'title', 'subject', 'max_marks', 'deadline_date', 'deadline_time', 'instructions', 'reference_file', 'status', 'created_at', 'submitted_count']

    # Ye function count karega kitne bacchon ne homework submit kiya hai
    def get_submitted_count(self, obj):
        return obj.submissions.count()
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Exam, Question, QuestionBank, DescriptiveSubmission, 
    AIEvaluationLog, AnswerEvaluation, Assignment, AssignmentSubmission,
    ExamAttempt, LiveQuizSession, QuizGroup, StudentAnswer # 🔥 NAYE MODELS ADD KIYE
)

User = get_user_model()

# ==========================================
# 1. 🚀 QUESTION SERIALIZER (UPDATED WITH 8 OPTIONS)
# ==========================================
class QuestionSerializer(serializers.ModelSerializer):
    options = serializers.ListField(
        child=serializers.CharField(allow_blank=True, required=False),
        write_only=True, 
        required=False
    )

    class Meta:
        model = Question
        fields = [
            'id', 'q_type', 'text', 'image', 'options', 'correct_option_index', 
            'marks', 'negative_marks', 'unattempted_marks', 'section', 'level',
            'option_a', 'option_b', 'option_c', 'option_d', 'option_e', 'option_f', 'option_g', 'option_h',
            'correct_option'
        ]


# ==========================================
# 2. 🚀 EXAM SERIALIZER (NESTED SAVE LOGIC + METADATA)
# ==========================================
class ExamSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, required=False)
    
    subject = serializers.CharField(source='subject_name', required=False, allow_blank=True)
    date = serializers.DateField(source='exam_date', required=False, allow_null=True)

    class Meta:
        model = Exam
        fields = [
            'id', 'title', 'subject', 'date', 'start_time', 'end_time', 
            'duration_minutes', 'total_marks', 'negative_marks', 'status', 'questions',
            'class_name', 'examinee_body', 'paper_set_number', 'place_of_exam', 'teacher_name',
            'unit', 'chapter_name', 'paper_id', 'exam_password', 'validity', 'permission',
            'mode_of_exam', 'tools_allowed', 'exam_type', 'paper_type'
        ]

    def create(self, validated_data):
        questions_data = validated_data.pop('questions', [])
        exam = Exam.objects.create(**validated_data)
        
        for q_data in questions_data:
            options = q_data.pop('options', [])
            Question.objects.create(
                exam=exam,
                option_a=options[0] if len(options) > 0 else q_data.get('option_a', ''),
                option_b=options[1] if len(options) > 1 else q_data.get('option_b', ''),
                option_c=options[2] if len(options) > 2 else q_data.get('option_c', ''),
                option_d=options[3] if len(options) > 3 else q_data.get('option_d', ''),
                option_e=options[4] if len(options) > 4 else q_data.get('option_e', ''),
                option_f=options[5] if len(options) > 5 else q_data.get('option_f', ''),
                option_g=options[6] if len(options) > 6 else q_data.get('option_g', ''),
                option_h=options[7] if len(options) > 7 else q_data.get('option_h', ''),
                **q_data
            )
        return exam

    def update(self, instance, validated_data):
        questions_data = validated_data.pop('questions', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if questions_data is not None:
            instance.questions.all().delete()
            for q_data in questions_data:
                options = q_data.pop('options', [])
                Question.objects.create(
                    exam=instance,
                    option_a=options[0] if len(options) > 0 else q_data.get('option_a', ''),
                    option_b=options[1] if len(options) > 1 else q_data.get('option_b', ''),
                    option_c=options[2] if len(options) > 2 else q_data.get('option_c', ''),
                    option_d=options[3] if len(options) > 3 else q_data.get('option_d', ''),
                    option_e=options[4] if len(options) > 4 else q_data.get('option_e', ''),
                    option_f=options[5] if len(options) > 5 else q_data.get('option_f', ''),
                    option_g=options[6] if len(options) > 6 else q_data.get('option_g', ''),
                    option_h=options[7] if len(options) > 7 else q_data.get('option_h', ''),
                    **q_data
                )
        return instance


# ==========================================
# 3. 🚀 QUESTION BANK SERIALIZER (WITH ALL META FIELDS)
# ==========================================
class QuestionBankSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionBank
        fields = "__all__"


# ==========================================
# 4. 🚀 FEATURE 2: 3-TEACHER EVALUATION SERIALIZERS
# ==========================================
class AIEvaluationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIEvaluationLog
        fields = ['ai_score', 'ai_feedback', 'confidence_score']

class EvaluationSerializer(serializers.ModelSerializer):
    ai_result = AIEvaluationLogSerializer(source='aievaluationlog', read_only=True)
    student_name = serializers.CharField(source='student.username', read_only=True, default="Student")
    question_text = serializers.CharField(source='question.text', read_only=True)

    class Meta:
        model = DescriptiveSubmission
        fields = [
            'id', 'student_name', 'question_text', 'answer_text', 'submitted_at',
            't1_score', 't1_remarks', 't1_status',
            't2_score', 't2_remarks', 't2_status',
            't3_score', 't3_remarks', 't3_status',
            'final_average_score', 'ai_result'
        ]


# ==========================================
# 5. 🚀 FEATURE 3: OMR RESULT (EXAM ATTEMPT) SERIALIZER
# ==========================================
class ExamAttemptSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.username', read_only=True)

    class Meta:
        model = ExamAttempt
        fields = [
            'id', 'exam', 'student_name', 'start_time', 'end_time', 
            'score', 'correct_count', 'incorrect_count', 'unattempted_count',
            'percentage', 'grade', 'is_evaluated', 'omr_sheet_image'
        ]


# ==========================================
# 6. 🚀 FEATURE 1: LIVE QUIZ (KBC STYLE) SERIALIZERS
# ==========================================
class QuizGroupSerializer(serializers.ModelSerializer):
    total_score = serializers.IntegerField(read_only=True)

    class Meta:
        model = QuizGroup
        fields = ['id', 'group_name', 'main_score', 'bonus_score', 'total_score']

class LiveQuizSessionSerializer(serializers.ModelSerializer):
    groups = QuizGroupSerializer(many=True, read_only=True)
    conducted_by_name = serializers.CharField(source='conducted_by.username', read_only=True)

    class Meta:
        model = LiveQuizSession
        fields = ['id', 'title', 'created_at', 'is_active', 'current_timer', 'conducted_by_name', 'groups']


# ==========================================
# 7. 🔥 ASSIGNMENT SERIALIZERS 🔥
# ==========================================
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

    def get_submitted_count(self, obj):
        return obj.submissions.count()
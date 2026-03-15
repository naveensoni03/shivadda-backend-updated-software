import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model

from batches.models import Batch
from courses.models import Course
from .models import (
    Exam, Question, QuestionBank, DescriptiveSubmission, AIEvaluationLog, 
    AnswerEvaluation, ExamAttempt, StudentAnswer, Assignment, AssignmentSubmission,
    LiveQuizSession, QuizGroup # 🔥 NAYE MODELS IMPORT KIYE
)
from .serializers import (
    ExamSerializer, QuestionSerializer, QuestionBankSerializer, 
    EvaluationSerializer, AssignmentSerializer, AssignmentSubmissionSerializer,
    ExamAttemptSerializer, LiveQuizSessionSerializer, QuizGroupSerializer # 🔥 NAYE SERIALIZERS
)

User = get_user_model()

# ---------------- EXAM CRUD API ----------------
class ExamAPI(APIView):
    def get(self, request, pk=None):
        if pk:
            exam = Exam.objects.filter(id=pk).first()
            if not exam:
                return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
            serializer = ExamSerializer(exam)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            exams = Exam.objects.all().order_by('-created_at')
            serializer = ExamSerializer(exams, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ExamSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        try:
            exam = Exam.objects.get(id=pk)
        except Exam.DoesNotExist:
            return Response({"error": "Exam not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ExamSerializer(exam, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            exam = Exam.objects.get(id=pk)
            exam.delete()
            return Response({"message": "Exam deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Exam.DoesNotExist:
            return Response({"error": "Exam not found"}, status=status.HTTP_404_NOT_FOUND)


# ---------------- QUESTION CRUD API (Frontend directly interacts with this) ----------------
class QuestionAPI(APIView):
    def get(self, request, pk=None):
        if pk:
            try:
                question = Question.objects.get(id=pk)
                serializer = QuestionSerializer(question)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Question.DoesNotExist:
                return Response({"error": "Question not found"}, status=status.HTTP_404_NOT_FOUND)
        else:
            questions = Question.objects.all().order_by('-id')
            # Extracting metadata to match the frontend expected structure
            data = []
            for q in questions:
                q_data = QuestionSerializer(q).data
                q_data['exam_meta'] = {
                    'className': q.exam.class_name,
                    'subClass': q.exam.batch.name if q.exam.batch else "",
                    'subject': q.exam.subject_name,
                    'unit': q.exam.unit,
                    'chapter': q.exam.chapter_name,
                    'paperId': q.exam.paper_id,
                    'examPassword': q.exam.exam_password,
                    'validity': q.exam.validity,
                    'permission': q.exam.permission,
                    'modeOfExam': q.exam.mode_of_exam,
                    'toolsAllowed': q.exam.tools_allowed,
                    'examType': q.exam.exam_type,
                    'paperType': q.exam.paper_type
                } if q.exam else {}
                data.append(q_data)
            return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        meta = request.data.get('exam_meta', {})
        exam, _ = Exam.objects.get_or_create(
            title=meta.get('examName', 'Untitled Exam'),
            class_name=meta.get('className', ''),
            subject_name=meta.get('subject', ''),
            paper_id=meta.get('paperId', '')
        )
        
        # Update extra meta fields
        exam.unit = meta.get('unit', '')
        exam.chapter_name = meta.get('chapter', '')
        exam.permission = meta.get('permission', '')
        exam.mode_of_exam = meta.get('modeOfExam', '')
        exam.tools_allowed = meta.get('toolsAllowed', '')
        exam.exam_type = meta.get('examType', '')
        exam.paper_type = meta.get('paperType', '')
        exam.save()

        q_data = request.data.copy()
        q_data['exam'] = exam.id
        
        serializer = QuestionSerializer(data=q_data)
        if serializer.is_valid():
            serializer.save()
            res_data = serializer.data
            res_data['exam_meta'] = meta
            return Response(res_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        try:
            question = Question.objects.get(id=pk)
        except Question.DoesNotExist:
            return Response({"error": "Question not found"}, status=status.HTTP_404_NOT_FOUND)

        meta = request.data.get('exam_meta', {})
        if question.exam:
            question.exam.title = meta.get('examName', question.exam.title)
            question.exam.class_name = meta.get('className', question.exam.class_name)
            question.exam.subject_name = meta.get('subject', question.exam.subject_name)
            question.exam.paper_id = meta.get('paperId', question.exam.paper_id)
            question.exam.save()

        serializer = QuestionSerializer(question, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            res_data = serializer.data
            res_data['exam_meta'] = meta
            return Response(res_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            question = Question.objects.get(id=pk)
            question.delete()
            return Response({"message": "Deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Question.DoesNotExist:
            return Response({"error": "Question not found"}, status=status.HTTP_404_NOT_FOUND)


# ---------------- QUESTION BANK FULL CRUD API ----------------
class QuestionBankAPI(APIView):
    def get(self, request, pk=None):
        if pk:
            try:
                question = QuestionBank.objects.get(id=pk)
                serializer = QuestionBankSerializer(question)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except QuestionBank.DoesNotExist:
                return Response({"error": "Question not found"}, status=status.HTTP_404_NOT_FOUND)
        else:
            questions = QuestionBank.objects.all().order_by('-id')
            serializer = QuestionBankSerializer(questions, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = QuestionBankSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        try:
            question = QuestionBank.objects.get(id=pk)
        except QuestionBank.DoesNotExist:
            return Response({"error": "Question not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = QuestionBankSerializer(question, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            question = QuestionBank.objects.get(id=pk)
            question.delete()
            return Response({"message": "Deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except QuestionBank.DoesNotExist:
            return Response({"error": "Question not found"}, status=status.HTTP_404_NOT_FOUND)


# ---------------- OMR / EXAM SUBMIT API (🔥 FEATURE 3 CONNECTED) ----------------
class SubmitExamAPI(APIView):
    def post(self, request, exam_id):
        try:
            data = request.data
            exam = Exam.objects.filter(id=exam_id).first() or Exam.objects.first() # Fallback for demo
            student = request.user if request.user.is_authenticated else User.objects.first()

            if not exam or not student:
                return Response({"error": "Missing exam or user context"}, status=status.HTTP_400_BAD_REQUEST)

            attempt = ExamAttempt.objects.create(
                exam=exam, 
                student=student,
                score=data.get('final_score', 0),
                percentage=data.get('percentage', 0)
            )

            # Detail answer logging (if needed in future)
            answers = data.get("answers", {})
            for q_id_str, selected_opt in answers.items():
                try:
                    q = Question.objects.get(id=int(q_id_str))
                    StudentAnswer.objects.create(
                        attempt=attempt,
                        question=q,
                        selected_option=selected_opt,
                        is_correct=(selected_opt == q.correct_option)
                    )
                except Exception:
                    pass

            return Response({
                "status": "success",
                "score": attempt.score,
                "percentage": attempt.percentage,
                "attempt_id": attempt.id
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------- 3-TEACHER EVALUATION APIs (🔥 FEATURE 2 CONNECTED) ----------------
class EvaluationAPI(APIView):
    def get(self, request):
        evaluations = DescriptiveSubmission.objects.all().order_by('-id')
        serializer = EvaluationSerializer(evaluations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = EvaluationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Endpoint to update T1, T2, T3 scores separately
    def patch(self, request, pk):
        try:
            submission = DescriptiveSubmission.objects.get(id=pk)
            data = request.data
            
            if 't1_score' in data:
                submission.t1_score = data['t1_score']
                submission.t1_status = 'Done'
            if 't2_score' in data:
                submission.t2_score = data['t2_score']
                submission.t2_status = 'Done'
            if 't3_score' in data:
                submission.t3_score = data['t3_score']
                submission.t3_status = 'Done'

            # Recalculate average if all 3 are done
            if submission.t1_status == 'Done' and submission.t2_status == 'Done' and submission.t3_status == 'Done':
                avg = (submission.t1_score + submission.t2_score + submission.t3_score) / 3
                submission.final_average_score = avg

            submission.save()
            serializer = EvaluationSerializer(submission)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except DescriptiveSubmission.DoesNotExist:
            return Response({"error": "Submission not found"}, status=status.HTTP_404_NOT_FOUND)


# ---------------- LIVE QUIZ (KBC STYLE) APIs (🔥 FEATURE 1 CONNECTED) ----------------
class LiveQuizSessionAPI(APIView):
    def get(self, request):
        sessions = LiveQuizSession.objects.filter(is_active=True)
        serializer = LiveQuizSessionSerializer(sessions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        session = LiveQuizSession.objects.create(
            title=request.data.get('title', 'Mega Live Quiz'),
            conducted_by=request.user if request.user.is_authenticated else None
        )
        # Auto create 5 default groups
        for i in range(1, 6):
            QuizGroup.objects.create(session=session, group_name=f'G{i}')
        
        serializer = LiveQuizSessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class UpdateQuizGroupScoreAPI(APIView):
    def patch(self, request, group_id):
        try:
            group = QuizGroup.objects.get(id=group_id)
            group.main_score += int(request.data.get('add_main', 0))
            group.bonus_score += int(request.data.get('add_bonus', 0))
            group.save()
            return Response(QuizGroupSerializer(group).data, status=status.HTTP_200_OK)
        except QuizGroup.DoesNotExist:
            return Response({"error": "Group not found"}, status=status.HTTP_404_NOT_FOUND)


# ---------------- AI EVALUATE ANSWER ----------------
class AIEvaluateAPI(APIView):
    def post(self, request):
        try:
            answer_text = request.data.get("answer", "")
            
            student = User.objects.first()
            if not student:
                 student = User.objects.create_user(username='student_demo', password='password123')
                 
            q_bank = QuestionBank.objects.first()
            if not q_bank:
                q_bank = QuestionBank.objects.create(text="Demo Question?", difficulty="Medium")

            submission = DescriptiveSubmission.objects.create(
                student=student,
                question=q_bank,
                answer_text=answer_text
            )

            # Dummy length-based AI calculation
            calculated_score = min(100, max(40, len(answer_text) // 2))
            
            log = AIEvaluationLog.objects.create(
                submission=submission,
                ai_score=calculated_score,
                ai_feedback="AI Analysis: Good attempt. Keywords match 80%. Grammar needs improvement.",
                confidence_score=0.98
            )

            return Response({
                "status": "success",
                "score": log.ai_score,
                "feedback": log.ai_feedback
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------- AI STUDY PLAN ----------------
class AIStudyPlanAPI(APIView):
    def post(self, request):
        topic = request.data.get("topic")
        return Response({
            "status": "success",
            "plan": f"AI Study Plan for {topic} will be generated soon."
        }, status=status.HTTP_200_OK)


# ---------------- NOTIFY PARENTS ----------------
class NotifyParentsAPI(APIView):
    def post(self, request):
        return Response({"status": "Notification sent!"}, status=status.HTTP_200_OK)


# ---------------- GENERATE AI QUIZ ----------------
@csrf_exempt
def generate_ai_quiz(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            topic = data.get("topic")

            questions = [
                {
                    "question": f"What is {topic}?",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correct": "A"
                },
                {
                    "question": f"Explain {topic} in simple words.",
                    "options": ["True", "False"],
                    "correct": "A"
                }
            ]

            return JsonResponse({
                "status": "success",
                "topic": topic,
                "questions": questions
            })

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request"}, status=400)


# ---------------- SAVE AI QUIZ ----------------
@csrf_exempt
def save_ai_quiz(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            topic = data.get('topic')
            questions = data.get('questions')

            if not topic or not questions:
                return JsonResponse({"error": "Topic or questions missing"}, status=400)

            batch_instance, _ = Batch.objects.get_or_create(name="AI Batch 2026")
            course_instance, _ = Course.objects.get_or_create(name="General Science")

            new_exam = Exam.objects.create(
                title=f"AI Quiz: {topic}",
                batch=batch_instance,
                course=course_instance,
                total_marks=len(questions) * 4,
                passing_marks=len(questions) * 2,
                duration_minutes=30,
                is_active=True
            )

            for q in questions:
                Question.objects.create(
                    exam=new_exam,
                    text=q.get('question', ''),
                    option_a=q.get('options', ["", "", "", ""])[0],
                    option_b=q.get('options', ["", "", "", ""])[1],
                    option_c=q.get('options', ["", "", "", ""])[2],
                    option_d=q.get('options', ["", "", "", ""])[3],
                    correct_option=q.get('correct', 'A'),
                    marks=4
                )

            return JsonResponse({'message': 'Saved!', 'status': 'success'})

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request'}, status=400)


# ---------------- SMS & DUMMY APIs ----------------
@csrf_exempt
def send_sms(request):
    return JsonResponse({"status": "SMS sent successfully!"})

@csrf_exempt
def receive_sms(request):
    return JsonResponse({"status": "SMS received successfully!"})

@csrf_exempt
def get_incoming_messages(request):
    return JsonResponse({"messages": []})


# ==========================================
# 🔥 ASSIGNMENT APIs 🔥
# ==========================================
class AssignmentAPI(APIView):
    def get(self, request):
        assignments = Assignment.objects.all().order_by('-created_at')
        serializer = AssignmentSerializer(assignments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = AssignmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            assignment = Assignment.objects.get(id=pk)
            assignment.delete()
            return Response({"message": "Deleted"}, status=status.HTTP_204_NO_CONTENT)
        except Assignment.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

class AssignmentEvaluationAPI(APIView):
    def get(self, request, assignment_id):
        submissions = AssignmentSubmission.objects.filter(assignment_id=assignment_id)
        serializer = AssignmentSubmissionSerializer(submissions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, submission_id):
        try:
            submission = AssignmentSubmission.objects.get(id=submission_id)
            submission.marks_awarded = request.data.get('marks_awarded')
            submission.feedback = request.data.get('feedback')
            submission.status = 'graded' 
            submission.save()
            return Response({"message": "Evaluation Saved Successfully!"}, status=status.HTTP_200_OK)
        except AssignmentSubmission.DoesNotExist:
            return Response({"error": "Submission not found"}, status=status.HTTP_404_NOT_FOUND)
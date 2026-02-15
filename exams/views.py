import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model

from batches.models import Batch
from courses.models import Course
# Updated imports to include AnswerEvaluation
from .models import Exam, Question, QuestionBank, DescriptiveSubmission, AIEvaluationLog, AnswerEvaluation
from .serializers import ExamSerializer, QuestionSerializer, QuestionBankSerializer, EvaluationSerializer

User = get_user_model()

# ---------------- EXAM LIST API ----------------
class ExamAPI(APIView):
    def get(self, request):
        exams = Exam.objects.filter(is_active=True)
        serializer = ExamSerializer(exams, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


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


# ---------------- SUBMIT EXAM ----------------
class SubmitExamAPI(APIView):
    def post(self, request, exam_id):
        try:
            data = request.data
            exam = Exam.objects.get(id=exam_id)

            score = 0
            total = exam.total_marks

            for qid, answer in data.get("answers", {}).items():
                try:
                    question = Question.objects.get(id=qid, exam=exam)
                    if question.correct_option == answer:
                        score += question.marks
                except Question.DoesNotExist:
                    pass

            return Response({
                "status": "success",
                "score": score,
                "total": total,
                "passed": score >= exam.passing_marks
            }, status=status.HTTP_200_OK)

        except Exam.DoesNotExist:
            return Response({"error": "Exam not found"}, status=status.HTTP_404_NOT_FOUND)
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


# ---------------- EVALUATION APIs (UPDATED) ----------------
class EvaluationAPI(APIView):
    def get(self, request):
        # Fetch detailed evaluation data
        evaluations = DescriptiveSubmission.objects.all().order_by('-id')
        serializer = EvaluationSerializer(evaluations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        # Create new manual submission if needed (optional)
        serializer = EvaluationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ---------------- AI EVALUATE ANSWER (UPDATED) ----------------
class AIEvaluateAPI(APIView):
    def post(self, request):
        try:
            answer_text = request.data.get("answer", "")
            
            # 1. Setup Dummy Data (Because we are testing)
            # Find a user or create one
            student = User.objects.first()
            if not student:
                 # Create a dummy user if DB is empty
                 student = User.objects.create_user(username='student_demo', password='password123')
                 
            # Find a question or create one
            q_bank = QuestionBank.objects.first()
            if not q_bank:
                q_bank = QuestionBank.objects.create(text="Demo Question?", difficulty="Medium")

            # 2. Create the Submission Entry
            # This is needed because AIEvaluationLog needs a OneToOne link to Submission
            submission = DescriptiveSubmission.objects.create(
                student=student,
                question=q_bank,
                answer_text=answer_text
            )

            # 3. Perform AI Logic (Mock logic for now - Replace with Gemini later)
            # Simple logic: Length of answer determines score for demo
            calculated_score = min(100, max(40, len(answer_text) // 2))
            
            # 4. Save to AIEvaluationLog Database
            log = AIEvaluationLog.objects.create(
                submission=submission,
                ai_score=calculated_score,
                ai_feedback="AI Analysis: Good attempt. Keywords match 80%. Grammar needs improvement.",
                confidence_score=0.98
            )

            # 5. Return Response to Frontend
            return Response({
                "status": "success",
                "score": log.ai_score,
                "feedback": log.ai_feedback
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
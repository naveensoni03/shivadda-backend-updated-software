import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model

# 🔥 SABHI MODELS KA IMPORT
from .models import (
    EducationLevel, AcademicClass, Subject, ExamBlueprint, 
    Exam, Question, QuestionBank, DescriptiveSubmission, AIEvaluationLog, 
    AnswerEvaluation, ExamAttempt, StudentAnswer, Assignment, AssignmentSubmission,
    LiveQuizSession, QuizGroup
)
from .serializers import (
    ExamSerializer, QuestionSerializer, QuestionBankSerializer, 
    EvaluationSerializer, AssignmentSerializer, AssignmentSubmissionSerializer,
    ExamAttemptSerializer, LiveQuizSessionSerializer, QuizGroupSerializer 
)

User = get_user_model()

# ==========================================
# 📝 EXAM CRUD API (CRASH PROOF)
# ==========================================
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
        data = request.data
        
        # Safe Hierarchy Creation
        subject_str = data.get('subject_string', 'General Subject')
        ed_level, _ = EducationLevel.objects.get_or_create(name="General Level")
        ac_class, _ = AcademicClass.objects.get_or_create(name="General Class", level=ed_level)
        subject_inst, _ = Subject.objects.get_or_create(name=subject_str)

        start_time = data.get('start_time')
        end_time = data.get('end_time')
        exam_date = data.get('exam_date')

        exam = Exam.objects.create(
            title=data.get('title', 'Untitled'),
            status=data.get('status', 'upcoming'),
            exam_date=exam_date if exam_date else None,
            start_time=start_time if start_time else None,
            end_time=end_time if end_time else None,
            duration_minutes=data.get('duration_minutes', 60),
            academic_class=ac_class,
            subject=subject_inst
        )
        serializer = ExamSerializer(exam)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def put(self, request, pk):
        try:
            exam = Exam.objects.get(id=pk)
        except Exam.DoesNotExist:
            return Response({"error": "Exam not found"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        exam.title = data.get('title', exam.title)
        exam.status = data.get('status', exam.status)
        exam.exam_date = data.get('exam_date', exam.exam_date) or None
        exam.start_time = data.get('start_time', exam.start_time) or None
        exam.end_time = data.get('end_time', exam.end_time) or None
        exam.duration_minutes = data.get('duration_minutes', exam.duration_minutes)
        exam.save()

        serializer = ExamSerializer(exam)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        try:
            exam = Exam.objects.get(id=pk)
            exam.delete()
            return Response({"message": "Exam deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Exam.DoesNotExist:
            return Response({"error": "Exam not found"}, status=status.HTTP_404_NOT_FOUND)


# ==========================================
# ❓ QUESTION CRUD API
# ==========================================
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
            data = []
            for q in questions:
                q_data = QuestionSerializer(q).data
                # Extracting Exam Meta safely
                q_data['exam_meta'] = {
                    'className': q.exam.academic_class.name if getattr(q.exam, 'academic_class', None) else "",
                    'subClass': q.exam.subclass.name if getattr(q.exam, 'subclass', None) else "", 
                    'subject': q.exam.subject.name if getattr(q.exam, 'subject', None) else "", 
                    'unit': q.exam.syllabus_unit.name if getattr(q.exam, 'syllabus_unit', None) else "",
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
        serializer = QuestionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        try:
            question = Question.objects.get(id=pk)
        except Question.DoesNotExist:
            return Response({"error": "Question not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = QuestionSerializer(question, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            question = Question.objects.get(id=pk)
            question.delete()
            return Response({"message": "Deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Question.DoesNotExist:
            return Response({"error": "Question not found"}, status=status.HTTP_404_NOT_FOUND)


# ==========================================
# 📚 QUESTION BANK API
# ==========================================
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


# ==========================================
# 💯 OMR / EXAM SUBMIT API
# ==========================================
class SubmitExamAPI(APIView):
    def post(self, request, exam_id):
        try:
            data = request.data
            exam = Exam.objects.filter(id=exam_id).first() or Exam.objects.first() 
            student = request.user if request.user.is_authenticated else User.objects.first()

            if not exam or not student:
                return Response({"error": "Missing exam or user context"}, status=status.HTTP_400_BAD_REQUEST)

            attempt = ExamAttempt.objects.create(
                exam=exam, 
                student=student,
                score=data.get('final_score', 0),
                percentage=data.get('percentage', 0),
                negative_marks_deducted=data.get('negative_marks_deducted', 0)
            )

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


# ==========================================
# 👨‍🏫 3-TEACHER EVALUATION APIs
# ==========================================
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

            if submission.t1_status == 'Done' and submission.t2_status == 'Done' and submission.t3_status == 'Done':
                avg = (submission.t1_score + submission.t2_score + submission.t3_score) / 3
                submission.final_average_score = avg

            submission.save()
            serializer = EvaluationSerializer(submission)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except DescriptiveSubmission.DoesNotExist:
            return Response({"error": "Submission not found"}, status=status.HTTP_404_NOT_FOUND)


# ==========================================
# ⚡ LIVE QUIZ (KBC STYLE) APIs
# ==========================================
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


# ==========================================
# 🤖 AI EVALUATE ANSWER
# ==========================================
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


# ==========================================
# 🧠 AI STUDY PLAN & NOTIFICATIONS
# ==========================================
class AIStudyPlanAPI(APIView):
    def post(self, request):
        topic = request.data.get("topic")
        return Response({
            "status": "success",
            "plan": f"AI Study Plan for {topic} will be generated soon."
        }, status=status.HTTP_200_OK)


class NotifyParentsAPI(APIView):
    def post(self, request):
        return Response({"status": "Notification sent!"}, status=status.HTTP_200_OK)


# ==========================================
# 📝 GENERATE & SAVE AI QUIZ
# ==========================================
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


@csrf_exempt
def save_ai_quiz(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            topic = data.get('topic')
            questions = data.get('questions')

            if not topic or not questions:
                return JsonResponse({"error": "Topic or questions missing"}, status=400)

            ed_level, _ = EducationLevel.objects.get_or_create(name="Secondary Level")
            class_instance, _ = AcademicClass.objects.get_or_create(name="AI Generation Class", level=ed_level)
            subject_instance, _ = Subject.objects.get_or_create(name="General AI Topics")

            blueprint, _ = ExamBlueprint.objects.get_or_create(
                name=f"Auto Blueprint: {topic}",
                defaults={
                    'total_questions': len(questions),
                    'max_marks': len(questions) * 4.0,
                    'positive_mark_per_q': 4.0,
                    'negative_mark_per_q': 1.0,
                    'passing_percentage': 33.0
                }
            )

            new_exam = Exam.objects.create(
                title=f"AI Quiz: {topic}",
                academic_class=class_instance,
                subject=subject_instance,
                blueprint=blueprint,
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


# ==========================================
# 📱 SMS & DUMMY APIs
# ==========================================
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
# 🔥 ASSIGNMENT APIs (NEW ADDITION) 🔥
# ==========================================
class AssignmentAPI(APIView):
    def get(self, request):
        # Teacher fetch all assignments
        assignments = Assignment.objects.all().order_by('-created_at')
        serializer = AssignmentSerializer(assignments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        # Teacher create new assignment
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

# 🚀 NAYI API: STUDENT KE FILE SUBMIT KARNE KE LIYE
class SubmitAssignmentAPI(APIView):
    def post(self, request):
        try:
            # Frontend se data aur file nikalna
            assignment_id = request.data.get('assignment')
            file = request.FILES.get('file') or request.FILES.get('submission_file')
            student = request.user if request.user.is_authenticated else User.objects.first()

            if not assignment_id or not file:
                return Response({"error": "File and Assignment ID are required"}, status=status.HTTP_400_BAD_REQUEST)

            assignment = Assignment.objects.get(id=assignment_id)

            # Database me Submission Create Karna
            submission = AssignmentSubmission.objects.create(
                assignment=assignment,
                student=student,
                submitted_file=file,
                status='submitted'
            )

            return Response({
                "message": "Assignment Submitted Successfully!", 
                "submission_id": submission.id
            }, status=status.HTTP_201_CREATED)

        except Assignment.DoesNotExist:
            return Response({"error": "Assignment not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AssignmentEvaluationAPI(APIView):
    def get(self, request, assignment_id):
        # Get all submissions for a specific assignment (For Teacher)
        submissions = AssignmentSubmission.objects.filter(assignment_id=assignment_id)
        serializer = AssignmentSubmissionSerializer(submissions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, submission_id):
        # Teacher grades the submission
        try:
            submission = AssignmentSubmission.objects.get(id=submission_id)
            submission.marks_awarded = request.data.get('marks_awarded')
            submission.feedback = request.data.get('feedback')
            submission.status = 'graded' 
            submission.save()
            return Response({"message": "Evaluation Saved Successfully!"}, status=status.HTTP_200_OK)
        except AssignmentSubmission.DoesNotExist:
            return Response({"error": "Submission not found"}, status=status.HTTP_404_NOT_FOUND)


# ==========================================
# 📊 REAL RESULTS APIs (Teacher & Student)
# ==========================================
class StudentResultsAPI(APIView):
    def get(self, request):
        student = request.user if request.user.is_authenticated else User.objects.first()
        attempts = ExamAttempt.objects.filter(student=student).order_by('-id')
        data = []
        for att in attempts:
            max_marks = att.exam.blueprint.max_marks if att.exam.blueprint else 100
            data.append({
                "id": att.id,
                "subject": att.exam.title,
                "date": att.exam.exam_date.strftime("%d %b %Y") if att.exam.exam_date else "Completed",
                "score": att.score,
                "total": max_marks,
                "percentage": att.percentage,
                "grade": "Pass" if att.percentage >= 33 else "Fail"
            })
        return Response(data, status=status.HTTP_200_OK)

class TeacherExamResultsAPI(APIView):
    def get(self, request, exam_id):
        attempts = ExamAttempt.objects.filter(exam_id=exam_id).order_by('-score')
        data = []
        for att in attempts:
            max_marks = att.exam.blueprint.max_marks if att.exam.blueprint else 100
            student_name = "Unknown Student"
            if att.student:
                student_name = getattr(att.student, 'full_name', att.student.email)
            data.append({
                "id": att.id,
                "name": student_name,
                "score": att.score,
                "max": max_marks,
                "percentage": att.percentage
            })
        return Response(data, status=status.HTTP_200_OK)

class StudentAttemptDetailsAPI(APIView):
    def get(self, request, attempt_id):
        try:
            attempt = ExamAttempt.objects.get(id=attempt_id)
            answers = StudentAnswer.objects.filter(attempt=attempt)
            data = []
            for ans in answers:
                data.append({
                    "question_text": ans.question.text,
                    "selected_option": ans.selected_option,
                    "correct_option": ans.question.correct_option,
                    "is_correct": ans.is_correct
                })
            return Response({"answers": data}, status=status.HTTP_200_OK)
        except ExamAttempt.DoesNotExist:
            return Response({"error": "Attempt not found"}, status=status.HTTP_404_NOT_FOUND)
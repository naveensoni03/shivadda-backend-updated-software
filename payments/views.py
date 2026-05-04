import razorpay
import requests
from requests.auth import HTTPBasicAuth
from datetime import timedelta

from django.conf import settings
from django.db import models
from django.utils.timezone import now

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    ServiceCatalog, StudentServicePayment,
    ServiceAccess, TeacherBankDetails, TeacherSalaryPayment
)
from .serializers import (
    ServiceCatalogSerializer, ServiceCatalogPublicSerializer,
    StudentServicePaymentSerializer, AdminPaymentListSerializer,
    ServiceAccessSerializer,
    TeacherBankDetailsSerializer, TeacherBankDetailsMaskedSerializer,
    TeacherSalaryPaymentSerializer, CreateSalaryPaymentSerializer,
)


def get_razorpay_client():
    return razorpay.Client(auth=(
        settings.RAZORPAY_KEY_ID,
        settings.RAZORPAY_KEY_SECRET,
    ))


# ============================================================
# HELPER: Check if user is admin/staff
# ============================================================
def is_admin(user):
    return user.is_staff or user.is_superuser or getattr(user, 'role', '') in [
        'Admin', 'Super Admin', 'Staff'
    ]


# ============================================================
# 1. SERVICE CATALOG VIEWSET
# ============================================================
class ServiceCatalogViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if is_admin(self.request.user):
            return ServiceCatalog.objects.all()
        return ServiceCatalog.objects.filter(is_active=True)

    def get_serializer_class(self):
        if is_admin(self.request.user):
            return ServiceCatalogSerializer
        return ServiceCatalogPublicSerializer

    def get_serializer_context(self):
        return {'request': self.request}

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'], url_path='toggle')
    def toggle_active(self, request, pk=None):
        service = self.get_object()
        service.is_active = not service.is_active
        service.save()
        return Response({'is_active': service.is_active, 'message': f"Service {'activated' if service.is_active else 'deactivated'}."})


# ============================================================
# 2. CREATE RAZORPAY ORDER FOR A SERVICE (STRICT REAL INTEGRATION)
# ============================================================
class CreateServiceOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        service_id = request.data.get('service_id')
        if not service_id:
            return Response({'error': 'service_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            service = ServiceCatalog.objects.get(id=service_id, is_active=True)
        except ServiceCatalog.DoesNotExist:
            return Response({'error': 'Service not found or inactive.'}, status=status.HTTP_404_NOT_FOUND)

        if not service.is_chargeable:
            return Response({'error': 'This service is free. No payment needed.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if student already has access
        already = ServiceAccess.objects.filter(
            user=request.user, service=service, is_active=True
        ).first()
        if already and already.is_valid():
            return Response({'error': 'You already have access to this service.'}, status=status.HTTP_400_BAD_REQUEST)

        total = int(service.get_total_price() * 100)  # paise

        # REAL Razorpay Order Creation
        try:
            client = get_razorpay_client()
            order = client.order.create({
                'amount': total,
                'currency': 'INR',
                'payment_capture': 1,
                'notes': {
                    'service_id': str(service.id),
                    'service_name': service.name,
                    'user_id': str(request.user.id),
                }
            })
        except Exception as e:
            return Response({'error': f"Payment Gateway Error: {str(e)}"}, status=status.HTTP_502_BAD_GATEWAY)

        # Create a pending payment record
        payment = StudentServicePayment.objects.create(
            user=request.user,
            service=service,
            service_name_snapshot=service.name,
            service_price_snapshot=service.price,
            service_type_snapshot=service.service_type,
            razorpay_order_id=order['id'],
            base_amount=service.price,
            gst_amount=service.get_gst_amount(),
            total_amount=service.get_total_price(),
            status='pending',
        )

        return Response({
            'order_id': order['id'],
            'amount': total,
            'currency': 'INR',
            'key': settings.RAZORPAY_KEY_ID,
            'payment_record_id': str(payment.id),
            'service': {
                'id': service.id,
                'name': service.name,
                'description': service.description,
                'base_amount': str(service.price),
                'gst_amount': str(service.get_gst_amount()),
                'total_amount': str(service.get_total_price()),
            }
        })


# ============================================================
# 3. VERIFY PAYMENT + GRANT ACCESS (STRICT VERIFICATION)
# ============================================================
class VerifyServicePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')
        payment_method = request.data.get('payment_method', '')

        if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
            return Response({'error': 'Missing payment verification fields.'}, status=status.HTTP_400_BAD_REQUEST)

        # Real Signature Verification
        try:
            client = get_razorpay_client()
            client.utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature,
            })
        except razorpay.errors.SignatureVerificationError:
            return Response({'error': 'Payment verification failed. Invalid Signature.'}, status=status.HTTP_400_BAD_REQUEST)

        # Find the pending payment record
        try:
            payment = StudentServicePayment.objects.get(
                razorpay_order_id=razorpay_order_id,
                user=request.user,
                status='pending'
            )
        except StudentServicePayment.DoesNotExist:
            return Response({'error': 'Payment record not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Update payment record
        payment.razorpay_payment_id = razorpay_payment_id
        payment.razorpay_signature = razorpay_signature
        payment.status = 'paid'
        payment.payment_method = payment_method
        payment.paid_at = now()
        payment.save()

        # Link student if profile exists
        try:
            from students.models import Student
            student = Student.objects.get(user=request.user)
            payment.student = student
            payment.save(update_fields=['student'])
        except Exception:
            pass

        # Grant service access
        if payment.service:
            expires_at = None
            if payment.service.validity_days:
                expires_at = now() + timedelta(days=payment.service.validity_days)

            access, _ = ServiceAccess.objects.update_or_create(
                user=request.user,
                service=payment.service,
                defaults={
                    'payment': payment,
                    'granted_at': now(),
                    'expires_at': expires_at,
                    'is_active': True,
                }
            )

        return Response({
            'success': True,
            'invoice_number': payment.invoice_number,
            'message': f'Payment successful! You now have access to {payment.service_name_snapshot}.',
            'payment': StudentServicePaymentSerializer(payment).data,
        })


# ============================================================
# 4. STUDENT — MY PAYMENTS & ACCESS
# ============================================================
class MyPaymentHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        payments = StudentServicePayment.objects.filter(
            user=request.user
        ).order_by('-created_at')
        serializer = StudentServicePaymentSerializer(payments, many=True)
        return Response(serializer.data)


class MyServiceAccessView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        access = ServiceAccess.objects.filter(
            user=request.user, is_active=True
        ).select_related('service')
        serializer = ServiceAccessSerializer(access, many=True)
        return Response(serializer.data)


# ============================================================
# 5. ADMIN — ALL STUDENT PAYMENTS (AG GRID)
# ============================================================
class AdminStudentPaymentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        payments = StudentServicePayment.objects.select_related(
            'user', 'student', 'service'
        ).order_by('-created_at')

        # Filters
        status_filter = request.query_params.get('status')
        service_type = request.query_params.get('service_type')
        from_date = request.query_params.get('from_date')
        to_date = request.query_params.get('to_date')
        search = request.query_params.get('search')

        if status_filter:
            payments = payments.filter(status=status_filter)
        if service_type:
            payments = payments.filter(service_type_snapshot=service_type)
        if from_date:
            payments = payments.filter(created_at__date__gte=from_date)
        if to_date:
            payments = payments.filter(created_at__date__lte=to_date)
        if search:
            from django.db.models import Q
            payments = payments.filter(
                Q(user__full_name__icontains=search) |
                Q(user__email__icontains=search) |
                Q(invoice_number__icontains=search) |
                Q(service_name_snapshot__icontains=search)
            )

        serializer = AdminPaymentListSerializer(payments, many=True)

        # Summary stats
        total_revenue = sum(p.total_amount for p in payments if p.status == 'paid')
        total_paid = payments.filter(status='paid').count()
        total_pending = payments.filter(status='pending').count()

        return Response({
            'payments': serializer.data,
            'summary': {
                'total_revenue': total_revenue,
                'total_paid': total_paid,
                'total_pending': total_pending,
                'total_records': payments.count(),
            }
        })


# ============================================================
# 6. TEACHER BANK DETAILS
# ============================================================
class TeacherBankDetailsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        teacher = self._get_teacher(request)
        if not teacher:
            return Response({'error': 'Teacher profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        try:
            bank = teacher.bank_details
            serializer = TeacherBankDetailsMaskedSerializer(bank)
            return Response(serializer.data)
        except TeacherBankDetails.DoesNotExist:
            return Response({}, status=status.HTTP_200_OK)

    def post(self, request):
        teacher = self._get_teacher(request)
        if not teacher:
            return Response({'error': 'Teacher profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        try:
            bank = teacher.bank_details
            serializer = TeacherBankDetailsSerializer(bank, data=request.data, partial=True)
        except TeacherBankDetails.DoesNotExist:
            data = request.data.copy()
            data['teacher'] = teacher.id
            serializer = TeacherBankDetailsSerializer(data=data)

        if serializer.is_valid():
            serializer.save(teacher=teacher)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def _get_teacher(self, request):
        from teachers.models import Teacher
        try:
            return Teacher.objects.get(user=request.user)
        except Exception:
            return None


class AdminTeacherBankDetailsView(APIView):
    """Admin sees full unmasked bank details"""
    permission_classes = [IsAuthenticated]

    def get(self, request, teacher_id):
        if not is_admin(request.user):
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        from teachers.models import Teacher
        try:
            teacher = Teacher.objects.get(id=teacher_id)
            bank = teacher.bank_details
            serializer = TeacherBankDetailsSerializer(bank)
            return Response(serializer.data)
        except Exception:
            return Response({'error': 'Bank details not found.'}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, teacher_id):
        """Admin can verify bank details"""
        if not is_admin(request.user):
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        from teachers.models import Teacher
        try:
            teacher = Teacher.objects.get(id=teacher_id)
            bank = teacher.bank_details
            bank.is_verified = not bank.is_verified
            bank.save()
            return Response({'is_verified': bank.is_verified})
        except Exception:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)


# ============================================================
# 7. TEACHER SALARY PAYMENTS (REAL RAZORPAYX INTEGRATION)
# ============================================================
class TeacherSalaryViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if is_admin(self.request.user):
            teacher_id = self.request.query_params.get('teacher_id')
            qs = TeacherSalaryPayment.objects.select_related('teacher', 'paid_by')
            if teacher_id:
                qs = qs.filter(teacher_id=teacher_id)
            return qs
        
        from teachers.models import Teacher
        try:
            teacher = Teacher.objects.get(user=self.request.user)
            return TeacherSalaryPayment.objects.filter(teacher=teacher)
        except Exception:
            return TeacherSalaryPayment.objects.none()

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateSalaryPaymentSerializer
        return TeacherSalaryPaymentSerializer

    def create(self, request, *args, **kwargs):
        # 🔥 1. SMART FIX: Frontend Data ko Serializer ke hisaab se adjust karna
        data = request.data.copy()

        if 'teacher_id' in data and 'teacher' not in data:
            data['teacher'] = data['teacher_id']
        
        if 'basic_salary' in data and 'salary_amount' not in data:
            data['salary_amount'] = data['basic_salary']
        elif 'amount' in data and 'salary_amount' not in data:
            data['salary_amount'] = data['amount']

        serializer = CreateSalaryPaymentSerializer(data=data)
        
        if serializer.is_valid():
            teacher = serializer.validated_data['teacher']
            payment_mode = serializer.validated_data['payment_mode']
            month = serializer.validated_data['month']

            # Calculate Net Amount
            base = serializer.validated_data.get('salary_amount', 0)
            bonus = serializer.validated_data.get('bonus', 0)
            ded = serializer.validated_data.get('deductions', 0)
            net_amount = float(base + bonus - ded)

            # Real Bank Transfer Logic using RazorpayX
            if payment_mode == 'bank_transfer':
                try:
                    # 🔥 2. SMART FIX: Bank details missing hone par 500 error na aaye
                    bank = getattr(teacher, 'bank_details', None)
                    if not bank or not getattr(bank, 'account_number', None) or not getattr(bank, 'ifsc_code', None):
                        return Response({'detail': f"{teacher.full_name} ki Bank Details incomplete hain! Pehle update karein."}, status=status.HTTP_400_BAD_REQUEST)

                    razorpayx_acc_no = getattr(settings, 'RAZORPAYX_ACCOUNT_NUMBER', '')
                    
                    if not razorpayx_acc_no:
                        return Response({'detail': "Server Error: RazorpayX Account Number is missing in backend settings."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                    # RazorpayX Payout API Payload
                    payout_data = {
                        "account_number": razorpayx_acc_no,
                        "fund_account": {
                            "account_type": "bank_account",
                            "bank_account": {
                                "name": bank.account_holder_name,
                                "ifsc": bank.ifsc_code,
                                "account_number": bank.account_number
                            },
                            "contact": {
                                "name": teacher.full_name,
                                "email": teacher.user.email if hasattr(teacher, 'user') and teacher.user else "teacher@school.com",
                                "type": "employee",
                                "reference_id": f"EMP_{teacher.id}"
                            }
                        },
                        "amount": int(net_amount * 100), 
                        "currency": "INR",
                        "mode": "IMPS",
                        "purpose": "salary",
                        "queue_if_low_balance": True,
                        "reference_id": f"SALARY_{teacher.id}_{month.replace('-', '')}",
                        "narration": f"Salary {month}"
                    }

                    # Real Trigger API Call to RazorpayX
                    response = requests.post(
                        'https://api.razorpay.com/v1/payouts',
                        json=payout_data,
                        auth=HTTPBasicAuth(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
                    )

                    razorpay_response = response.json()

                    if response.status_code not in [200, 201]:
                        error_msg = razorpay_response.get('error', {}).get('description', 'Bank Transaction failed')
                        return Response({'detail': f"RazorpayX Error: {error_msg}"}, status=status.HTTP_400_BAD_REQUEST)

                    # Success! Save the actual Razorpay Payout ID
                    serializer.validated_data['transaction_reference'] = razorpay_response.get('id')

                except Exception as e:
                    return Response({'detail': f"Transaction Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Save Record in Database
            payment = serializer.save(paid_by=request.user, status='paid', paid_at=now())
            
            if not payment.net_amount:
                payment.net_amount = net_amount
                payment.save(update_fields=['net_amount'])

            return Response(TeacherSalaryPaymentSerializer(payment).data, status=status.HTTP_201_CREATED)

        # 🔥 3. SMART FIX: Agar ab bhi 400 aata hai, toh VS Code terminal me print karega ki kya chhoota hai
        print("\n❌ FRONTEND NE YE BHEJA HAI:", dict(data))
        print("❌ SERIALIZER MEIN YE DIKKAT HAI:", serializer.errors, "\n")
        
        return Response({
            "detail": "Data verification failed.", 
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        if not is_admin(request.user):
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not is_admin(request.user):
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get'], url_path='summary')
    def salary_summary(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        from django.db.models import Sum, Count

        data = TeacherSalaryPayment.objects.values(
            'teacher__full_name', 'teacher__employee_id', 'teacher__salary'
        ).annotate(
            total_paid=Sum('net_amount'),
            payment_count=Count('id')
        ).order_by('teacher__full_name')

        return Response(list(data))


# ============================================================
# 8. PAYMENT INVOICE DATA 
# ============================================================
class StudentInvoiceDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, invoice_number):
        try:
            payment = StudentServicePayment.objects.get(invoice_number=invoice_number)
        except StudentServicePayment.DoesNotExist:
            return Response({'error': 'Invoice not found.'}, status=status.HTTP_404_NOT_FOUND)

        if payment.user != request.user and not is_admin(request.user):
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        return Response(StudentServicePaymentSerializer(payment).data)


class TeacherInvoiceDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, invoice_number):
        try:
            payment = TeacherSalaryPayment.objects.get(invoice_number=invoice_number)
        except TeacherSalaryPayment.DoesNotExist:
            return Response({'error': 'Invoice not found.'}, status=status.HTTP_404_NOT_FOUND)

        from teachers.models import Teacher
        try:
            teacher = Teacher.objects.get(user=request.user)
            if payment.teacher != teacher and not is_admin(request.user):
                return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        except Exception:
            if not is_admin(request.user):
                return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        return Response(TeacherSalaryPaymentSerializer(payment).data)


# ============================================================
# 9. STUDENT ACCESS PERMISSIONS
# ============================================================
class StudentAccessPermissionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        def check_perm(s_type):
            return ServiceAccess.objects.filter(
                user=user,
                service__service_type=s_type,
                is_active=True
            ).filter(
                models.Q(expires_at__isnull=True) | models.Q(expires_at__gt=now())
            ).exists()

        return Response({
            'course_access': check_perm('course_access'),
            'assignment_exam_access': check_perm('assignment_exam_access'),
        })


# ============================================================
# 10. SEED DEFAULT SERVICES
# ============================================================
class SeedDefaultServicesView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Admin only.'}, status=status.HTTP_403_FORBIDDEN)

        created = []
        defaults = [
            {
                'name': 'Course Access',
                'service_type': 'course_access',
                'description': 'Unlock all courses and learning material.',
                'price': 2999,
                'icon': 'BookOpen',
                'validity_days': 365,
            },
            {
                'name': 'Assignment & Exam Access',
                'service_type': 'assignment_exam_access',
                'description': 'Unlock Assignments, Exams, and Results sections.',
                'price': 1999,
                'icon': 'ClipboardList',
                'validity_days': 365,
            },
        ]

        for d in defaults:
            obj, was_created = ServiceCatalog.objects.get_or_create(
                service_type=d['service_type'],
                defaults={**d, 'created_by': request.user, 'is_active': True}
            )
            if was_created:
                created.append(d['name'])

        return Response({
            'created': created,
            'message': f"Created: {', '.join(created) if created else 'None (already exist)'}",
        })
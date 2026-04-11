import razorpay
from datetime import timedelta

from django.conf import settings
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
#    Admin: full CRUD | Student: read active services only
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
        if not is_admin(request.user):
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not is_admin(request.user):
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'], url_path='toggle')
    def toggle_active(self, request, pk=None):
        """Admin can toggle a service on/off"""
        if not is_admin(request.user):
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        service = self.get_object()
        service.is_active = not service.is_active
        service.save()
        return Response({'is_active': service.is_active, 'message': f"Service {'activated' if service.is_active else 'deactivated'}."})


# ============================================================
# 2. CREATE RAZORPAY ORDER FOR A SERVICE
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
            return Response({'error': f'Razorpay error: {str(e)}'}, status=status.HTTP_502_BAD_GATEWAY)

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
# 3. VERIFY PAYMENT + GRANT ACCESS
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

        # Verify signature
        try:
            client = get_razorpay_client()
            client.utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature,
            })
        except razorpay.errors.SignatureVerificationError:
            return Response({'error': 'Payment verification failed. Possible fraud attempt.'}, status=status.HTTP_400_BAD_REQUEST)

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
# 7. TEACHER SALARY PAYMENTS
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
        # Teacher sees own salary history
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
        if not is_admin(request.user):
            return Response({'error': 'Only admin can create salary payments.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = CreateSalaryPaymentSerializer(data=request.data)
        if serializer.is_valid():
            payment = serializer.save(paid_by=request.user, status='paid', paid_at=now())
            return Response(
                TeacherSalaryPaymentSerializer(payment).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
        """Admin: summary of salary payments"""
        if not is_admin(request.user):
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        from teachers.models import Teacher
        from django.db.models import Sum, Count

        data = TeacherSalaryPayment.objects.values(
            'teacher__full_name', 'teacher__employee_id', 'teacher__salary'
        ).annotate(
            total_paid=Sum('net_amount'),
            payment_count=Count('id')
        ).order_by('teacher__full_name')

        return Response(list(data))


# ============================================================
# 8. PAYMENT INVOICE DATA (for PDF generation on frontend)
# ============================================================
class StudentInvoiceDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, invoice_number):
        try:
            payment = StudentServicePayment.objects.get(invoice_number=invoice_number)
        except StudentServicePayment.DoesNotExist:
            return Response({'error': 'Invoice not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Only the owner or admin can access
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

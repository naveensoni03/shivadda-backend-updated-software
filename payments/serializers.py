from rest_framework import serializers
from django.utils.timezone import now
from .models import (
    ServiceCatalog, StudentServicePayment,
    ServiceAccess, TeacherBankDetails, TeacherSalaryPayment
)


# ============================================================
# SERVICE CATALOG
# ============================================================
class ServiceCatalogSerializer(serializers.ModelSerializer):
    gst_amount = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ServiceCatalog
        fields = [
            'id', 'name', 'description', 'service_type', 'price',
            'gst_percentage', 'gst_amount', 'total_price',
            'is_chargeable', 'is_active', 'validity_days', 'icon',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def get_gst_amount(self, obj):
        return obj.get_gst_amount()

    def get_total_price(self, obj):
        return obj.get_total_price()

    def get_created_by_name(self, obj):
        return obj.created_by.full_name if obj.created_by else "System"


# Student only sees active/public fields
class ServiceCatalogPublicSerializer(serializers.ModelSerializer):
    gst_amount = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()
    has_access = serializers.SerializerMethodField()

    class Meta:
        model = ServiceCatalog
        fields = [
            'id', 'name', 'description', 'service_type', 'price',
            'gst_percentage', 'gst_amount', 'total_price',
            'is_chargeable', 'validity_days', 'icon', 'has_access'
        ]

    def get_gst_amount(self, obj):
        return obj.get_gst_amount()

    def get_total_price(self, obj):
        return obj.get_total_price()

    def get_has_access(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return ServiceAccess.objects.filter(
            user=request.user, service=obj, is_active=True
        ).exists()


# ============================================================
# STUDENT PAYMENT
# ============================================================
class StudentServicePaymentSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()
    student_name = serializers.SerializerMethodField()
    student_roll = serializers.SerializerMethodField()

    class Meta:
        model = StudentServicePayment
        fields = [
            'id', 'invoice_number',
            'user', 'user_name', 'user_email',
            'student', 'student_name', 'student_roll',
            'service', 'service_name_snapshot', 'service_type_snapshot',
            'razorpay_order_id', 'razorpay_payment_id',
            'base_amount', 'gst_amount', 'total_amount', 'currency',
            'status', 'payment_method', 'notes',
            'paid_at', 'created_at'
        ]
        read_only_fields = ['id', 'invoice_number', 'created_at', 'updated_at']

    def get_user_name(self, obj):
        return obj.user.full_name if obj.user else ''

    def get_user_email(self, obj):
        return obj.user.email if obj.user else ''

    def get_student_name(self, obj):
        if obj.student:
            return obj.student.full_name
        return obj.user.full_name if obj.user else ''

    def get_student_roll(self, obj):
        return obj.student.admission_number if obj.student else ''


# For admin AG Grid — flat structure
class AdminPaymentListSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()
    student_roll = serializers.SerializerMethodField()

    class Meta:
        model = StudentServicePayment
        fields = [
            'id', 'invoice_number',
            'user_name', 'user_email', 'student_roll',
            'service_name_snapshot', 'service_type_snapshot',
            'base_amount', 'gst_amount', 'total_amount',
            'status', 'payment_method',
            'razorpay_payment_id',
            'paid_at', 'created_at'
        ]

    def get_user_name(self, obj):
        return obj.user.full_name if obj.user else ''

    def get_user_email(self, obj):
        return obj.user.email if obj.user else ''

    def get_student_roll(self, obj):
        return obj.student.admission_number if obj.student else ''


# ============================================================
# SERVICE ACCESS
# ============================================================
class ServiceAccessSerializer(serializers.ModelSerializer):
    service_name = serializers.SerializerMethodField()
    service_type = serializers.SerializerMethodField()
    is_valid = serializers.SerializerMethodField()

    class Meta:
        model = ServiceAccess
        fields = [
            'id', 'service', 'service_name', 'service_type',
            'granted_at', 'expires_at', 'is_active', 'is_valid'
        ]

    def get_service_name(self, obj):
        return obj.service.name if obj.service else ''

    def get_service_type(self, obj):
        return obj.service.service_type if obj.service else ''

    def get_is_valid(self, obj):
        return obj.is_valid()


# ============================================================
# TEACHER BANK DETAILS
# ============================================================
class TeacherBankDetailsSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()

    class Meta:
        model = TeacherBankDetails
        fields = [
            'id', 'teacher', 'teacher_name',
            'account_holder_name', 'account_number', 'ifsc_code',
            'bank_name', 'branch_name', 'account_type', 'upi_id',
            'is_verified', 'updated_at', 'created_at'
        ]
        read_only_fields = ['id', 'is_verified', 'updated_at', 'created_at']

    def get_teacher_name(self, obj):
        return obj.teacher.full_name if obj.teacher else ''


# Admin sees full details; teacher sees masked account number
class TeacherBankDetailsMaskedSerializer(TeacherBankDetailsSerializer):
    account_number = serializers.SerializerMethodField()

    def get_account_number(self, obj):
        num = obj.account_number
        if len(num) > 4:
            return f"{'*' * (len(num) - 4)}{num[-4:]}"
        return num


# ============================================================
# TEACHER SALARY PAYMENT
# ============================================================
class TeacherSalaryPaymentSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()
    teacher_employee_id = serializers.SerializerMethodField()
    paid_by_name = serializers.SerializerMethodField()

    class Meta:
        model = TeacherSalaryPayment
        fields = [
            'id', 'invoice_number',
            'teacher', 'teacher_name', 'teacher_employee_id',
            'month', 'salary_amount', 'bonus', 'deductions', 'net_amount',
            'bank_account_number', 'ifsc_code', 'bank_name', 'account_holder_name',
            'payment_mode', 'transaction_reference',
            'status', 'paid_at', 'paid_by', 'paid_by_name',
            'notes', 'created_at'
        ]
        read_only_fields = ['id', 'invoice_number', 'net_amount', 'created_at']

    def get_teacher_name(self, obj):
        return obj.teacher.full_name if obj.teacher else ''

    def get_teacher_employee_id(self, obj):
        return obj.teacher.employee_id if obj.teacher else ''

    def get_paid_by_name(self, obj):
        return obj.paid_by.full_name if obj.paid_by else ''


class CreateSalaryPaymentSerializer(serializers.ModelSerializer):
    """Used when admin creates a new salary payment"""
    class Meta:
        model = TeacherSalaryPayment
        fields = [
            'teacher', 'month', 'salary_amount', 'bonus', 'deductions',
            'payment_mode', 'transaction_reference', 'notes'
        ]

    def create(self, validated_data):
        teacher = validated_data.get('teacher')
        # Auto-fill bank details snapshot
        try:
            bank = teacher.bank_details
            validated_data['bank_account_number'] = bank.account_number
            validated_data['ifsc_code'] = bank.ifsc_code
            validated_data['bank_name'] = bank.bank_name
            validated_data['account_holder_name'] = bank.account_holder_name
        except Exception:
            pass
        return super().create(validated_data)

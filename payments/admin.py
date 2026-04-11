from django.contrib import admin
from .models import (
    ServiceCatalog, StudentServicePayment,
    ServiceAccess, TeacherBankDetails, TeacherSalaryPayment
)


@admin.register(ServiceCatalog)
class ServiceCatalogAdmin(admin.ModelAdmin):
    list_display = ['name', 'service_type', 'price', 'gst_percentage', 'is_chargeable', 'is_active', 'validity_days', 'created_at']
    list_filter = ['service_type', 'is_active', 'is_chargeable']
    search_fields = ['name', 'description']
    list_editable = ['price', 'is_active', 'is_chargeable']
    ordering = ['name']


@admin.register(StudentServicePayment)
class StudentServicePaymentAdmin(admin.ModelAdmin):
    list_display = ['invoice_number', 'user', 'service_name_snapshot', 'total_amount', 'status', 'payment_method', 'paid_at', 'created_at']
    list_filter = ['status', 'service_type_snapshot', 'payment_method']
    search_fields = ['invoice_number', 'user__full_name', 'user__email', 'razorpay_payment_id']
    readonly_fields = ['invoice_number', 'razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature']
    ordering = ['-created_at']


@admin.register(ServiceAccess)
class ServiceAccessAdmin(admin.ModelAdmin):
    list_display = ['user', 'service', 'is_active', 'granted_at', 'expires_at']
    list_filter = ['is_active', 'service']
    search_fields = ['user__full_name', 'user__email']


@admin.register(TeacherBankDetails)
class TeacherBankDetailsAdmin(admin.ModelAdmin):
    list_display = ['teacher', 'bank_name', 'account_type', 'ifsc_code', 'is_verified', 'updated_at']
    list_filter = ['bank_name', 'account_type', 'is_verified']
    search_fields = ['teacher__full_name', 'account_holder_name', 'ifsc_code']
    list_editable = ['is_verified']


@admin.register(TeacherSalaryPayment)
class TeacherSalaryPaymentAdmin(admin.ModelAdmin):
    list_display = ['invoice_number', 'teacher', 'month', 'salary_amount', 'bonus', 'deductions', 'net_amount', 'status', 'payment_mode', 'paid_at']
    list_filter = ['status', 'payment_mode', 'month']
    search_fields = ['invoice_number', 'teacher__full_name', 'teacher__employee_id', 'transaction_reference']
    readonly_fields = ['invoice_number', 'net_amount']
    ordering = ['-created_at']

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ServiceCatalogViewSet,
    CreateServiceOrderView,
    VerifyServicePaymentView,
    MyPaymentHistoryView,
    MyServiceAccessView,
    StudentAccessPermissionsView,
    SeedDefaultServicesView,
    AdminStudentPaymentsView,
    TeacherBankDetailsView,
    AdminTeacherBankDetailsView,
    TeacherSalaryViewSet,
    StudentInvoiceDetailView,
    TeacherInvoiceDetailView,
)

router = DefaultRouter()
router.register(r'services', ServiceCatalogViewSet, basename='service-catalog')
router.register(r'teacher-salary', TeacherSalaryViewSet, basename='teacher-salary')

urlpatterns = [
    path('', include(router.urls)),

    # Razorpay Flow
    path('create-order/', CreateServiceOrderView.as_view(), name='create-service-order'),
    path('verify/', VerifyServicePaymentView.as_view(), name='verify-service-payment'),

    # Student
    path('my-payments/', MyPaymentHistoryView.as_view(), name='my-payments'),
    path('my-access/', MyServiceAccessView.as_view(), name='my-access'),
    path('my-permissions/', StudentAccessPermissionsView.as_view(), name='my-permissions'),
    path('invoice/<str:invoice_number>/', StudentInvoiceDetailView.as_view(), name='student-invoice'),

    # Admin
    path('admin/all-payments/', AdminStudentPaymentsView.as_view(), name='admin-all-payments'),
    path('admin/teacher/<int:teacher_id>/bank/', AdminTeacherBankDetailsView.as_view(), name='admin-teacher-bank'),
    path('admin/seed-services/', SeedDefaultServicesView.as_view(), name='seed-services'),

    # Teacher
    path('teacher/bank-details/', TeacherBankDetailsView.as_view(), name='teacher-bank-details'),
    path('teacher/salary-invoice/<str:invoice_number>/', TeacherInvoiceDetailView.as_view(), name='teacher-salary-invoice'),
]

from rest_framework import viewsets
from .models import Payroll
from .serializers import PayrollSerializer

class PayrollViewSet(viewsets.ModelViewSet):
    # ✅ FIX: Show latest payments first
    queryset = Payroll.objects.all().order_by('-payment_date')
    serializer_class = PayrollSerializer
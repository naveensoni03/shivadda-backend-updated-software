import csv
from django.http import HttpResponse
from django.db.models import Sum
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny

from students.models import Student
from .models import FeeTransaction, Installment, FeePlan
from .serializers import FeeTransactionSerializer

# ---------------------------------------------------
# 1. Fee Transactions API
# ---------------------------------------------------
class FeeTransactionAPI(APIView):
    permission_classes = [AllowAny] 

    def get(self, request):
        # 🔥 NAYA LOGIC: Ab ye sirf transactions nahi, balki SAARE students ko fetch karega
        students = Student.objects.all().order_by('first_name')
        response_data = []

        for student in students:
            # 1. Bacchhe ki total fee kitni banti hai? (Installments se nikalenge)
            installments = Installment.objects.filter(student=student)
            total_fee = installments.aggregate(Sum('amount'))['amount__sum'] or 0

            # 2. Bacche ne kitna pay kar diya hai? (Transactions se nikalenge)
            transactions = FeeTransaction.objects.filter(student=student)
            total_paid = transactions.aggregate(Sum('amount_paid'))['amount_paid__sum'] or 0

            # (Fallback): Agar installment set nahi hai, par direct transaction me total fee daali thi
            if total_fee == 0 and transactions.exists():
                # Sabse latest transaction ka total amount utha lo
                latest_txn = transactions.order_by('-payment_date').first()
                total_fee = latest_txn.total_amount if latest_txn else 0

            # 3. Pending kitna hai?
            due_amount = float(total_fee) - float(total_paid)

            # 4. Status set karo
            if total_fee == 0:
                current_status = "Unpaid" # Default agar fee set hi nahi ki hai
            elif due_amount <= 0:
                current_status = "Paid"
            elif total_paid > 0:
                current_status = "Partial"
            else:
                current_status = "Unpaid"

            # 5. Frontend ke map ke hisaab se data bhejo
            response_data.append({
                "id": student.roll_number or f"STD-{student.id}",
                "student": f"{student.first_name} {student.last_name}".strip() or "Unknown Student",
                "class": student.student_class or "General",
                "total": total_fee,
                "paid": total_paid,
                "due": due_amount if due_amount > 0 else 0,
                "status": current_status
            })

        return Response(response_data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = FeeTransactionSerializer(data=request.data)
        if serializer.is_valid():
            transaction = serializer.save()
            
            # 🔥 OPTIMIZED: Agar roll number diya hai, to usse dhundo (Fastest)
            roll_number = serializer.validated_data.get('roll_no')
            if roll_number:
                student_obj = Student.objects.filter(roll_number=roll_number).first()
                if student_obj:
                    transaction.student = student_obj
                    transaction.save(update_fields=['student']) # Only update student field, faster

            return Response({"message": "Fee Collected Successfully!", "data": serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        txn_id = request.data.get('id')
        new_payment = float(request.data.get('amount_paid', 0))

        if not txn_id or new_payment <= 0:
            return Response({"error": "Invalid ID or Amount"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            txn = FeeTransaction.objects.get(transaction_id=txn_id)
            
            txn.amount_paid = float(txn.amount_paid) + new_payment
            txn.due_amount = float(txn.total_amount) - txn.amount_paid
            
            if txn.due_amount <= 0:
                txn.due_amount = 0
                txn.status = "Paid"
            else:
                txn.status = "Partial"
            
            txn.save()
            return Response({"message": "Due Payment Successful!"}, status=status.HTTP_200_OK)

        except FeeTransaction.DoesNotExist:
            return Response({"error": "Transaction Not Found"}, status=status.HTTP_404_NOT_FOUND)

# ---------------------------------------------------
# 2. Student Fee Ledger
# ---------------------------------------------------
class StudentFeeLedgerAPI(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            student_profile = Student.objects.get(email=request.user.email)
            installments = Installment.objects.filter(student=student_profile)
            transactions = FeeTransaction.objects.filter(student=student_profile)
            
            total_fee_assigned = installments.aggregate(Sum('amount'))['amount__sum'] or 0
            total_paid = transactions.aggregate(Sum('amount_paid'))['amount_paid__sum'] or 0
            
            if total_fee_assigned == 0 and transactions.exists():
                total_fee_assigned = transactions.aggregate(Sum('total_amount'))['total_amount__sum'] or 0

            outstanding_balance = total_fee_assigned - total_paid

            return Response({
                "student_name": f"{student_profile.first_name} {student_profile.last_name}",
                "ledger": [
                    {
                        "id": txn.transaction_id, 
                        "date": txn.payment_date, 
                        "amount_paid": txn.amount_paid,
                        "status": txn.status,
                        "type": "Transaction"
                    } for txn in transactions
                ],
                "summary": {
                    "total_fee": total_fee_assigned,
                    "total_paid": total_paid,
                    "outstanding_balance": outstanding_balance if outstanding_balance > 0 else 0
                }
            })
        except Student.DoesNotExist:
            return Response({"error": "Student record not found linked to this user"}, status=404)

# ---------------------------------------------------
# 3. Dashboard Summary
# ---------------------------------------------------
@api_view(['GET'])
@permission_classes([AllowAny])
def fee_summary(request):
    total_collected = FeeTransaction.objects.aggregate(Sum('amount_paid'))['amount_paid__sum'] or 0
    total_pending = FeeTransaction.objects.aggregate(Sum('due_amount'))['due_amount__sum'] or 0
    
    return Response({
        'collected': total_collected,
        'pending': total_pending
    })

# ---------------------------------------------------
# 4. CSV Export
# ---------------------------------------------------
@api_view(['GET'])
@permission_classes([AllowAny])
def download_fee_csv(request):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="fee_report.csv"'
    
    writer = csv.writer(response)
    writer.writerow(['Receipt No', 'Student Name', 'Class', 'Total Amount', 'Paid', 'Due', 'Payment Mode', 'Date', 'Status', 'Approved By'])
    
    transactions = FeeTransaction.objects.all()
    
    for txn in transactions:
        writer.writerow([
            txn.transaction_id,
            txn.student_name,
            txn.student_class,
            txn.total_amount,
            txn.amount_paid,
            txn.due_amount,
            txn.payment_mode,
            txn.payment_date,
            txn.status,
            txn.discount_approved_by or "N/A"
        ])
        
    return response
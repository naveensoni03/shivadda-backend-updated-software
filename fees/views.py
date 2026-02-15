import csv
from django.http import HttpResponse
from django.db.models import Sum
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny

# Models Import
from students.models import Student
from .models import FeeTransaction, Installment, FeePlan
from .serializers import FeeTransactionSerializer

# ---------------------------------------------------
# 1. Fee Transactions API (Admin: Collect & Update)
# ---------------------------------------------------
class FeeTransactionAPI(APIView):
    # Sirf Staff/Admin access kar sake (Production me IsAdminUser lagayein)
    permission_classes = [AllowAny] 

    def get(self, request):
        """ Fetch all transactions for the Ledger Table """
        transactions = FeeTransaction.objects.all().order_by('-payment_date', '-created_at')
        serializer = FeeTransactionSerializer(transactions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """ Create New Transaction (Collect Fee) """
        serializer = FeeTransactionSerializer(data=request.data)
        if serializer.is_valid():
            # 1. Save Transaction
            transaction = serializer.save()
            
            # 2. (Optional) Agar Student database me hai to Link karo
            student_name_str = serializer.validated_data.get('student_name', '').split(' ')[0]
            student_obj = Student.objects.filter(first_name__icontains=student_name_str).first()
            if student_obj:
                transaction.student = student_obj
                transaction.save()

            return Response({"message": "Fee Collected Successfully!", "data": serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        """ Pay Pending/Due Amount """
        txn_id = request.data.get('id')
        new_payment = float(request.data.get('amount_paid', 0))

        if not txn_id or new_payment <= 0:
            return Response({"error": "Invalid ID or Amount"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            txn = FeeTransaction.objects.get(transaction_id=txn_id)
            
            # Logic: Update Payment & Due
            txn.amount_paid = float(txn.amount_paid) + new_payment
            txn.due_amount = float(txn.total_amount) - txn.amount_paid
            
            # Status Update
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
# 2. Student Fee Ledger (Student: View My Fees)
# ---------------------------------------------------
class StudentFeeLedgerAPI(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Login user ki email se Student profile dhundo
            student_profile = Student.objects.get(email=request.user.email)
            
            # Data Fetching
            installments = Installment.objects.filter(student=student_profile)
            transactions = FeeTransaction.objects.filter(student=student_profile)
            
            # Summary Calculation
            total_fee_assigned = installments.aggregate(Sum('amount'))['amount__sum'] or 0
            total_paid = transactions.aggregate(Sum('amount_paid'))['amount_paid__sum'] or 0
            
            # Agar Installments empty hain (Direct Receipt System), to Transaction Total ko hi Total maano
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
# 3. Dashboard Summary (For Admin Dashboard Charts)
# ---------------------------------------------------
@api_view(['GET'])
@permission_classes([AllowAny])
def fee_summary(request):
    """ Returns Total Revenue & Pending Fees for Dashboard Widgets """
    
    # 1. Total Collected (From Actual Receipts)
    total_collected = FeeTransaction.objects.aggregate(Sum('amount_paid'))['amount_paid__sum'] or 0
    
    # 2. Total Pending (Sum of 'due_amount' from Partial/Pending Receipts)
    total_pending = FeeTransaction.objects.aggregate(Sum('due_amount'))['due_amount__sum'] or 0
    
    # (Optional) Add Installment Dues logic here if using Installment model strictly
    
    return Response({
        'collected': total_collected,
        'pending': total_pending
    })


# ---------------------------------------------------
# 4. CSV Export (For Reporting)
# ---------------------------------------------------
@api_view(['GET'])
@permission_classes([AllowAny])
def download_fee_csv(request):
    """ Generates a CSV file of all Fee Transactions """
    
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="fee_report.csv"'
    
    writer = csv.writer(response)
    writer.writerow(['Receipt No', 'Student Name', 'Class', 'Total Amount', 'Paid', 'Due', 'Payment Mode', 'Date', 'Status'])
    
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
            txn.status
        ])
        
    return response
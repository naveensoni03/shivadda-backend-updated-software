from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from datetime import date
from .models import Book, BookIssue
from .serializers import BookSerializer, BookIssueSerializer

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all().order_by('-added_on')
    serializer_class = BookSerializer

class IssueViewSet(viewsets.ModelViewSet):
    queryset = BookIssue.objects.all().order_by('-issue_date')
    serializer_class = BookIssueSerializer

    # 1. ISSUE BOOK LOGIC
    def create(self, request, *args, **kwargs):
        book_id = request.data.get('book')
        roll_no = request.data.get('student_roll')

        try:
            book = Book.objects.get(id=book_id)
            
            # Check Stock
            if book.available_copies < 1:
                return Response({"error": "Book Out of Stock!"}, status=400)
            
            # Check if student already has this book
            if BookIssue.objects.filter(book=book, student_roll=roll_no, status='Issued').exists():
                return Response({"error": "Student already has this book!"}, status=400)

            # Issue Book
            book.available_copies -= 1
            book.save()
            
            return super().create(request, *args, **kwargs)

        except Book.DoesNotExist:
            return Response({"error": "Invalid Book ID"}, status=400)

    # 2. RETURN BOOK LOGIC (Custom Action)
    @action(detail=True, methods=['post'])
    def return_book(self, request, pk=None):
        issue_record = self.get_object()

        if issue_record.status == 'Returned':
            return Response({"error": "Book already returned!"}, status=400)

        # 1. Calculate Final Fine
        final_fine = issue_record.calculate_fine
        
        # 2. Update Stock (+1)
        book = issue_record.book
        book.available_copies += 1
        book.save()

        # 3. Update Record
        issue_record.return_date = date.today()
        issue_record.status = 'Returned'
        issue_record.fine_amount = final_fine
        issue_record.save()

        return Response({
            "message": "Book Returned Successfully", 
            "fine_collected": final_fine
        })
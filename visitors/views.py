from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser # ✨ NEW ADDED
from django.utils import timezone
from .models import Visitor
from .serializers import VisitorSerializer

class VisitorViewSet(viewsets.ModelViewSet):
    serializer_class = VisitorSerializer
    
    # ✨ NEW ADDED: File uploads (id_proof_file) ko accept karne ke liye
    parser_classes = [MultiPartParser, FormParser, JSONParser] 

    def get_queryset(self):
        queryset = Visitor.objects.all().order_by('-check_in_time')
        
        # ✅ Filter by Date (Frontend se date aayegi)
        date_param = self.request.query_params.get('date', None)
        if date_param:
            return queryset.filter(check_in_time__date=date_param)
        
        # Default: Aaj ka data dikhao
        today = timezone.now().date()
        return queryset.filter(check_in_time__date=today)

    # ✅ Single Checkout
    @action(detail=True, methods=['post'])
    def checkout(self, request, pk=None):
        visitor = self.get_object()
        if visitor.is_checked_out:
            return Response({'status': 'Already checked out'}, status=status.HTTP_400_BAD_REQUEST)

        visitor.check_out_time = timezone.now()
        visitor.is_checked_out = True
        visitor.save()
        return Response({'status': 'Visitor Checked Out Successfully'})

    # ✅ NEW: Bulk Checkout (Multiple visitors ek sath checkout karne ke liye)
    @action(detail=False, methods=['post'])
    def bulk_checkout(self, request):
        # Frontend se visitor IDs ki list aayegi: {"visitor_ids": [1, 2, 3]}
        visitor_ids = request.data.get('visitor_ids', [])
        
        if not visitor_ids:
            return Response({'error': 'No visitor IDs provided'}, status=status.HTTP_400_BAD_REQUEST)

        # Bulk update query (fast execution)
        Visitor.objects.filter(id__in=visitor_ids, is_checked_out=False).update(
            is_checked_out=True,
            check_out_time=timezone.now()
        )
        
        return Response({'status': f'{len(visitor_ids)} Visitors Checked Out Successfully'})
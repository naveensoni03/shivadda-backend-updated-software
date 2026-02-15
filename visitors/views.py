from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Visitor
from .serializers import VisitorSerializer
from datetime import datetime

class VisitorViewSet(viewsets.ModelViewSet):
    serializer_class = VisitorSerializer

    def get_queryset(self):
        queryset = Visitor.objects.all().order_by('-check_in_time')
        
        # ✅ Filter by Date (Frontend se date aayegi)
        date_param = self.request.query_params.get('date', None)
        if date_param:
            return queryset.filter(check_in_time__date=date_param)
        
        # Default: Aaj ka data dikhao
        today = timezone.now().date()
        return queryset.filter(check_in_time__date=today)

    @action(detail=True, methods=['post'])
    def checkout(self, request, pk=None):
        visitor = self.get_object()
        visitor.check_out_time = timezone.now()
        visitor.is_checked_out = True
        visitor.save()
        return Response({'status': 'Visitor Checked Out Successfully'})
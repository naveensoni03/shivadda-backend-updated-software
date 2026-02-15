from rest_framework import viewsets
from .models import Transport
from .serializers import TransportSerializer

class TransportViewSet(viewsets.ModelViewSet):
    queryset = Transport.objects.all()
    serializer_class = TransportSerializer
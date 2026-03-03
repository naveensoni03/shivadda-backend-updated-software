from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count
from .models import Place
from .serializers import PlaceSerializer

class PlaceViewSet(viewsets.ModelViewSet):
    # Optimization: prefetch_related ya select_related lagane se queries fast hoti hain
    queryset = Place.objects.all()
    serializer_class = PlaceSerializer

    # Sirf Top Level (Roots) lane ke liye
    @action(detail=False, methods=['get'])
    def roots(self, request):
        # Database se sirf roots uthao (jinka koi parent nahi hai)
        roots = Place.objects.filter(parent__isnull=True)
        serializer = self.get_serializer(roots, many=True)
        return Response(serializer.data)

    # Kisi place ke children lane ke liye (Click par load hoga)
    @action(detail=True, methods=['get'])
    def children(self, request, pk=None):
        place = self.get_object()
        # Us specific place ke immediate bachhe (children) uthao
        children = place.children.all()
        serializer = self.get_serializer(children, many=True)
        return Response(serializer.data)
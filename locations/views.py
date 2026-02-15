from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Place
from .serializers import PlaceSerializer

class PlaceViewSet(viewsets.ModelViewSet):
    queryset = Place.objects.all()
    serializer_class = PlaceSerializer

    # Sirf Top Level (Roots) lane ke liye
    @action(detail=False, methods=['get'])
    def roots(self, request):
        roots = Place.objects.filter(parent__isnull=True)
        serializer = self.get_serializer(roots, many=True)
        return Response(serializer.data)

    # Kisi place ke children lane ke liye (Click par load hoga)
    @action(detail=True, methods=['get'])
    def children(self, request, pk=None):
        place = self.get_object()
        children = place.children.all()
        serializer = self.get_serializer(children, many=True)
        return Response(serializer.data)
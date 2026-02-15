from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Batch
from .serializers import BatchSerializer

class BatchListCreate(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(BatchSerializer(Batch.objects.all(), many=True).data)

    def post(self, request):
        serializer = BatchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

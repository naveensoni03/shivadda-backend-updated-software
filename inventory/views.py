from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Item, StockTransaction, Category
from .serializers import ItemSerializer, TransactionSerializer, CategorySerializer

class CategoryList(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class InventoryListCreate(generics.ListCreateAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer

class InventoryDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer

class StockActionAPI(APIView):
    def post(self, request):
        serializer = TransactionSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save()
                return Response({"message": "Stock Updated!", "data": serializer.data})
            except ValueError as e:
                return Response({"error": str(e)}, status=400)
        return Response(serializer.errors, status=400)

# --- ✅ NEW VIEW: Item History ---
class ItemHistoryAPI(generics.ListAPIView):
    serializer_class = TransactionSerializer
    
    def get_queryset(self):
        item_id = self.kwargs['pk']
        return StockTransaction.objects.filter(item_id=item_id).order_by('-date')
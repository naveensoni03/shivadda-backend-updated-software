from rest_framework import serializers
from .models import Item, Category, StockTransaction

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    class Meta:
        model = Item
        fields = '__all__'

class TransactionSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)
    # Date format readable banaya
    formatted_date = serializers.DateTimeField(source='date', format="%d %b %Y, %I:%M %p", read_only=True)
    
    class Meta:
        model = StockTransaction
        fields = '__all__'
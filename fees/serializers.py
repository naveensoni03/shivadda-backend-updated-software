from rest_framework import serializers
from .models import FeeTransaction

class FeeTransactionSerializer(serializers.ModelSerializer):
    # --- Frontend Keys <-> Backend Fields Mapping ---
    
    # Frontend 'id' bhejega -> Backend 'transaction_id' me save karega
    id = serializers.CharField(source='transaction_id')
    
    # Frontend 'student' bhejega -> Backend 'student_name' me save karega
    student = serializers.CharField(source='student_name')
    
    # Frontend 'roll' bhejega -> Backend 'roll_no' me save karega
    roll = serializers.CharField(source='roll_no', required=False, allow_blank=True)
    
    # Frontend 'class' bhejega (Reserved Keyword) -> Backend 'student_class' me save karega
    class_name = serializers.CharField(source='student_class') 
    
    # Financials Mappings
    total = serializers.FloatField(source='total_amount')
    paid = serializers.FloatField(source='amount_paid')
    due = serializers.FloatField(source='due_amount')
    
    # Meta Data Mappings
    date = serializers.DateField(source='payment_date')
    mode = serializers.CharField(source='payment_mode')

    class Meta:
        model = FeeTransaction
        fields = [
            'id', 'student', 'roll', 'class_name', 
            'total', 'paid', 'due', 'date', 
            'status', 'mode', 'breakdown'
        ]

    # --- 1. Sending Data to Frontend (Backend -> Frontend) ---
    def to_representation(self, instance):
        """
        Jab database se data frontend jayega, tab 'class_name' ko 'class' banakar bhejenge
        taaki frontend table me sahi dikhe.
        """
        data = super().to_representation(instance)
        data['class'] = data.pop('class_name') # Key rename: class_name -> class
        return data

    # --- 2. Receiving Data from Frontend (Frontend -> Backend) ---
    def to_internal_value(self, data):
        """
        Jab frontend se data aayega, tab 'class' ko 'class_name' banakar model me save karenge.
        """
        # Mutable copy banate hain taaki modify kar sakein
        if hasattr(data, 'copy'):
            data = data.copy()
        
        # Agar 'class' key aayi hai toh usse 'class_name' me convert karo
        if 'class' in data:
            data['class_name'] = data.pop('class')
            
        return super().to_internal_value(data)
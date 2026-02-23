from rest_framework import serializers
from .models import FeeTransaction

class FeeTransactionSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='transaction_id')
    student = serializers.CharField(source='student_name')
    roll = serializers.CharField(source='roll_no', required=False, allow_blank=True)
    class_name = serializers.CharField(source='student_class') 
    
    total = serializers.FloatField(source='total_amount')
    paid = serializers.FloatField(source='amount_paid')
    due = serializers.FloatField(source='due_amount')
    
    date = serializers.DateField(source='payment_date')
    mode = serializers.CharField(source='payment_mode')
    
    # 🔥 NEW: Mapping frontend camelCase to backend snake_case
    discountApprovedBy = serializers.CharField(source='discount_approved_by', required=False, allow_blank=True)

    class Meta:
        model = FeeTransaction
        fields = [
            'id', 'student', 'roll', 'class_name', 
            'total', 'paid', 'due', 'date', 
            'status', 'mode', 'breakdown', 'discountApprovedBy'
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['class'] = data.pop('class_name') 
        return data

    def to_internal_value(self, data):
        if hasattr(data, 'copy'):
            data = data.copy()
        
        if 'class' in data:
            data['class_name'] = data.pop('class')
            
        return super().to_internal_value(data)
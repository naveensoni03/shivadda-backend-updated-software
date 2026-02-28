from rest_framework import serializers
from .models import Visitor

class VisitorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visitor
        fields = '__all__'
        # Note: Frontend se aane wale extra fields (jaise otp, captcha) 
        # jo DB me save nahi karne, ModelSerializer unhe automatically ignore kar dega.
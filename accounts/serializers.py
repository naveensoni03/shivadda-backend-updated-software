from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Agent

User = get_user_model()

# ✅ UserManagementSerializer (Updated for Deep Features)
class UserManagementSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'phone', 'role', 
            'account_status', 'is_active', 'date_joined', 
            'last_login', 'password', 'storage_limit_mb', 'storage_used_mb',
            'created_by'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login', 'is_active', 'created_by']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data) # Create instance
        if password:
            user.set_password(password) # Hash password
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

# ... (Agent code remains same)
class AgentSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    name = serializers.CharField(source="user.full_name", read_only=True)
    class Meta:
        model = Agent
        fields = ["id", "name", "email", "phone", "department", "is_active"]

class AgentCreateSerializer(serializers.Serializer):
    name = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    phone = serializers.CharField()
    department = serializers.CharField()

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            full_name=validated_data["name"],
            role="AGENT"
        )
        agent = Agent.objects.create(
            user=user,
            phone=validated_data["phone"],
            department=validated_data["department"]
        )
        return agent
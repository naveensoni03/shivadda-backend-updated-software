from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from django.utils.crypto import get_random_string
from django.db import transaction
from .models import Institution
from .serializers import InstitutionSerializer

User = get_user_model()

class InstitutionViewSet(viewsets.ModelViewSet):
    queryset = Institution.objects.all().order_by('-created_at')
    serializer_class = InstitutionSerializer
    permission_classes = [permissions.AllowAny] 

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                # 1. School Save (All new fields will auto-save via Serializer)
                school = serializer.save()

                # 2. Automatic Principal ID Creation
                credentials = None
                if school.contact_email:
                    email = school.contact_email.lower().strip()
                    if not User.objects.filter(email=email).exists():
                        password = get_random_string(10)
                        base_username = email.split('@')[0]
                        username = f"{base_username}_{get_random_string(4)}"

                        user = User.objects.create_user(
                            email=email, 
                            username=username,
                            password=password,
                            first_name="Principal",
                            last_name=school.name[:20],
                            role='MANAGEMENT' 
                        )
                        school.owner = user
                        school.save()
                        credentials = { "email": email, "password": password, "username": username }

                response_data = InstitutionSerializer(school).data
                if credentials:
                    return Response({
                        "school": response_data,
                        "credentials": credentials,
                        "message": "Institution onboarded & Principal ID generated!"
                    }, status=status.HTTP_201_CREATED)
                
                return Response(response_data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        return Response({
            "total_institutions": Institution.objects.count(),
            "active_institutions": Institution.objects.filter(is_active=True).count(),
            "premium_users": Institution.objects.filter(subscription_plan='PREMIUM').count(),
            # ✅ Extra stat added
            "with_hostel": Institution.objects.filter(has_hostel=True).count(),
        })
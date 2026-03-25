from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import ParentProfile
from .serializers import ParentProfileSerializer

# ✨ NEW: Student model ko import kiya taaki data fetch kar sakein
from students.models import Student

class ParentProfileViewSet(viewsets.ModelViewSet):
    serializer_class = ParentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Sirf logged-in parent ko apni profile dikhegi
        return ParentProfile.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def my_children(self, request):
        """
        Parent ke dashboard par unke bacchon ka REAL data dikhane ke liye API
        """
        parent_profile = ParentProfile.objects.filter(user=request.user).first()
        
        if not parent_profile:
            return Response({"error": "Parent profile not found"}, status=404)

        # ✨ NEW: Database se is parent ke saare bacchon ko fetch kar rahe hain
        children = parent_profile.children.all()
        
        children_records = []
        for child in children:
            children_records.append({
                "student_id": child.admission_number,
                "name": f"{child.first_name} {child.last_name}".strip(),
                "class": f"{child.student_class} - {child.section}",
                "fee_status": child.fee_status,
                
                # NOTE: Attendance aur Exams ka system banne ke baad inko bhi database se link kar denge [cite: 217, 252]
                "attendance": "Not Available", 
                "latest_exam_grade": "Pending" 
            })

        # Final Response Data
        data = {
            "parent_name": parent_profile.father_name or parent_profile.mother_name or "Parent",
            "total_children": children.count(),
            "children_records": children_records
        }
        
        return Response(data)
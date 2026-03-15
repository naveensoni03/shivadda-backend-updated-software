from django.urls import path
from .views import (
    AllocateRoomAPI, RoomListAPI, ComplaintListAPI, 
    GatePassListAPI, UnallocatedStudentsAPI
)

urlpatterns = [
    path('allocate/', AllocateRoomAPI.as_view(), name='allocate'),
    path('rooms/', RoomListAPI.as_view(), name='rooms'),
    path('unallocated-students/', UnallocatedStudentsAPI.as_view(), name='unallocated'),
    
    # Notice the optional <int:pk> for the PATCH requests
    path('complaints/', ComplaintListAPI.as_view(), name='complaints'),
    path('complaints/<int:pk>/', ComplaintListAPI.as_view(), name='complaints_update'),
    
    path('gatepasses/', GatePassListAPI.as_view(), name='gatepasses'),
    path('gatepasses/<int:pk>/', GatePassListAPI.as_view(), name='gatepasses_update'),
]
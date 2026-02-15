from django.urls import path
from .views import SubmitHomeworkAPI # Maan lijiye aapne ye views banaye hain

urlpatterns = [
    path("homework/", SubmitHomeworkAPI.as_view()), # Homework list/post ke liye
]
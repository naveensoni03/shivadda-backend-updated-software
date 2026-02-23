from rest_framework import serializers
from .models import Place

class PlaceSerializer(serializers.ModelSerializer):
    # Frontend ko batayenge ki iske niche aur data hai ya nahi (Folders jaisa feel dene ke liye)
    children_count = serializers.IntegerField(source='children.count', read_only=True)
    parent_name = serializers.ReadOnlyField(source='parent.name')

    class Meta:
        model = Place
        fields = '__all__'
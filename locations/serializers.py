from rest_framework import serializers
from .models import Place

class PlaceSerializer(serializers.ModelSerializer):
    # Frontend ko batayenge ki iske niche aur data hai ya nahi (Folders jaisa feel dene ke liye)
    children_count = serializers.IntegerField(source='children.count', read_only=True)
    parent_name = serializers.ReadOnlyField(source='parent.name')

    # --- EXTRA: Display Values for Frontend UI (Read-Only) ---
    # Ye fields automatically backend choices ka full naam denge
    # Jaise 'ACTIVE' bhejoge, toh API response mein status_display: 'Active / Show' bhi aayega
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    place_type_display = serializers.CharField(source='get_place_type_display', read_only=True)
    space_type_display = serializers.CharField(source='get_space_type_display', read_only=True)
    place_uses_for_display = serializers.CharField(source='get_place_uses_for_display', read_only=True)
    work_status_display = serializers.CharField(source='get_work_status_display', read_only=True)

    class Meta:
        model = Place
        fields = '__all__'
        
    # Optional: Agar aap custom validation lagana chahte hain toh yahan laga sakte hain
    # Jaise ki Continent ka parent hamesha Global hona chahiye, etc.
    def validate(self, data):
        # Yahan DRF automatically aapke choices check kar lega. 
        # Kuch extra check karna ho toh yahan likh sakte hain.
        return data
from rest_framework import serializers
from .models import Book, BookIssue

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = '__all__'

class BookIssueSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)
    # Backend se live fine calculate hoke aayega
    current_fine = serializers.ReadOnlyField(source='calculate_fine')

    class Meta:
        model = BookIssue
        fields = '__all__'
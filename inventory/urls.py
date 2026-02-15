from django.urls import path
from .views import InventoryListCreate, StockActionAPI, CategoryList, InventoryDetail, ItemHistoryAPI

urlpatterns = [
    path('', InventoryListCreate.as_view()),
    path('<int:pk>/', InventoryDetail.as_view()),
    path('transaction/', StockActionAPI.as_view()),
    path('categories/', CategoryList.as_view()),
    path('history/<int:pk>/', ItemHistoryAPI.as_view()), # ✅ History URL Added
]
from django.urls import path
from .views import FoodItemListCreate, OrderListCreateView, OrderUpdateView
from .views import reset_orders

urlpatterns = [
    path('foods/', FoodItemListCreate.as_view(), name='food-list'),  
    path('orders/', OrderListCreateView.as_view(), name='order-list-create'),  
    path('orders/<int:pk>/', OrderUpdateView.as_view(), name='order-update'),  
    path("reset/", reset_orders, name="reset-orders"),
]



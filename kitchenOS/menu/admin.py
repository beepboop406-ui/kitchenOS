from django.contrib import admin

# Register your models here.
from .models import FoodItem, Order, OrderItem


admin.site.register(FoodItem)
admin.site.register(Order)
admin.site.register(OrderItem)
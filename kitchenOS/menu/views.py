from django.shortcuts import render
from rest_framework import generics, viewsets
from .models import FoodItem, Order, OrderItem
from .serializers import FoodItemSerializer, OrderSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Create your views here.

class FoodItemListCreate(generics.ListCreateAPIView):
    queryset = FoodItem.objects.all()
    serializer_class = FoodItemSerializer

class OrderListCreateView(generics.ListCreateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

class OrderUpdateView(generics.UpdateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

@api_view(['POST'])
def reset_orders(request):
    try:
        OrderItem.objects.all().delete()
        Order.objects.all().delete()

        demo_food_items = [
            {"name": "Miso Glazed Salmon", "price": 25.00, "description": "Delicious salmon with miso glaze"},
            {"name": "BBQ Pulled Pork Burger", "price": 18.00, "description": "Juicy pulled pork with BBQ sauce"},
            {"name": "Spaghetti Carbonara", "price": 15.00, "description": "Classic Italian pasta with creamy sauce"},
            {"name": "Sushi Platter (12 pcs)", "price": 30.00, "description": "Assorted sushi platter"},
            {"name": "Caprese Salad", "price": 10.00, "description": "Tomato, mozzarella, and basil salad"},
            {"name": "Vegetarian Lasagna", "price": 20.00, "description": "Layers of veggies and cheese in pasta"}
        ]

        food_items = {}
        for f in demo_food_items:
            obj, created = FoodItem.objects.get_or_create(
                name=f["name"],
                defaults={"price": f["price"], "description": f["description"]}
            )
            food_items[f["name"]] = obj

        demo_orders = [
            {
                "customer_name": "Spongebob Squarepants",
                "items": [
                    {"food_item_name": "Miso Glazed Salmon", "quantity": 1}
                ]
            },
            {
                "customer_name": "Patrick Star",
                "items": [
                    {"food_item_name": "BBQ Pulled Pork Burger", "quantity": 2}
                ]
            },
            {
                "customer_name": "Squid ward",
                "items": [
                    {"food_item_name": "Spaghetti Carbonara", "quantity": 1}
                ]
            },
            {
                "customer_name": "Eugene Krab",
                "items": [
                    {"food_item_name": "Miso Glazed Salmon", "quantity": 1}
                ]
            },
            {
                "customer_name": "Sandy Cheeks",
                "items": [
                    {"food_item_name": "Sushi Platter (12 pcs)", "quantity": 1},
                    {"food_item_name": "Caprese Salad", "quantity": 2},
                    {"food_item_name": "Vegetarian Lasagna", "quantity": 1}
                ]
            },
            {
                "customer_name": "Pearl Krab",
                "items": [
                    {"food_item_name": "Water", "quantity": 1},
                ]
            }
        ]

        for demo in demo_orders:
            order = Order.objects.create(
                customer_name=demo["customer_name"],
                status="NEW_ORDER",
                cooking_started_at=None  
            )
            for item in demo["items"]:
                food_item = food_items.get(item["food_item_name"])
                if food_item:
                    OrderItem.objects.create(
                        order=order,
                        food_item=food_item,
                        quantity=item["quantity"]
                    )

        return Response({"message": "Orders reset to demo state, all in NEW_ORDER"})

    except Exception as e:
        return Response({"error": str(e)}, status=500)

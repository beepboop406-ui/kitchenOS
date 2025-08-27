from rest_framework import serializers
from .models import FoodItem, Order, OrderItem
from django.utils import timezone

class FoodItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodItem
        fields = ['id', 'name', 'price', 'description', 'cook_time']


class OrderItemSerializer(serializers.ModelSerializer):
    food_item_name = serializers.CharField(source='food_item.name', read_only=True)
    cook_time = serializers.IntegerField(source='food_item.cook_time', read_only=True)  

    class Meta:
        model = OrderItem
        fields = ['id', 'food_item', 'food_item_name', 'quantity', 'cook_time']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = '__all__'

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        order = Order.objects.create(**validated_data)
        for item in items_data:
            OrderItem.objects.create(order=order, **item)
        return order
    
    def update(self, instance, validated_data):
        old_status = instance.status
        new_status = validated_data.get('status', old_status)

        allowed_flow = ["NEW_ORDER", "COOKING", "READY", "DISPATCHED"]

        if new_status != old_status:
            try:
                old_index = allowed_flow.index(old_status)
                new_index = allowed_flow.index(new_status)
            except ValueError:
                raise serializers.ValidationError("Invalid status value")

            if new_index != old_index + 1:
                raise serializers.ValidationError("Invalid status progression")
            
            if new_status == "COOKING" and not instance.cooking_started_at:
                instance.cooking_started_at = timezone.now()

        instance.status = new_status
        instance.save()

        items_data = validated_data.get('items', None)
        if items_data is not None:
            instance.items.all().delete()
            for item in items_data:
                OrderItem.objects.create(order=instance, **item)

        return instance

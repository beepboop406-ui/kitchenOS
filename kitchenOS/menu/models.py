from django.db import models

# Create your models here.
class FoodItem(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    description = models.TextField()
    cook_time = models.IntegerField(default=10)

    def __str__(self):
        return self.name

class Order(models.Model):
    STATUS_CHOICES = [
        ('NEW_ORDER', 'New Order'),
        ('COOKING', 'Cooking'),
        ('READY', 'Ready'),
        ('DISPATCHED', 'Dispatched'),
    ]

    customer_name = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add= True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='NEW_ORDER'
    )
    cooking_started_at = models.DateTimeField(null=True, blank=True)
    def __str__(self):
        return f"Order{self.id} - {self.customer_name}"
    
class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    food_item = models.ForeignKey(FoodItem, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} X {self.food_item.name}"
import uuid
from django.db import models


class Order(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("failed", "Failed"),
        ("canceled", "Canceled"),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    stripe_payment_intent_id = models.CharField(max_length=255, unique=True)
    email = models.EmailField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    shipping_name = models.CharField(max_length=255, null=True, blank=True)
    shipping_address_line1 = models.CharField(max_length=255, null=True, blank=True)
    shipping_address_line2 = models.CharField(max_length=255, null=True, blank=True)
    shipping_city = models.CharField(max_length=255, null=True, blank=True)
    shipping_state = models.CharField(max_length=255, null=True, blank=True)
    shipping_postal_code = models.CharField(max_length=20, null=True, blank=True)
    shipping_country = models.CharField(max_length=2, null=True, blank=True)

    subtotal_cents = models.IntegerField()
    total_cents = models.IntegerField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Order {self.id} ({self.status})"


class OrderItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    variant_id = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"OrderItem {self.id} - Order {self.order_id}"

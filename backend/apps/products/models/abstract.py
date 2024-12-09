import uuid
from django.db import models


class AbstractProductType(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    name = models.CharField(max_length=255)
    description = models.TextField()
    base_price_cents = models.IntegerField(default=0)

    class Meta:
        abstract = True


class AbstractProduct(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    name = models.CharField(max_length=255)
    price_adjustment_cents = models.IntegerField(default=0)

    @property
    def final_price_cents(self):
        base_price_cents = self.get_base_price_cents()
        return base_price_cents + self.price_adjustment_cents

    def get_base_price_cents(self):
        raise NotImplementedError("Subclasses must implement get_base_price_cents()")

    class Meta:
        abstract = True

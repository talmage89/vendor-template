import uuid
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.http import Http404

from .abstract import AbstractProduct, AbstractProductType


# ECommerce clothing shop implementation


class ProductColor(models.Model):
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.UUIDField()
    product = GenericForeignKey("content_type", "object_id")
    name = models.CharField(max_length=50)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ["order"]
        unique_together = [["content_type", "object_id", "name"]]

    def __str__(self):
        return self.name


class ProductImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    image = models.ImageField(upload_to="product_images")
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.UUIDField()
    product = GenericForeignKey("content_type", "object_id")
    color = models.ForeignKey(
        ProductColor, on_delete=models.CASCADE, null=True, blank=True
    )
    is_default = models.BooleanField(default=False)

    class Meta:
        ordering = ["-is_default", "-created_at"]


class ProductSize(models.Model):
    name = models.CharField(max_length=50, help_text="e.g. Small, Medium, Large")
    code = models.CharField(max_length=10, help_text="e.g. S, M, L, XL")
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.name


class Clothing(AbstractProduct):
    images = GenericRelation(ProductImage)
    colors = GenericRelation(ProductColor, null=True, blank=True)
    available_sizes = models.ManyToManyField(ProductSize, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        abstract = True

    @classmethod
    def get_object(cls, pk):
        for model in cls.__subclasses__():
            try:
                return model.objects.get(pk=pk)
            except model.DoesNotExist:
                continue
        raise Http404("No object found matching this ID")


# ----------------------------------------------
#
# Implementations
#
# Write models for each product type and product.
#
# For example:
#
# - ClothingType class
#   - Shirt (instance)
# - Clothing class
#   - Shirt design 1 (instance)
#   - Shirt design 2 (instance)
#
# You can get more granular for product types if needed, for example, writing a class for ShirtType instead of ClothingType.
#
# - HatType class
#   - Trucker hat (instance)
#   - Cowboy hat (instance)
# - Trucker Hat class
#   - Trucker hat design 1 (instance)
#   - Trucker hat design 2 (instance)
# - Cowboy Hat class
#   - Cowboy hat design 1 (instance)
#   - Cowboy hat design 2 (instance)
#
# Make sure you override the get_base_price_cents method in each Product implementation. `base_price_cents` is stored in the ProductType model.
#
# ----------------------------------------------


class ShirtType(AbstractProductType):
    GENDER_CHOICES = [
        ("male", "Male"),
        ("female", "Female"),
        ("unisex", "Unisex"),
    ]
    gender = models.CharField(max_length=255, choices=GENDER_CHOICES)

    def __str__(self):
        return f"{self.name} ({self.gender})"

    class Meta:
        verbose_name = "Shirt Type"
        verbose_name_plural = "Shirt Types"


class Shirt(Clothing):
    product_type = models.ForeignKey(ShirtType, on_delete=models.PROTECT)

    def get_base_price_cents(self):
        return self.product_type.base_price_cents

from rest_framework import serializers

from .models import ProductImage, ShirtType, Shirt


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = "__all__"


class ShirtTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShirtType
        fields = "__all__"


class ShirtSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shirt
        fields = "__all__"

from rest_framework import serializers

from .models import ProductImage, ProductColor, ProductSize, ShirtType, Shirt, Clothing


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = "__all__"


class ProductColorSerializer(serializers.ModelSerializer):
    product = serializers.CharField(source="object_id")
    content_type = serializers.CharField(source="content_type.model")

    class Meta:
        model = ProductColor
        fields = ["id", "name", "order", "product", "content_type"]


class ProductSizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSize
        fields = "__all__"


class ShirtTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShirtType
        fields = "__all__"


class ShirtSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True)
    colors = ProductColorSerializer(many=True)
    available_sizes = ProductSizeSerializer(many=True)
    final_price_cents = serializers.SerializerMethodField()

    def get_final_price_cents(self, obj):
        return obj.get_base_price_cents() + obj.price_adjustment_cents

    class Meta:
        model = Shirt
        fields = "__all__"


class ClothingSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    name = serializers.CharField()
    type = serializers.SerializerMethodField()
    base_price_cents = serializers.SerializerMethodField()
    price_adjustment_cents = serializers.IntegerField()
    final_price_cents = serializers.SerializerMethodField()
    images = ProductImageSerializer(many=True)
    colors = ProductColorSerializer(many=True)
    available_sizes = ProductSizeSerializer(many=True)
    is_active = serializers.BooleanField()

    def get_type(self, obj):
        return obj.__class__.__name__.lower()

    def get_base_price_cents(self, obj):
        return obj.get_base_price_cents()

    def get_final_price_cents(self, obj):
        return obj.get_base_price_cents() + obj.price_adjustment_cents

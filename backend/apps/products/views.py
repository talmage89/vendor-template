from rest_framework import viewsets

from .models import ProductImage, ShirtType, Shirt
from .serializers import (
    ShirtTypeSerializer,
    ShirtSerializer,
    ProductImageSerializer,
)


class ProductImageViewSet(viewsets.ModelViewSet):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer


class ShirtTypeViewSet(viewsets.ModelViewSet):
    queryset = ShirtType.objects.all()
    serializer_class = ShirtTypeSerializer


class ShirtViewSet(viewsets.ModelViewSet):
    queryset = Shirt.objects.all()
    serializer_class = ShirtSerializer

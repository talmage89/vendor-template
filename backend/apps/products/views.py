from itertools import chain
from django.http import Http404
from rest_framework import viewsets

from .models import ProductImage, ShirtType, Shirt, Clothing, ProductShippingCost
from .serializers import (
    ShirtTypeSerializer,
    ShirtSerializer,
    ProductImageSerializer,
    ClothingSerializer,
    ProductShippingCostSerializer,
)


class ProductImageViewSet(viewsets.ModelViewSet):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer


class ProductShippingCostViewSet(viewsets.ModelViewSet):
    queryset = ProductShippingCost.objects.all()
    serializer_class = ProductShippingCostSerializer


class ShirtTypeViewSet(viewsets.ModelViewSet):
    queryset = ShirtType.objects.all()
    serializer_class = ShirtTypeSerializer


class ShirtViewSet(viewsets.ModelViewSet):
    queryset = Shirt.objects.all()
    serializer_class = ShirtSerializer


class ClothingViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ClothingSerializer

    def get_queryset(self):
        subclasses = Clothing.__subclasses__()
        queryset = chain(*[model.objects.all() for model in subclasses])
        return list(queryset)

    def get_object(self):
        subclasses = Clothing.__subclasses__()

        for model in subclasses:
            try:
                return model.objects.get(pk=self.kwargs["pk"])
            except model.DoesNotExist:
                continue

        raise Http404("No object found matching this ID")

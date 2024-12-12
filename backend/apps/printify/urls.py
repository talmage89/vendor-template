from django.urls import path
from .views import PrintifyView, ShippingCostView

urlpatterns = [
    path("shops/", PrintifyView.get_shops, name="printify-shops"),
    path("products/", PrintifyView.get_products, name="printify-products"),
    path(
        "products/<str:product_id>/", PrintifyView.get_product, name="printify-product"
    ),
    path("shipping-costs/", ShippingCostView.as_view(), name="printify-shipping"),
    # path("orders/", PrintifyView.submit_order, name="printify-orders"),
]

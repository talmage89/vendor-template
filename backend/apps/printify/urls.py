from django.urls import path
from .views import PrintifyView

urlpatterns = [
    path("shops/", PrintifyView.get_shops, name="printify-shops"),
    path("products/", PrintifyView.get_products, name="printify-products"),
    path("shipping/", PrintifyView.calculate_shipping, name="printify-shipping"),
    # path("orders/", PrintifyView.submit_order, name="printify-orders"),
]


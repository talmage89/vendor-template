from django.urls import path

from .views import PaymentIntentView

urlpatterns = [
    path(
        "create-payment-intent/",
        PaymentIntentView.as_view(),
        name="create_payment_intent",
    ),
]

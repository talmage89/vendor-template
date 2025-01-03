from django.urls import path

from .views import PaymentIntentView, SetupIntentView, WebhookView

urlpatterns = [
    path(
        "create-payment-intent/",
        PaymentIntentView.as_view(),
        name="create_payment_intent",
    ),
    path(
        "create-setup-intent/",
        SetupIntentView.as_view(),
        name="create_setup_intent",
    ),
    path("webhook/", WebhookView.as_view(), name="webhook"),
]

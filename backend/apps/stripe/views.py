import stripe
import uuid
import json

from django.db import transaction
from django.db.models import Q
from django.conf import settings
from django.http import HttpResponse
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from apps.accounts.models import User
from apps.printify.views import PrintifyView

from .models import Order, OrderItem

stripe.api_key = settings.STRIPE_SECRET_KEY
stripe_version = "2024-11-20.acacia"
stripe.api_version = stripe_version
webhook_secret = settings.STRIPE_WEBHOOK_SECRET


class PaymentIntentView(APIView):
    def post(self, request):
        try:
            cart = request.data["cart"]
            expected_total = request.data["expected_total"]
            country = request.data["country"]

            if not len(cart):
                return Response(
                    {"error": "Cart is empty"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            try:
                order_amount = PrintifyView.calculate_order_amount(cart, country)
            except Exception as e:
                return Response(
                    {"error": str(e)},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if order_amount != expected_total:
                return Response(
                    {"error": "Order amount does not match expected total"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            cart_items = [
                {
                    "variant_id": item.get("variant", {}).get("id"),
                    "quantity": item.get("quantity", 1),
                }
                for item in cart
            ]

            intent_params = {
                "amount": order_amount,
                "currency": "usd",
                "automatic_payment_methods": {
                    "enabled": True,
                },
                "metadata": {
                    "cart": json.dumps(cart_items),
                },
            }

            intent = stripe.PaymentIntent.create(**intent_params)

            return Response(
                {
                    "client_secret": intent.client_secret,
                }
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class SetupIntentView(APIView):
    def post(self, request):
        try:
            setup_intent_params = {
                "automatic_payment_methods": {
                    "enabled": True,
                },
            }

            setup_intent = stripe.SetupIntent.create(**setup_intent_params)
            return Response({"client_secret": setup_intent.client_secret})

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(csrf_exempt, name="dispatch")
class WebhookView(APIView):
    def post(self, request):
        payload = request.body
        sig_header = request.META["HTTP_STRIPE_SIGNATURE"]
        event = None

        try:
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)

        except ValueError as e:
            return HttpResponse(status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.SignatureVerificationError as e:
            return HttpResponse(status=status.HTTP_400_BAD_REQUEST)

        event_type = event["type"]
        event_object = event["data"]["object"]

        try:
            if event_type == "payment_intent.succeeded":
                handle_successful_payment(event_object)
            elif event_type == "payment_intent.payment_failed":
                handle_failed_payment(event_object)
            elif event_type == "payment_intent.canceled":
                handle_canceled_payment(event_object)

            return HttpResponse(status=200)
        except Exception as e:
            print(f"Error processing webhook: {str(e)}")
            return HttpResponse(status=500)


def handle_successful_payment(payment_intent):
    print(payment_intent)
    with transaction.atomic():
        order = Order.objects.filter(
            stripe_payment_intent_id=payment_intent["id"]
        ).first()

        try:
            if not order:
                shipping_details = payment_intent.get("shipping", {})
                order = Order.objects.create(
                    stripe_payment_intent_id=payment_intent["id"],
                    email=payment_intent.get("receipt_email"),
                    status="processing",
                    shipping_name=shipping_details.get("name"),
                    shipping_address_line1=shipping_details.get("address", {}).get(
                        "line1"
                    ),
                    shipping_address_line2=shipping_details.get("address", {}).get(
                        "line2"
                    ),
                    shipping_city=shipping_details.get("address", {}).get("city"),
                    shipping_state=shipping_details.get("address", {}).get("state"),
                    shipping_postal_code=shipping_details.get("address", {}).get(
                        "postal_code"
                    ),
                    shipping_country=shipping_details.get("address", {}).get("country"),
                    subtotal_cents=payment_intent["amount"],
                    total_cents=payment_intent["amount"],
                )

            order.status = "processing"
            order.paid_at = timezone.now()
            order.save()

            if payment_intent.get("metadata", {}).get("cart"):
                cart = json.loads(payment_intent["metadata"]["cart"])
                for item in cart:
                    OrderItem.objects.create(
                        order=order,
                        variant_id=item.get("variant_id"),
                        quantity=item.get("quantity"),
                    )
            try:
                pass
                # send_order_confirmation(order)
            except Exception as e:
                print(f"Failed to send order confirmation: {str(e)}")

        except Exception as e:
            raise e

        # Send confirmation email


def handle_failed_payment(payment_intent):
    order = Order.objects.filter(stripe_payment_intent_id=payment_intent["id"]).first()

    if order:
        order.status = "failed"
        order.save()


def handle_canceled_payment(payment_intent):
    order = Order.objects.filter(stripe_payment_intent_id=payment_intent["id"]).first()

    if order:
        order.status = "canceled"
        order.save()

from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.accounts.models import User
from apps.printify.views import PrintifyView, ShippingCostView

import stripe


stripe.api_key = settings.STRIPE_SECRET_KEY


class PaymentIntentView(APIView):
    def calculate_order_amount(self, cart, country):
        total_amount = 0
        for item in cart:
            product = PrintifyView.get_product_internal(item["variant"]["product_id"])

            if not product:
                raise Exception("Product not found")

            variant = next(
                (v for v in product["variants"] if v["id"] == item["variant"]["id"]),
                None,
            )

            if not variant:
                raise Exception("Variant not found")

            if not variant["is_available"]:
                raise Exception("Variant not available")

            total_amount += variant["price"] * item["quantity"]

        shipping_cost = ShippingCostView.get_shipping_cost(country)
        if shipping_cost is None:
            raise Exception("Shipping cost not found")

        return total_amount + shipping_cost["shipping_cost"]

    def post(self, request):
        try:
            cart = request.data["cart"]
            country = request.data["country"]
            expected_total = request.data["expected_total"]

            if not len(cart):
                return Response(
                    {"error": "Cart is empty"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            try:
                order_amount = self.calculate_order_amount(cart, country)
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

            intent_params = {
                "amount": order_amount,
                "currency": "usd",
            }

            if request.user.is_authenticated:
                if not request.user.stripe_customer_id:
                    customer = stripe.Customer.create(
                        email=request.user.email, metadata={"user_id": request.user.id}
                    )
                    request.user.stripe_customer_id = customer.id
                    request.user.save()

                intent_params["customer"] = request.user.stripe_customer_id
                intent_params["setup_future_usage"] = "off_session"

            intent = stripe.PaymentIntent.create(**intent_params)

            return Response({"client_secret": intent["client_secret"]})

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class SetupIntentView(APIView):
    def post(self, request):
        try:
            user_id = request.data.get("user_id")

            setup_intent_params = {
                "usage": "on_session",
                "automatic_payment_methods": {
                    "enabled": True,
                },
            }

            if user_id:
                user = User.objects.get(id=user_id)

                if not user.stripe_customer_id:
                    customer = stripe.Customer.create(
                        email=user.email, metadata={"user_id": user.id}
                    )
                    user.stripe_customer_id = customer.id
                    user.save()

                setup_intent_params["customer"] = user.stripe_customer_id

            setup_intent = stripe.SetupIntent.create(**setup_intent_params)

            return Response({"client_secret": setup_intent.client_secret})

        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

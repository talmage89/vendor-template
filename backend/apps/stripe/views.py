from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.accounts.models import User
from apps.products.models import Clothing

import stripe


stripe.api_key = settings.STRIPE_SECRET_KEY


class PaymentIntentView(APIView):
    def calculate_order_amount(self, cart):
        total_amount = 0
        for item in cart:
            clothing = Clothing.get_object(item["clothing"])
            total_amount += clothing.final_price_cents * item["quantity"]
        return total_amount

    def post(self, request):
        try:
            cart = request.data["cart"]

            if not len(cart):
                return Response(
                    {"error": "No clothing items provided"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            intent = stripe.PaymentIntent.create(
                amount=self.calculate_order_amount(cart),
                currency="usd",
            )

            return Response(
                {
                    "client_secret": intent["client_secret"],
                    # TODO: REMOVE FOR PRODUCTION
                    "dpm_checker_link": "https://dashboard.stripe.com/settings/payment_methods/review?transaction_id={}".format(
                        intent["id"]
                    ),
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

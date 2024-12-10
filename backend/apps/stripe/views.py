from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

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

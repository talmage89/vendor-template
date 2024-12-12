from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.conf import settings

from .services import ImageService

import requests


class PrintifyView(APIView):
    BASE_URL = "https://api.printify.com/v1"

    def get_headers(self):
        return {
            "Authorization": f"Bearer {settings.PRINTIFY_API_KEY}",
            "Content-Type": "application/json",
        }

    @staticmethod
    @api_view(["GET"])
    def get_shops(request):
        """Get list of shops from Printify"""
        url = f"{PrintifyView.BASE_URL}/shops.json"
        response = requests.get(url, headers=PrintifyView().get_headers())

        if response.status_code == 200:
            data = response.json()
            # If the response is a list, wrap it in a dictionary
            if isinstance(data, list):
                return Response({"shops": data})
            return Response(data)
        return Response(
            {"error": "Failed to fetch shops from Printify"},
            status=response.status_code,
        )

    @staticmethod
    @api_view(["GET"])
    def get_products(request):
        """Get list of products from Printify"""
        url = f"{PrintifyView.BASE_URL}/shops/{settings.PRINTIFY_SHOP_ID}/products.json"
        response = requests.get(url, headers=PrintifyView().get_headers())

        if response.status_code == 200:
            image_service = ImageService()
            printifyData = response.json()
            products = []

            for printifyProduct in printifyData.get("data"):
                product = {}
                product["id"] = printifyProduct.get("id")
                product["title"] = printifyProduct.get("title")
                product["description"] = printifyProduct.get("description")
                product["is_locked"] = printifyProduct.get("is_locked")
                product["is_economy_shipping_eligible"] = printifyProduct.get(
                    "is_economy_shipping_eligible"
                )
                product["is_economy_shipping_enabled"] = printifyProduct.get(
                    "is_economy_shipping_enabled"
                )
                product["is_printify_express_eligible"] = printifyProduct.get(
                    "is_printify_express_eligible"
                )
                product["is_printify_express_enabled"] = printifyProduct.get(
                    "is_printify_express_enabled"
                )
                product["is_deleted"] = printifyProduct.get("is_deleted")
                product["visible"] = printifyProduct.get("visible")

                images = []
                for image in printifyProduct.get("images", []):
                    original_url = image.get("src")
                    if original_url:
                        if "person-2" in original_url:
                            continue
                        images.append(
                            {
                                "id": image.get("id"),
                                "is_default": image.get("is_default", False),
                                "is_selected_for_publishing": image.get(
                                    "is_selected_for_publishing", False
                                ),
                                "order": image.get("order"),
                                "variant_ids": image.get("variant_ids", []),
                                "original": original_url,
                                "thumbnail": image_service.get_optimized_image_url(
                                    original_url, width=100, height=100, quality=70
                                ),
                                "medium": image_service.get_optimized_image_url(
                                    original_url, width=300, height=300, quality=80
                                ),
                                "large": image_service.get_optimized_image_url(
                                    original_url, width=600, quality=85
                                ),
                            }
                        )
                product["images"] = images

                variants = []
                for printifyVariant in printifyProduct.get("variants", []):
                    if printifyVariant.get("is_enabled"):
                        variant = {}
                        variant["id"] = printifyVariant.get("id")
                        variant["grams"] = printifyVariant.get("grams")
                        variant["sku"] = printifyVariant.get("sku")
                        variant["title"] = printifyVariant.get("title")
                        variant["price"] = printifyVariant.get("price")
                        variant["is_available"] = printifyVariant.get("is_available")
                        variant["is_default"] = printifyVariant.get("is_default")
                        variant["is_printify_express_eligible"] = printifyVariant.get(
                            "is_printify_express_eligible"
                        )
                        variants.append(variant)
                product["variants"] = variants

                products.append(product)

            printifyData["data"] = products
            return Response(printifyData)
        return Response(
            {"error": "Failed to fetch products from Printify"},
            status=response.status_code,
        )

    @staticmethod
    @api_view(["POST"])
    def calculate_shipping(request):
        """Calculate shipping costs for an order"""
        url = f"{PrintifyView.BASE_URL}/shops/{settings.PRINTIFY_SHOP_ID}/orders/shipping.json"
        response = requests.post(
            url, headers=PrintifyView().get_headers(), json=request.data
        )

        if response.status_code == 200:
            return Response(response.json())
        return Response(
            {"error": "Failed to calculate shipping costs"}, status=response.status_code
        )

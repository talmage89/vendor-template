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

    def process_product(self, printifyProduct, image_service):
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
        variant_image_count = {}
        images = []
        sorted_images = sorted(
            printifyProduct.get("images", []),
            key=lambda x: (not x.get("is_default", False)),
        )
        for index, image in enumerate(sorted_images):
            original_url = image.get("src")
            if not original_url:
                continue
            variant_ids = image.get("variant_ids", [])
            if not variant_ids:
                continue
            should_include = False
            for variant_id in variant_ids:
                if variant_id not in variant_image_count:
                    variant_image_count[variant_id] = 0
                if variant_image_count[variant_id] < 4:
                    should_include = True
                    variant_image_count[variant_id] += 1
            if should_include:
                images.append(
                    {
                        "id": index,
                        "is_default": image.get("is_default", False),
                        "is_selected_for_publishing": image.get(
                            "is_selected_for_publishing", False
                        ),
                        "order": image.get("order"),
                        "variant_ids": variant_ids,
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
                variant["options"] = printifyVariant.get("options", [])
                variants.append(variant)
        product["variants"] = variants
        options = printifyProduct.get("options", [])
        product["colors"] = [
            color
            for option in options
            if option.get("type").lower() == "color"
            for color in option.get("values", [])
            if any(color["id"] in variant["options"] for variant in product["variants"])
        ]
        for color in product["colors"]:
            color["variant_ids"] = [
                variant["id"]
                for variant in product["variants"]
                if color["id"] == variant["options"][0]
            ]
        product["sizes"] = [
            size
            for option in options
            if option.get("type").lower() == "size"
            for size in option.get("values", [])
        ]
        for size in product["sizes"]:
            size["variant_ids"] = [
                variant["id"]
                for variant in product["variants"]
                if size["id"] == variant["options"][1]
            ]
        ## testing, remove a variant_id from a size
        product["sizes"][0]["variant_ids"].remove(product["variants"][0]["id"])
        return product

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
        self = PrintifyView()

        """Get list of products from Printify"""
        url = f"{self.BASE_URL}/shops/{settings.PRINTIFY_SHOP_ID}/products.json"
        response = requests.get(url, headers=self.get_headers())

        if response.status_code == 200:
            image_service = ImageService()
            printifyData = response.json()
            products = []

            for printifyProduct in printifyData.get("data"):
                product = self.process_product(printifyProduct, image_service)

                products.append(product)

            printifyData["data"] = products
            return Response(printifyData)
        return Response(
            {"error": "Failed to fetch products from Printify"},
            status=response.status_code,
        )

    @staticmethod
    def get_product_internal(product_id):
        """Get a product from Printify - for internal use"""
        self = PrintifyView()
        url = f"{self.BASE_URL}/shops/{settings.PRINTIFY_SHOP_ID}/products/{product_id}.json"
        response = requests.get(url, headers=self.get_headers())

        if response.status_code == 200:
            image_service = ImageService()
            printify_data = response.json()
            return self.process_product(printify_data, image_service)
        return None

    @staticmethod
    @api_view(["GET"])
    def get_product(request, product_id):
        """Get a product from Printify"""
        self = PrintifyView()
        url = f"{self.BASE_URL}/shops/{settings.PRINTIFY_SHOP_ID}/products/{product_id}.json"
        response = requests.get(url, headers=self.get_headers())

        if response.status_code == 200:
            image_service = ImageService()
            printifyData = response.json()
            product = self.process_product(printifyData, image_service)
            product["original_request"] = printifyData
            return Response(product)
        return Response(
            {"error": "Failed to fetch product from Printify"},
            status=response.status_code,
        )

    @staticmethod
    @api_view(["POST"])
    def calculate_shipping(request):
        # items should be of type CartVariant

        address = request.data.get("address")
        items = request.data.get("items")

        try:
            line_items = [
                {"sku": item["variant"]["sku"], "quantity": item["quantity"]}
                for item in items
            ]
        except Exception as e:
            return Response(
                {"error": "Invalid items"}, status=status.HTTP_400_BAD_REQUEST
            )

        url = f"{PrintifyView.BASE_URL}/shops/{settings.PRINTIFY_SHOP_ID}/orders/shipping.json"
        response = requests.post(
            url,
            headers=PrintifyView().get_headers(),
            json={
                "line_items": line_items,
                "address_to": address,
            },
        )
        if response.status_code == 200:
            return Response(response.json())
        return Response(
            {"error": "Failed to calculate shipping costs"}, status=response.status_code
        )


class ShippingCostView(APIView):
    @staticmethod
    def get_shipping_cost(country):
        if not country:
            return None
        if country == "US":
            return {"shipping_cost": 595, "threshold": 5000}
        elif country == "CA":
            return {"shipping_cost": 995}
        else:
            return {"shipping_cost": 1195}

    def post(self, request):
        country = request.data.get("country")

        if not country:
            return Response(
                {"error": "Country is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        shipping_cost = self.get_shipping_cost(country)
        if shipping_cost:
            return Response(shipping_cost)
        return Response(
            {"error": "Invalid country"}, status=status.HTTP_400_BAD_REQUEST
        )

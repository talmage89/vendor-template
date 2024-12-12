from imgix import UrlBuilder
from urllib.parse import urlparse

from django.conf import settings
from typing import Optional


class ImageService:
    def __init__(self):
        self.builder = UrlBuilder(
            settings.IMGIX_CONFIG["domain"],
            sign_key=settings.IMGIX_CONFIG["sign_key"],
            use_https=True,
        )

    def get_optimized_image_url(
        self,
        original_url: str,
        width: Optional[int] = None,
        height: Optional[int] = None,
        quality: int = 75,
    ) -> str:
        try:
            parsed = urlparse(original_url)
            image_path = parsed.path
            if parsed.query:
                image_path += f"?{parsed.query}"

            if image_path.startswith("/"):
                image_path = image_path[1:]

            params = {
                "auto": "compress,format",
                "q": quality,
                "fit": "crop",
            }

            if width:
                params["w"] = width
            if height:
                params["h"] = height

            return self.builder.create_url(image_path, params)
        except Exception as e:
            print(f"Error creating Imgix URL: {e}")
            return original_url

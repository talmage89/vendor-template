from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import routers

from apps.accounts.views import UserView

router = routers.DefaultRouter()
router.register(r"users", UserView, basename="users")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/payments/", include("apps.stripe.urls")),
    path("api/fulfillment/", include("apps.printify.urls")),
    path("api/", include(router.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

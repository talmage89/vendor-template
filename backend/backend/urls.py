from django.contrib import admin
from django.urls import path, include
from rest_framework import routers

from apps.accounts.views import UserView

router = routers.DefaultRouter()
router.register(r"users", UserView, basename="users")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/", include(router.urls)),
]

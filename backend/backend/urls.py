from django.contrib import admin
from django.urls import path, include
from rest_framework import routers

from apps.accounts.views import CookieTokenObtainPairView, CookieRefreshTokenView, UserView

router = routers.DefaultRouter()
router.register(r"users", UserView, basename="users")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/token/", CookieTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", CookieRefreshTokenView.as_view(), name="token_refresh"),
    path("api/", include(router.urls)),
]

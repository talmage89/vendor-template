from django.contrib import admin
from django.urls import path, include
from rest_framework import routers

from apps.accounts.views import (
    CookieTokenObtainPairView,
    CookieRefreshTokenView,
    UserView,
    LogoutView,
    MeView,
)

router = routers.DefaultRouter()
router.register(r"users", UserView, basename="users")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/token/", CookieTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", CookieRefreshTokenView.as_view(), name="token_refresh"),
    path("api/logout/", LogoutView.as_view(), name="logout"),
    path("api/me/", MeView.as_view(), name="me"),
    path("api/", include(router.urls)),
]

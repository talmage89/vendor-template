from django.urls import path

from .views import (
    CookieRefreshTokenView,
    CookieTokenObtainPairView,
    LogoutView,
    MeView,
    RequestPasswordResetView,
    ResetPasswordView,
    SignupView,
    VerifyEmailView,
)

urlpatterns = [
    path("me/", MeView.as_view(), name="me"),
    path("login/", CookieTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token-refresh/", CookieRefreshTokenView.as_view(), name="token_refresh"),
    path("verify-email/", VerifyEmailView.as_view(), name="verify_email"),
    path("signup/", SignupView.as_view(), name="signup"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path(
        "request-password-reset/",
        RequestPasswordResetView.as_view(),
        name="request-password-reset",
    ),
    path("reset-password/", ResetPasswordView.as_view(), name="reset-password"),
]

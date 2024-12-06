import time
from datetime import timedelta
from django.conf import settings
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.contrib.auth import authenticate
from django.utils import timezone
from django.utils.crypto import get_random_string
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken, TokenError

from .emails import EmailManager
from .models import User
from .permissions import IsOwnerOrStaff
from .serializers import UserSerializer


def is_token_valid(token_created_at, hours=24):
    if not token_created_at:
        return False
    return token_created_at + timedelta(hours=hours) > timezone.now()


def ensure_minimum_response_time(start_time, min_time=1000):
    """Ensure the response takes at least min_time milliseconds"""
    elapsed = (time.time() - start_time) * 1000
    if elapsed < min_time:
        time.sleep((min_time - elapsed) / 1000)


class CookieTokenObtainPairView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(request, username=username, password=password)

        if user:
            if not user.is_email_verified:
                return Response(
                    {
                        "error": "Email not verified. Please check your email for a verification link."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            refresh = RefreshToken.for_user(user)
            response = Response({"message": "Login successful"})
            cookie_settings = {
                "httponly": True,
                "secure": not settings.DEBUG,
                "samesite": "Lax",
                "domain": settings.SESSION_COOKIE_DOMAIN,
                "path": "/",
            }
            response.set_cookie(
                key="access_token",
                value=str(refresh.access_token),
                max_age=int(
                    settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()
                ),
                **cookie_settings,
            )
            response.set_cookie(
                key="refresh_token",
                value=str(refresh),
                max_age=int(
                    settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()
                ),
                **cookie_settings,
            )
            return response
        return Response({"error": "Invalid credentials"}, status=400)


class CookieRefreshTokenView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")
        if not refresh_token:
            return Response({"error": "No refresh token found"}, status=401)

        try:
            refresh = RefreshToken(refresh_token)
            response = Response({"message": "Token refreshed"})
            cookie_settings = {
                "httponly": True,
                "secure": not settings.DEBUG,
                "samesite": "Lax",
                "domain": settings.SESSION_COOKIE_DOMAIN,
                "path": "/",
            }
            response.set_cookie(
                key="access_token",
                value=str(refresh.access_token),
                max_age=int(
                    settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()
                ),
                **cookie_settings,
            )

            if getattr(settings, "SIMPLE_JWT", {}).get("ROTATE_REFRESH_TOKENS", False):
                response.set_cookie(
                    key="refresh_token",
                    value=str(refresh),
                    max_age=int(
                        settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()
                    ),
                    **cookie_settings,
                )

            return response
        except Exception as e:
            return Response({"error": "Invalid or expired refresh token"}, status=401)


def clear_auth_cookies(response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return response


class LogoutView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")
        response = Response({"message": "Logged out successfully"})
        response = clear_auth_cookies(response)

        if refresh_token:
            try:
                refresh = RefreshToken(refresh_token)
                refresh.blacklist()
            except Exception:
                response.data = {"message": "Logged out client-side only"}

        return response


class MeView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        access_token = request.COOKIES.get("access_token")
        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:
            return Response(
                {"error": "No tokens provided", "code": "tokens_missing"},
                status=401,
            )
        if not access_token:
            return Response({"error": "No access token provided"}, status=401)
        try:
            token = AccessToken(access_token)
            user = User.objects.get(id=token.payload.get("user_id"))
            serializer = UserSerializer(user)
            return Response(serializer.data)
        except TokenError:
            return Response({"error": "Invalid or expired access token"}, status=401)
        except User.DoesNotExist:
            response = Response({"error": "User not found"}, status=404)
            response = clear_auth_cookies(response)
            return response


class UserView(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrStaff]

    def get_queryset(self):
        if not self.request.user.is_staff:
            return User.objects.filter(id=self.request.user.id)
        return User.objects.all()


class SignupView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        start_time = time.time()

        serializer = UserSerializer(data=request.data)

        try:
            if not serializer.is_valid():
                if "_duplicate_email" in serializer.errors:
                    try:
                        existing_user = User.objects.get(
                            email__iexact=serializer.initial_data["email"]
                        )
                        if not existing_user.is_email_verified:
                            if not is_token_valid(
                                existing_user.email_verification_token_created_at,
                                hours=20,
                            ):
                                existing_user.email_verification_token = (
                                    get_random_string(64)
                                )
                                existing_user.email_verification_token_created_at = (
                                    timezone.now()
                                )
                                existing_user.save()
                            EmailManager.send_verification_email(existing_user)
                        else:
                            if not is_token_valid(
                                existing_user.password_reset_token_created_at
                            ):
                                existing_user.password_reset_token = get_random_string(
                                    64
                                )
                                existing_user.password_reset_token_created_at = (
                                    timezone.now()
                                )
                                existing_user.save()
                            EmailManager.send_account_exists_email(existing_user)
                    except Exception as e:
                        # logger.error(f"Error handling existing user: {str(e)}")
                        pass

                    ensure_minimum_response_time(start_time)
                    return Response(
                        {"message": "Please check your email to verify your account"},
                        status=status.HTTP_201_CREATED,
                    )

                # not duplicate email error
                ensure_minimum_response_time(start_time)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            user = serializer.save()
            user.email_verification_token = get_random_string(64)
            user.email_verification_token_created_at = timezone.now()
            user.save()

            EmailManager.send_verification_email(user)

            ensure_minimum_response_time(start_time)
            return Response(
                {"message": "Please check your email to verify your account"},
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            # logger.error(f"Error in signup: {str(e)}")
            ensure_minimum_response_time(start_time)
            return Response(
                {"message": "An error occurred during signup. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        token = request.data.get("token")

        try:
            user = User.objects.get(
                email_verification_token=token, is_email_verified=False
            )

            if not is_token_valid(user.email_verification_token_created_at):
                return Response(
                    {"error": "Verification link has expired"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user.is_email_verified = True
            user.email_verification_token = None
            user.email_verification_token_created_at = None
            user.save()

            return Response({"message": "Email successfully verified"})

        except User.DoesNotExist:
            return Response(
                {"error": "Invalid verification token"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class RequestPasswordResetView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def throttled(self, request, wait):
        return Response(
            {
                "message": "Please wait before requesting another reset link",
                "seconds_remaining": int(wait),
            },
            status=status.HTTP_429_TOO_MANY_REQUESTS,
        )

    def post(self, request):
        start_time = time.time()
        email = request.data.get("email").lower().strip()

        try:
            validate_email(email)
        except ValidationError:
            ensure_minimum_response_time(start_time)
            return Response(
                {"error": "Please enter a valid email address"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email__iexact=email)

            if user.password_reset_token_created_at:
                time_since_last_request = (
                    timezone.now() - user.password_reset_token_created_at
                )
                min_time_between_requests = timedelta(minutes=5)

                if time_since_last_request < min_time_between_requests:
                    time_remaining = min_time_between_requests - time_since_last_request
                    seconds_remaining = int(time_remaining.total_seconds())

                    ensure_minimum_response_time(start_time)
                    return self.throttled(request, seconds_remaining)

            user.password_reset_token = get_random_string(64)
            user.password_reset_token_created_at = timezone.now()
            user.save()

            EmailManager.send_password_reset_email(user)
        except User.DoesNotExist:
            pass
        except Exception as e:
            # logger.error(f"Error in password reset request: {str(e)}")
            pass

        ensure_minimum_response_time(start_time)
        return Response(
            {
                "message": "If an account exists with this email, you will receive password reset instructions."
            }
        )


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        token = request.data.get("token")
        password1 = request.data.get("password1")
        password2 = request.data.get("password2")

        if not token or not password1 or not password2:
            return Response(
                {"error": "Token and password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(password_reset_token=token)

            if not is_token_valid(user.password_reset_token_created_at):
                return Response(
                    {"error": "Reset token has expired"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            serializer = UserSerializer(
                data={"password1": password1, "password2": password2}, partial=True
            )

            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(serializer.validated_data["password"])
            user.password_reset_token = None
            user.password_reset_token_created_at = None
            user.save()

            return Response({"message": "Password successfully reset"})

        except User.DoesNotExist:
            return Response(
                {"error": "Invalid reset token"}, status=status.HTTP_400_BAD_REQUEST
            )


# TODO: testing
# TODO: rate limiting
# TODO: email notifications on password reset
# TODO: invalidate all tokens when password is changed
# TODO:
# TODO:
# TODO:
# TODO:
# TODO:
# TODO:
# TODO:
# TODO:
# TODO:
# TODO:
# TODO:

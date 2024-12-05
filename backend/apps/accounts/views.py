from django.conf import settings
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken, TokenError

from .models import User
from .serializers import UserSerializer


class CookieTokenObtainPairView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(request, username=username, password=password)

        if user:
            refresh = RefreshToken.for_user(user)
            response = Response({"message": "Login successful"})
            response.set_cookie(
                key="access_token",
                value=str(refresh.access_token),
                httponly=True,
                # TODO: DON'T USE THIS IN PRODUCTION
                secure=True,
                samesite="None",
            )
            response.set_cookie(
                key="refresh_token",
                value=str(refresh),
                httponly=True,
                # TODO: DON'T USE THIS IN PRODUCTION
                secure=True,
                samesite="None",
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
            response.set_cookie(
                key="access_token",
                value=str(refresh.access_token),
                httponly=True,
                secure=True,
                samesite="None",
            )

            if getattr(settings, "SIMPLE_JWT", {}).get("ROTATE_REFRESH_TOKENS", False):
                response.set_cookie(
                    key="refresh_token",
                    value=str(refresh),
                    httponly=True,
                    secure=True,
                    samesite="None",
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
        if not access_token:
            return Response(
                {"error": "No access token provided", "code": "token_missing"},
                status=401,
            )

        try:
            token = AccessToken(access_token)
            user = User.objects.get(id=token.payload["user_id"])
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
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.is_staff:
            return User.objects.filter(id=self.request.user.id)
        return User.objects.all()

    def update(self, request, *args, **kwargs):
        if not self.request.user.is_staff and kwargs["pk"] != str(self.request.user.id):
            return Response(
                {"error": "You cannot update other users' information."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if not self.request.user.is_staff and kwargs["pk"] != str(self.request.user.id):
            return Response(
                {"error": "You cannot update other users' information."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().partial_update(request, *args, **kwargs)

from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken

from .models import User
from .serializers import UserSerializer


class CookieTokenObtainPairView(APIView):
    def post(self, request):
        password1 = request.data.get("password1")
        password2 = request.data.get("password2")

        if password1 != password2:
            return Response({"error": "Passwords do not match"}, status=400)

        username = request.data.get("username")
        user = authenticate(request, username=username, password=password1)

        if user:
            refresh = RefreshToken.for_user(user)
            response = Response({"message": "Login successful"})
            response.set_cookie(
                key="access_token",
                value=str(refresh.access_token),
                httponly=True,
                secure=False,
                samesite="None",
            )
            response.set_cookie(
                key="refresh_token",
                value=str(refresh),
                httponly=True,
                secure=False,
                samesite="None",
            )
            return response
        return Response({"error": "Invalid credentials"}, status=400)


class CookieRefreshTokenView(APIView):
    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")
        if not refresh_token:
            return Response({"error": "No refresh token found"}, status=401)

        try:
            refresh = RefreshToken(refresh_token)

            BlacklistedToken.objects.create(token=refresh)

            new_access_token = refresh.access_token
            response = Response({"message": "Token refreshed"})
            response.set_cookie(
                key="access_token",
                value=str(new_access_token),
                httponly=True,
                secure=False,
                samesite="None",
            )
            return response
        except Exception as e:
            return Response({"error": "Invalid or expired refresh token"}, status=401)


class UserView(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.is_staff:
            return User.objects.filter(id=self.request.user.id)
        return User.objects.all()

    @action(detail=False, methods=["get"])
    def me(self, request):
        return Response(UserSerializer(request.user).data)

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

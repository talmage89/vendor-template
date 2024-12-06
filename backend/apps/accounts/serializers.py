from rest_framework import serializers
from django.db import transaction

from .models import User


class UserSerializer(serializers.ModelSerializer):
    password1 = serializers.CharField(write_only=True, style={"input_type": "password"})
    password2 = serializers.CharField(write_only=True, style={"input_type": "password"})

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "password1", "password2"]
        extra_kwargs = {
            "email": {
                "required": True,
                "validators": [],
            }
        }

    def validate(self, data):
        if data["password1"] != data["password2"]:
            raise serializers.ValidationError("Passwords do not match.")

        email = data.get("email", "").lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError(
                {
                    "_duplicate_email": True,
                    "message": "Please check your email to verify your account",
                }
            )

        data["password"] = data.pop("password1")
        data.pop("password2")

        return data

    def validate_password1(self, value):
        if len(value) < 8:
            raise serializers.ValidationError(
                "Password must be at least 8 characters long."
            )
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError(
                "Password must contain at least one number."
            )
        if not any(char.isupper() for char in value):
            raise serializers.ValidationError(
                "Password must contain at least one uppercase letter."
            )
        return value

    @transaction.atomic
    def create(self, validated_data):
        try:
            return User.objects.create_user(**validated_data)
        except Exception as e:
            return None

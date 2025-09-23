# users/serializers_auth.py
from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class LoginSerializer(TokenObtainPairSerializer):
    # Permitimos "username" (username o email)
    username_field = User.USERNAME_FIELD  # sigue siendo "username", pero usaremos username

    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")

        # Buscar por username o email (case-insensitive para email)
        try:
            user = User.objects.get(Q(username=username) | Q(email__iexact=username))
        except User.DoesNotExist:
            raise serializers.ValidationError({"detail": "Credenciales inválidas."})

        if not user.check_password(password):
            raise serializers.ValidationError({"detail": "Credenciales inválidas."})

        if not user.is_active:
            raise serializers.ValidationError({"detail": "Usuario inactivo."})

        # Reutilizamos la lógica de TokenObtainPairSerializer
        data = {}
        refresh = self.get_token(user)

        # payload estándar
        data["refresh"] = str(refresh)
        data["access"] = str(refresh.access_token)

        # payload de usuario para el frontend
        data["user"] = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "es_cliente": hasattr(user, "cliente"),
            "es_cuidador": hasattr(user, "cuidador"),
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
        }

        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # claims útiles para el frontend (no pongas datos sensibles)
        token["username"] = user.username
        token["email"] = user.email
        token["es_cliente"] = hasattr(user, "cliente")
        token["es_cuidador"] = hasattr(user, "cuidador")
        token["is_staff"] = user.is_staff
        token["is_superuser"] = user.is_superuser
        return token

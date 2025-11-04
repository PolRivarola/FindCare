from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenViewBase, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils import timezone
from django.conf import settings
from django.core.mail import send_mail
from django.urls import reverse
from .serializers_auth import LoginSerializer, PasswordRecoveryRequestSerializer, PasswordResetConfirmSerializer
import secrets
from datetime import timedelta

User = get_user_model()

class LoginView(TokenViewBase):
    """
    POST /api/auth/login/
    Body: { "identifier": "<email|username>", "password": "<password>" }
    Respuesta: { "access", "refresh", "user": {...} }
    """
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer


class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Body: { "refresh": "<refresh_token>" }
    Invalida el refresh token (blacklist).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh = request.data.get("refresh")
        if not refresh:
            return Response({"detail": "Falta refresh token."}, status=400)
        try:
            token = RefreshToken(refresh)
            token.blacklist()
        except Exception:
            return Response({"detail": "Refresh token inválido."}, status=400)
        return Response({"detail": "Logout ok."}, status=205)


class PasswordRecoveryRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordRecoveryRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        try:
            user = User.objects.get(email__iexact=email, is_active=True)
        except User.DoesNotExist:
            return Response({"detail": "Si el email existe, se enviará un enlace de recuperación."}, status=200)

        token = secrets.token_urlsafe(32)
        expires_at = timezone.now() + timedelta(hours=24)

        user.password_reset_token = token
        user.password_reset_token_expires = expires_at
        user.save(update_fields=['password_reset_token', 'password_reset_token_expires'])

        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        reset_url = f"{frontend_url}/reset-password?token={token}&email={email}"

        subject = "Recuperar tu contraseña - FindCare"
        message = f"""
Hola {user.first_name or user.username},

Has solicitado restablecer tu contraseña en FindCare.

Haz clic en el siguiente enlace para crear una nueva contraseña:
{reset_url}

Este enlace expirará en 24 horas.

Si no solicitaste este cambio, puedes ignorar este email de forma segura.

Atentamente,
El equipo de FindCare
"""
        try:
            send_mail(
                subject,
                message,
                getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@findcare.com'),
                [email],
                fail_silently=False,
            )
            print(f"\n{'='*60}")
            print(f"EMAIL DE RECUPERACIÓN ENVIADO (DEBUG):")
            print(f"Para: {email}")
            print(f"Token: {token}")
            print(f"Enlace: {reset_url}")
            print(f"{'='*60}\n")
        except Exception as e:
            print(f"Error sending email: {e}")
            return Response({"detail": f"Error al enviar el email: {str(e)}"}, status=500)

        return Response({"detail": "Si el email existe, se enviará un enlace de recuperación."}, status=200)


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token = serializer.validated_data["token"]
        email = serializer.validated_data["email"]
        new_password = serializer.validated_data["new_password"]

        try:
            user = User.objects.get(email__iexact=email, is_active=True)
        except User.DoesNotExist:
            return Response({"detail": "Usuario no encontrado."}, status=400)

        if not user.password_reset_token:
            return Response({"detail": "Token de recuperación no válido."}, status=400)

        if user.password_reset_token != token:
            return Response({"detail": "Token de recuperación no válido."}, status=400)

        if not user.password_reset_token_expires or user.password_reset_token_expires < timezone.now():
            return Response({"detail": "El token ha expirado. Solicita uno nuevo."}, status=400)

        user.set_password(new_password)
        user.password_reset_token = None
        user.password_reset_token_expires = None
        user.save()

        return Response({"detail": "Contraseña restablecida exitosamente."}, status=200)

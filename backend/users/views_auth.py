from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenViewBase, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers_auth import LoginSerializer

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

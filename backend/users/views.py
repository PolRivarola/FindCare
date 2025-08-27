from rest_framework import viewsets
from users.models import Usuario, Cliente, Cuidador, TipoCliente
from rest_framework.generics import CreateAPIView
from users.serializers import RegistroClienteSerializer, RegistroCuidadorSerializer
from users.serializers import (
    UsuarioReadSerializer,
    ClienteSerializer,
    CuidadorSerializer,
    TipoClienteSerializer
)
from rest_framework.permissions import IsAuthenticated, AllowAny

from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import RetrieveUpdateAPIView
from django.contrib.auth import get_user_model
from .serializers import UsuarioReadSerializer  # el que ya usás

User = get_user_model()

class MeView(RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UsuarioReadSerializer

    def get_object(self):
        return self.request.user

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioReadSerializer
    permission_classes = [IsAuthenticated]

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [IsAuthenticated]

class CuidadorViewSet(viewsets.ModelViewSet):
    queryset = Cuidador.objects.all()
    serializer_class = CuidadorSerializer
    permission_classes = [IsAuthenticated]

class TipoClienteViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TipoCliente.objects.all()
    serializer_class = TipoClienteSerializer


class RegistroClienteView(CreateAPIView):
    queryset = Cliente.objects.all()
    serializer_class = RegistroClienteSerializer
    permission_classes = [AllowAny] # Permite registro sin autenticación

class RegistroCuidadorView(CreateAPIView):
    queryset = Cuidador.objects.all()
    serializer_class = RegistroCuidadorSerializer
    permission_classes = [AllowAny] 


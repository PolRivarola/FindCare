from rest_framework import viewsets
from users.models import Usuario, Cliente, Cuidador, TipoCliente
from rest_framework.generics import CreateAPIView
from users.serializers import RegistroClienteSerializer, RegistroCuidadorSerializer
from users.serializers import (
    UsuarioSerializer,
    ClienteSerializer,
    CuidadorSerializer,
    TipoClienteSerializer
)

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer

class CuidadorViewSet(viewsets.ModelViewSet):
    queryset = Cuidador.objects.all()
    serializer_class = CuidadorSerializer

class TipoClienteViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TipoCliente.objects.all()
    serializer_class = TipoClienteSerializer


class RegistroClienteView(CreateAPIView):
    queryset = Cliente.objects.all()
    serializer_class = RegistroClienteSerializer

class RegistroCuidadorView(CreateAPIView):
    queryset = Cuidador.objects.all()
    serializer_class = RegistroCuidadorSerializer
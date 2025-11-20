from rest_framework import viewsets
from users.models import Usuario, Cliente, Cuidador, TipoCliente
from rest_framework.generics import CreateAPIView, ListAPIView
from users.serializers import RegistroClienteSerializer, RegistroCuidadorSerializer
from users.serializers import (
    UsuarioReadSerializer,
    ClienteSerializer,
    CuidadorSerializer,
    TipoClienteSerializer
)
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db.models import Q, Avg, Count
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from location.models import Provincia, Ciudad
from rest_framework.generics import RetrieveUpdateAPIView
from django.contrib.auth import get_user_model
from services.models import Calificacion

from .pagination import CuidadorPagination

User = get_user_model()

class MeView(RetrieveUpdateAPIView):
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
    permission_classes = [AllowAny]

    queryset = TipoCliente.objects.all()
    serializer_class = TipoClienteSerializer


class RegistroClienteView(CreateAPIView):
    queryset = Cliente.objects.all()
    serializer_class = RegistroClienteSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cliente = serializer.save()
        return Response(
            {"detail": "Cliente registrado exitosamente", "username": cliente.usuario.username},
            status=201
        )

class RegistroCuidadorView(CreateAPIView):
    queryset = Cuidador.objects.all()
    serializer_class = RegistroCuidadorSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cuidador = serializer.save()
        return Response(
            {"detail": "Cuidador registrado exitosamente", "username": cuidador.usuario.username},
            status=201
        ) 


class CuidadorSearchView(ListAPIView):
    """
    Search and filter cuidadores with location, experience, and specialty filters
    """
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['usuario__first_name', 'usuario__last_name', 'usuario__descripcion']
    ordering_fields = ['anios_experiencia', 'usuario__first_name']
    ordering = ['-anios_experiencia']
    pagination_class = CuidadorPagination

    def get_queryset(self):
        queryset = Cuidador.objects.select_related('usuario', 'usuario__direccion', 'usuario__direccion__ciudad', 'usuario__direccion__ciudad__provincia').prefetch_related('tipos_cliente')
        
        provincia_id = self.request.query_params.get('provincia')
        if provincia_id:
            queryset = queryset.filter(usuario__direccion__ciudad__provincia__id=provincia_id)
        
        ciudad_id = self.request.query_params.get('ciudad')
        if ciudad_id:
            queryset = queryset.filter(usuario__direccion__ciudad__id=ciudad_id)
        
        min_experiencia = self.request.query_params.get('min_experiencia')
        if min_experiencia:
            try:
                queryset = queryset.filter(anios_experiencia__gte=int(min_experiencia))
            except ValueError:
                pass
        
        especialidad_ids = self.request.query_params.getlist('especialidad')
        if especialidad_ids:
            queryset = queryset.filter(tipos_cliente__id__in=especialidad_ids).distinct()
        
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)

        def serialize(cuidadores):
            data = []
            for cuidador in cuidadores:
                ratings = Calificacion.objects.filter(receptor=cuidador.usuario)
                avg_rating = ratings.aggregate(avg_rating=Avg('puntuacion'))['avg_rating'] or 0
                review_count = ratings.count()

                provincia = ""
                ciudad = ""
                if cuidador.usuario.direccion and cuidador.usuario.direccion.ciudad:
                    ciudad = cuidador.usuario.direccion.ciudad.nombre
                    if cuidador.usuario.direccion.ciudad.provincia:
                        provincia = cuidador.usuario.direccion.ciudad.provincia.nombre

                especialidades = [tc.nombre for tc in cuidador.tipos_cliente.all()]

                data.append({
                    'id': cuidador.usuario.id,
                    'cuidador_id': cuidador.id,
                    'nombre': f"{cuidador.usuario.first_name} {cuidador.usuario.last_name}".strip() or cuidador.usuario.username,
                    'username': cuidador.usuario.username,
                    'especialidad': especialidades,
                    'experiencia': cuidador.anios_experiencia,
                    'provincia': provincia,
                    'ciudad': ciudad,
                    'rating': round(avg_rating, 1),
                    'reviews': review_count,
                    'descripcion': cuidador.usuario.descripcion or "",
                    'foto_perfil': request.build_absolute_uri(cuidador.usuario.foto_perfil.url) if cuidador.usuario.foto_perfil else None,
                    'telefono': cuidador.usuario.telefono or "",
                    'email': cuidador.usuario.email,
                })
            return data

        if page is not None:
            serialized = serialize(page)
            return self.get_paginated_response(serialized)

        serialized = serialize(queryset)
        return Response(serialized)


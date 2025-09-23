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
    permission_classes = [AllowAny] # Permite registro sin autenticación

class RegistroCuidadorView(CreateAPIView):
    queryset = Cuidador.objects.all()
    serializer_class = RegistroCuidadorSerializer
    permission_classes = [AllowAny] 


class CuidadorSearchView(ListAPIView):
    """
    Search and filter cuidadores with location, experience, and specialty filters
    """
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['usuario__first_name', 'usuario__last_name', 'usuario__descripcion']
    ordering_fields = ['anios_experiencia', 'usuario__first_name']
    ordering = ['-anios_experiencia']

    def get_queryset(self):
        queryset = Cuidador.objects.select_related('usuario', 'usuario__direccion', 'usuario__direccion__ciudad', 'usuario__direccion__ciudad__provincia').prefetch_related('tipos_cliente')
        
        # Filter by provincia
        provincia_id = self.request.query_params.get('provincia')
        if provincia_id:
            queryset = queryset.filter(usuario__direccion__ciudad__provincia__id=provincia_id)
        
        # Filter by ciudad
        ciudad_id = self.request.query_params.get('ciudad')
        if ciudad_id:
            queryset = queryset.filter(usuario__direccion__ciudad__id=ciudad_id)
        
        # Filter by minimum experience
        min_experiencia = self.request.query_params.get('min_experiencia')
        if min_experiencia:
            try:
                queryset = queryset.filter(anios_experiencia__gte=int(min_experiencia))
            except ValueError:
                pass
        
        # Filter by specialty (tipos_cliente)
        especialidad_ids = self.request.query_params.getlist('especialidad')
        if especialidad_ids:
            queryset = queryset.filter(tipos_cliente__id__in=especialidad_ids).distinct()
        
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        # Calculate ratings for each cuidador
        cuidadores_data = []
        for cuidador in queryset:
            # Get average rating from calificaciones
            from services.models import Calificacion
            ratings = Calificacion.objects.filter(receptor=cuidador.usuario)
            avg_rating = ratings.aggregate(avg_rating=Avg('puntuacion'))['avg_rating'] or 0
            review_count = ratings.count()
            
            # Get location info
            provincia = ""
            ciudad = ""
            if cuidador.usuario.direccion and cuidador.usuario.direccion.ciudad:
                ciudad = cuidador.usuario.direccion.ciudad.nombre
                if cuidador.usuario.direccion.ciudad.provincia:
                    provincia = cuidador.usuario.direccion.ciudad.provincia.nombre
            
            # Get specialties
            especialidades = [tc.nombre for tc in cuidador.tipos_cliente.all()]
            
            cuidadores_data.append({
                'id': cuidador.usuario.id,  # Use user ID for profile links
                'cuidador_id': cuidador.id,  # Keep cuidador ID for reference
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
        
        return Response(cuidadores_data)


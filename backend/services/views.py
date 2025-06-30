from rest_framework import viewsets
from .models import Servicio, Clasificacion, Experiencia, Certificacion, DiaSemanal, HorarioDiario
from .serializers import (
    ServicioSerializer,
    ClasificacionSerializer,
    ExperienciaSerializer,
    CertificacionSerializer,
    DiaSemanalSerializer,
    HorarioDiarioSerializer
)

class ServicioViewSet(viewsets.ModelViewSet):
    queryset = Servicio.objects.all()
    serializer_class = ServicioSerializer

class ClasificacionViewSet(viewsets.ModelViewSet):
    queryset = Clasificacion.objects.all()
    serializer_class = ClasificacionSerializer

class ExperienciaViewSet(viewsets.ModelViewSet):
    queryset = Experiencia.objects.all()
    serializer_class = ExperienciaSerializer

class CertificacionViewSet(viewsets.ModelViewSet):
    queryset = Certificacion.objects.all()
    serializer_class = CertificacionSerializer

class DiaSemanalViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DiaSemanal.objects.all()
    serializer_class = DiaSemanalSerializer

class HorarioDiarioViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = HorarioDiario.objects.all()
    serializer_class = HorarioDiarioSerializer

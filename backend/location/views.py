# views.py
from rest_framework import viewsets
from rest_framework.response import Response
from .models import Provincia, Ciudad, Direccion
from .serializers import ProvinciaSerializer, CiudadSerializer, DireccionSerializer

class ProvinciaViewSet(viewsets.ModelViewSet):
    queryset = Provincia.objects.all().order_by('nombre')
    serializer_class = ProvinciaSerializer

class CiudadViewSet(viewsets.ModelViewSet):
    serializer_class = CiudadSerializer
    queryset = Ciudad.objects.select_related('provincia').all().order_by('nombre')
    def get_queryset(self):
        qs = Ciudad.objects.select_related('provincia').all().order_by('nombre')
        prov_id = self.request.query_params.get('provincia')
        if prov_id:
            qs = qs.filter(provincia__id=prov_id)
            print(f"Filtrando ciudades por provincia {prov_id}, quedan {qs.first().nombre}")
        return qs

class DireccionViewSet(viewsets.ModelViewSet):
    queryset = Direccion.objects.all()
    serializer_class = DireccionSerializer

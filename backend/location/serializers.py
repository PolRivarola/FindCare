from rest_framework import serializers
from .models import Provincia, Ciudad, Direccion

class ProvinciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Provincia
        fields = ['id', 'nombre']

class CiudadSerializer(serializers.ModelSerializer):
    provincia = ProvinciaSerializer(read_only=True)
    provincia_id = serializers.PrimaryKeyRelatedField(
        queryset=Provincia.objects.all(), source='provincia', write_only=True
    )

    class Meta:
        model = Ciudad
        fields = ['id', 'nombre', 'provincia', 'provincia_id']

class DireccionSerializer(serializers.ModelSerializer):
    ciudad = CiudadSerializer(read_only=True)
    ciudad_id = serializers.PrimaryKeyRelatedField(
        queryset=Ciudad.objects.all(), source='ciudad', write_only=True
    )

    class Meta:
        model = Direccion
        fields = ['id', 'direccion', 'ciudad', 'ciudad_id']

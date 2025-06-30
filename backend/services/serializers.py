from rest_framework import serializers
from .models import Servicio, Clasificacion, Experiencia, Certificacion, DiaSemanal, HorarioDiario
from django.contrib.auth import get_user_model

Usuario = get_user_model()

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'nombre', 'apellido', 'email']

class DiaSemanalSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiaSemanal
        fields = ['id', 'nombre']

class HorarioDiarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = HorarioDiario
        fields = ['id', 'nombre']

class ServicioSerializer(serializers.ModelSerializer):
    cliente = UsuarioSerializer(read_only=True)
    receptor = UsuarioSerializer(read_only=True)
    dias_semanales = DiaSemanalSerializer(many=True, read_only=True)

    class Meta:
        model = Servicio
        fields = [
            'id', 'cliente', 'receptor',
            'fecha_inicio', 'fecha_fin',
            'descripcion', 'horas_dia',
            'dias_semanales',
        ]
        read_only_fields = ['id']

class ClasificacionSerializer(serializers.ModelSerializer):
    usuario = UsuarioSerializer(read_only=True)

    class Meta:
        model = Clasificacion
        fields = ['id', 'usuario', 'comentario', 'fecha', 'puntuacion']
        read_only_fields = ['id', 'fecha']

class ExperienciaSerializer(serializers.ModelSerializer):
    cuidador = UsuarioSerializer(read_only=True)

    class Meta:
        model = Experiencia
        fields = ['id', 'cuidador', 'descripcion', 'fecha_inicio', 'fecha_fin']
        read_only_fields = ['id']

class CertificacionSerializer(serializers.ModelSerializer):
    cuidador = UsuarioSerializer(read_only=True)

    class Meta:
        model = Certificacion
        fields = ['id', 'cuidador', 'nombre', 'archivo']
        read_only_fields = ['id']

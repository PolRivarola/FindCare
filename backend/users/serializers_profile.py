# users/serializers_profile.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from services.models import Calificacion, Experiencia, Certificacion
from location.models import Direccion
from django.db.models import Avg, Count

User = get_user_model()


class MiniUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name", "email")


class CertificacionReadSerializer(serializers.ModelSerializer):
    file = serializers.SerializerMethodField()
    name = serializers.CharField(source="nombre")  

    class Meta:
        model = Certificacion
        fields = ("file", "name")

    def get_file(self, obj):
        return obj.archivo.url if obj.archivo else None


class ExperienciaReadSerializer(serializers.ModelSerializer):
    fecha_inicio = serializers.DateTimeField()
    fecha_fin = serializers.DateTimeField()

    class Meta:
        model = Experiencia
        fields = ("descripcion", "fecha_inicio", "fecha_fin")


class ReviewSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    rating = serializers.IntegerField(source="puntuacion")
    author = serializers.CharField()
    date = serializers.CharField()
    comment = serializers.CharField(allow_null=True, allow_blank=True)


class PerfilPublicoSerializer(serializers.Serializer):
    # Usuario base
    id = serializers.IntegerField()
    username = serializers.CharField()
    first_name = serializers.CharField(allow_blank=True, required=False)
    last_name = serializers.CharField(allow_blank=True, required=False)
    email = serializers.EmailField()
    telefono = serializers.CharField(allow_blank=True, required=False)
    direccion = serializers.CharField(allow_blank=True, required=False)
    fecha_nacimiento = serializers.DateField(allow_null=True, required=False)
    descripcion = serializers.CharField(allow_blank=True, required=False)
    foto_perfil = serializers.SerializerMethodField()

    # ubicación plana
    provincia = serializers.CharField(allow_blank=True, required=False)
    ciudad = serializers.CharField(allow_blank=True, required=False)

    # “categorías” (TipoCliente nombres) según rol
    categorias = serializers.ListField(child=serializers.CharField(), default=list)

    # info de cuidador (opcionales)
    experiencia = serializers.IntegerField(required=False, default=None)  # años (si querés computarlo)
    especialidad = serializers.CharField(required=False, allow_blank=True)
    precio = serializers.IntegerField(required=False)
    disponible = serializers.BooleanField(required=False)

    # rating + reviews
    rating = serializers.FloatField(allow_null=True)
    reviews = ReviewSerializer(many=True, required=False)

    tipo_usuario = serializers.ChoiceField(choices=["cliente", "cuidador"])

    certificados = CertificacionReadSerializer(many=True, required=False)
    experiencias = ExperienciaReadSerializer(many=True, required=False)

    def get_foto_perfil(self, obj):
        u = obj["user"]
        return u.foto_perfil.url if getattr(u, "foto_perfil", None) else ""

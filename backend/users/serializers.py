from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from users.models import Usuario, TipoCliente, Cliente, FotoCliente, Cuidador
from location.models import Direccion
from location.serializers import DireccionSerializer
# Nota: ya no importamos DiaSemanal ni HorarioDiario aquí
#       (días/horarios se manejan en services)

# =========================
# USUARIO (READ / WRITE)
# =========================

class UsuarioReadSerializer(serializers.ModelSerializer):
    direccion = DireccionSerializer(read_only=True)
    direccion_id = serializers.PrimaryKeyRelatedField(
        queryset=Direccion.objects.all(),
        source='direccion',
        write_only=True,
        allow_null=True,
        required=False,
    )

    es_cuidador = serializers.SerializerMethodField()
    es_cliente  = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = [
            'id', 'username', 'first_name', 'last_name', 'email',
            'fecha_nacimiento', 'direccion', 'direccion_id',
            'telefono', 'foto_perfil', 'descripcion', 'descripcion_min',
            'fecha_creacion', 'fecha_actualizacion',
            'is_staff', 'is_superuser',            # útil para admin
            'es_cuidador', 'es_cliente',           # ← NUEVO
        ]
        read_only_fields = ['fecha_creacion', 'fecha_actualizacion']

    def get_es_cuidador(self, obj):
        return Cuidador.objects.filter(usuario=obj).exists()

    def get_es_cliente(self, obj):
        return Cliente.objects.filter(usuario=obj).exists()


class UsuarioCreateSerializer(serializers.ModelSerializer):
    """Para registro: acepta password y direccion_id (PK)."""
    password = serializers.CharField(write_only=True, min_length=8)
    direccion_id = serializers.PrimaryKeyRelatedField(
        queryset=Direccion.objects.all(),
        source='direccion',
        write_only=True,
        allow_null=True,
        required=False,
    )

    class Meta:
        model = Usuario
        fields = [
            "username", "email", "first_name", "last_name",
            "password", "fecha_nacimiento",
            "direccion_id",      # ← mapea a 'direccion'
            "telefono", "foto_perfil", "descripcion", "descripcion_min",
        ]
        extra_kwargs = {
            "email": {"required": True}
        }

    def create(self, validated_data):
        password = validated_data.pop("password")
        usuario = Usuario(**validated_data)
        usuario.set_password(password)
        usuario.save()
        return usuario


# =========================
# TIPOS / FOTOS
# =========================

class TipoClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoCliente
        fields = ['id', 'nombre']


class FotoClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = FotoCliente
        fields = ['id', 'cliente', 'imagen']


# =========================
# CLIENTE (READ)
# =========================

class ClienteSerializer(serializers.ModelSerializer):
    usuario = UsuarioReadSerializer(read_only=True)
    usuario_id = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(),
        source='usuario',
        write_only=True
    )
    tipos_cliente = TipoClienteSerializer(many=True, read_only=True)
    tipos_cliente_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=TipoCliente.objects.all(),
        source='tipos_cliente',
        write_only=True
    )
    fotos = FotoClienteSerializer(many=True, read_only=True)

    class Meta:
        model = Cliente
        fields = [
            'id', 'usuario', 'usuario_id',
            'tipos_cliente', 'tipos_cliente_ids',
            'fotos'
        ]


# =========================
# CUIDADOR (READ)
# =========================

class CuidadorSerializer(serializers.ModelSerializer):
    usuario = UsuarioReadSerializer(read_only=True)
    usuario_id = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(),
        source='usuario',
        write_only=True
    )
    tipos_cliente = TipoClienteSerializer(many=True, read_only=True)
    tipos_cliente_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=TipoCliente.objects.all(),
        source='tipos_cliente',
        write_only=True
    )

    class Meta:
        model = Cuidador
        fields = [
            'id', 'usuario', 'usuario_id',
            'anios_experiencia',
            'tipos_cliente', 'tipos_cliente_ids'
        ]


# =========================
# REGISTRO CLIENTE (WRITE)
# =========================

class RegistroClienteSerializer(serializers.Serializer):
    # Campos de usuario (flat) para alta rápida
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)

    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    fecha_nacimiento = serializers.DateField(required=False, allow_null=True)
    telefono = serializers.CharField(required=False, allow_blank=True)
    descripcion = serializers.CharField(required=False, allow_blank=True)
    descripcion_min = serializers.CharField(required=False, allow_blank=True)

    # Mapeo a FK por PK
    direccion_id = serializers.PrimaryKeyRelatedField(
        queryset=Direccion.objects.all(),
        source="direccion",
        required=False,
        allow_null=True
    )

    # Relación M2M del cliente
    tipos_cliente_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=TipoCliente.objects.all(),
        write_only=True
    )

    # Fotos opcionales
    fotos = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )

    def create(self, validated_data):
        tipos_cliente = validated_data.pop('tipos_cliente_ids', [])
        fotos = validated_data.pop('fotos', [])
        password = validated_data.pop('password', None)
        if not password:
            raise ValidationError({"password": "Es requerido"})

        usuario = Usuario(**validated_data)
        usuario.set_password(password)
        usuario.save()

        cliente = Cliente.objects.create(usuario=usuario)
        if tipos_cliente:
            cliente.tipos_cliente.set(tipos_cliente)

        for imagen in fotos:
            FotoCliente.objects.create(cliente=cliente, imagen=imagen)

        return cliente


# =========================
# REGISTRO CUIDADOR (WRITE)
# =========================

class RegistroCuidadorSerializer(serializers.ModelSerializer):
    """
    Registro de cuidador SIN disponibilidad ni horarios.
    Eso se gestiona en 'services' con sus propios endpoints.
    """
    usuario = UsuarioCreateSerializer()
    tipos_cliente_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=TipoCliente.objects.all(),
        source='tipos_cliente',
        write_only=True
    )

    class Meta:
        model = Cuidador
        fields = [
            'usuario',
            'anios_experiencia',
            'tipos_cliente_ids',
        ]

    def create(self, validated_data):
        usuario_data = validated_data.pop('usuario', None)
        if not usuario_data:
            raise ValidationError({"usuario": "Es requerido"})

        tipos_cliente = validated_data.pop('tipos_cliente', [])

        # Crear usuario validando password + direccion_id
        user_ser = UsuarioCreateSerializer(data=usuario_data)
        user_ser.is_valid(raise_exception=True)
        usuario = user_ser.save()

        # Crear cuidador (sin horarios/días)
        cuidador = Cuidador.objects.create(usuario=usuario, **validated_data)
        if tipos_cliente:
            cuidador.tipos_cliente.set(tipos_cliente)

        return cuidador

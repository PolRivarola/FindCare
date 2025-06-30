from rest_framework import serializers
from users.models import Usuario, TipoCliente, Cliente, FotoCliente, Cuidador
from location.models import Direccion
from location.serializers import DireccionSerializer
from services.models import DiaSemanal, HorarioDiario

class UsuarioSerializer(serializers.ModelSerializer):
    direccion = DireccionSerializer(read_only=True)
    direccion_id = serializers.PrimaryKeyRelatedField(
        queryset=Direccion.objects.all(),
        source='direccion',
        write_only=True,
        allow_null=True
    )

    class Meta:
        model = Usuario
        fields = [
            'id', 'username', 'first_name', 'last_name', 'email',
            'fecha_nacimiento', 'direccion', 'direccion_id',
            'telefono', 'foto_perfil', 'descripcion', 'descripcion_min',
            'fecha_creacion', 'fecha_actualizacion'
        ]
        read_only_fields = ['fecha_creacion', 'fecha_actualizacion']

class TipoClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoCliente
        fields = ['id', 'nombre']

class FotoClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = FotoCliente
        fields = ['id', 'cliente', 'imagen']

class ClienteSerializer(serializers.ModelSerializer):
    usuario = UsuarioSerializer(read_only=True)
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

class CuidadorSerializer(serializers.ModelSerializer):
    usuario = UsuarioSerializer(read_only=True)
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

class RegistroClienteSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    fecha_nacimiento = serializers.DateField()
    telefono = serializers.CharField()
    descripcion = serializers.CharField()
    descripcion_min = serializers.CharField()
    direccion_id = serializers.PrimaryKeyRelatedField(queryset=Direccion.objects.all(), required=False)
    
    tipos_cliente_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=TipoCliente.objects.all(),
        write_only=True
    )

    fotos = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )

    def create(self, validated_data):
        tipos_cliente = validated_data.pop('tipos_cliente_ids', [])
        fotos = validated_data.pop('fotos', [])
        password = validated_data.pop('password')

        usuario = Usuario(**validated_data)
        usuario.set_password(password)
        usuario.save()

        cliente = Cliente.objects.create(usuario=usuario)
        cliente.tipos_cliente.set(tipos_cliente)

        for imagen in fotos:
            FotoCliente.objects.create(cliente=cliente, imagen=imagen)

        return cliente
    
class RegistroCuidadorSerializer(serializers.ModelSerializer):
    usuario = UsuarioSerializer()
    tipos_cliente_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=TipoCliente.objects.all(),
        source='tipos_cliente',
        write_only=True
    )
    dias_disponibles_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=DiaSemanal.objects.all(),
        source='dias_disponibles',
        write_only=True
    )
    horario_id = serializers.PrimaryKeyRelatedField(
        queryset=HorarioDiario.objects.all(),
        source='horario',
        write_only=True
    )

    class Meta:
        model = Cuidador
        fields = [
            'usuario',
            'anios_experiencia',
            'tipos_cliente_ids',
            'dias_disponibles_ids',
            'horario_id',
        ]

    def create(self, validated_data):
        usuario_data = validated_data.pop('usuario')
        tipos_cliente = validated_data.pop('tipos_cliente', [])
        dias_disponibles = validated_data.pop('dias_disponibles', [])
        horario = validated_data.pop('horario', None)

        # Crear usuario
        password = usuario_data.pop('password')
        usuario = Usuario.objects.create(**usuario_data)
        usuario.set_password(password)
        usuario.save()

        # Crear cuidador
        cuidador = Cuidador.objects.create(usuario=usuario, horario=horario, **validated_data)
        cuidador.tipos_cliente.set(tipos_cliente)
        cuidador.dias_disponibles.set(dias_disponibles)

        return cuidador
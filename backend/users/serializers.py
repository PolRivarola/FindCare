from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from users.models import Usuario, TipoCliente, Cliente, FotoCliente, Cuidador
from location.models import Direccion
from location.serializers import DireccionSerializer
from users.utils import generate_username

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
            'is_staff', 'is_superuser',
            'es_cuidador', 'es_cliente',
        ]
        read_only_fields = ['fecha_creacion', 'fecha_actualizacion']

    def get_es_cuidador(self, obj):
        return Cuidador.objects.filter(usuario=obj).exists()

    def get_es_cliente(self, obj):
        return Cliente.objects.filter(usuario=obj).exists()


class UsuarioCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, 
        min_length=8,
        error_messages={
            'min_length': 'La contraseña debe tener al menos 8 caracteres.',
            'required': 'La contraseña es obligatoria.',
            'blank': 'La contraseña no puede estar vacía.'
        }
    )
    direccion_id = serializers.PrimaryKeyRelatedField(
        queryset=Direccion.objects.all(),
        source='direccion',
        write_only=True,
        allow_null=True,
        required=False,
    )
    username = serializers.CharField(required=False, read_only=True)

    class Meta:
        model = Usuario
        fields = [
            "username", "email", "first_name", "last_name",
            "password", "fecha_nacimiento",
            "direccion_id",
            "telefono", "foto_perfil", "descripcion", "descripcion_min",
        ]
        extra_kwargs = {
            "email": {"required": True}
        }

    def create(self, validated_data):
        password = validated_data.pop("password")
        validated_data.pop("username", None)
        
        first_name = validated_data.get("first_name", "")
        last_name = validated_data.get("last_name", "")
        fecha_nac = validated_data.get("fecha_nacimiento")
        
        username = generate_username(first_name, last_name, fecha_nac)
        validated_data["username"] = username
        usuario = Usuario(**validated_data)
        usuario.set_password(password)
        usuario.save()
        return usuario


# TIPOS / FOTOS

class TipoClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoCliente
        fields = ['id', 'nombre']


class FotoClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = FotoCliente
        fields = ['id', 'cliente', 'imagen']


# CLIENTE (READ)

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


# CUIDADOR (READ)

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


# REGISTRO CLIENTE (WRITE)

class RegistroClienteSerializer(serializers.Serializer):
    username = serializers.CharField(required=False, read_only=True)
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True, 
        min_length=8,
        error_messages={
            'min_length': 'La contraseña debe tener al menos 8 caracteres.',
            'required': 'La contraseña es obligatoria.',
            'blank': 'La contraseña no puede estar vacía.'
        }
    )

    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    fecha_nacimiento = serializers.DateField(required=False, allow_null=True)
    telefono = serializers.CharField(required=False, allow_blank=True)
    descripcion = serializers.CharField(required=False, allow_blank=True)
    descripcion_min = serializers.CharField(required=False, allow_blank=True)

    # Location fields (names as strings)
    provincia = serializers.CharField(required=False, allow_blank=True, write_only=True)
    ciudad = serializers.CharField(required=False, allow_blank=True, write_only=True)
    direccion = serializers.CharField(required=False, allow_blank=True, write_only=True)

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
        from location.models import Provincia, Ciudad, Direccion
        
        tipos_cliente = validated_data.pop('tipos_cliente_ids', [])
        fotos = validated_data.pop('fotos', [])
        password = validated_data.pop('password', None)
        
        # Extract location data
        provincia_nombre = validated_data.pop('provincia', None)
        ciudad_nombre = validated_data.pop('ciudad', None)
        direccion_calle = validated_data.pop('direccion', None)
        
        if not password:
            raise ValidationError({"password": "La contraseña es obligatoria y debe tener al menos 8 caracteres."})

        validated_data.pop('username', None)
        first_name = validated_data.get('first_name', '')
        last_name = validated_data.get('last_name', '')
        fecha_nac = validated_data.get('fecha_nacimiento')
        email = validated_data.get('email', '')
        
        username = generate_username(first_name, last_name, fecha_nac)
        
        # Debug: verificar que el email y categorías estén presentes
        print(f"DEBUG - Registro Cliente: email={email}, username={username}, tipos_cliente={[t.id for t in tipos_cliente]}")
        print(f"DEBUG - Location: provincia={provincia_nombre}, ciudad={ciudad_nombre}, direccion={direccion_calle}")
        
        # Create or get Direccion
        direccion_obj = None
        if provincia_nombre and ciudad_nombre:
            try:
                provincia = Provincia.objects.get(nombre__iexact=provincia_nombre)
                ciudad = Ciudad.objects.get(nombre__iexact=ciudad_nombre, provincia=provincia)
                direccion_obj = Direccion.objects.create(
                    direccion=direccion_calle or '',
                    ciudad=ciudad
                )
                print(f"DEBUG - Dirección creada: {direccion_obj.id}")
            except (Provincia.DoesNotExist, Ciudad.DoesNotExist) as e:
                print(f"DEBUG - Error creando dirección: {e}")
        
        validated_data['username'] = username
        validated_data['direccion'] = direccion_obj
        usuario = Usuario(**validated_data)
        usuario.set_password(password)
        usuario.save()

        cliente = Cliente.objects.create(usuario=usuario)
        if tipos_cliente:
            cliente.tipos_cliente.set(tipos_cliente)
            print(f"DEBUG - Categorías asignadas: {[t.nombre for t in tipos_cliente]}")

        for imagen in fotos:
            FotoCliente.objects.create(cliente=cliente, imagen=imagen)

        return cliente


# REGISTRO CUIDADOR (WRITE)

class RegistroCuidadorSerializer(serializers.ModelSerializer):
    usuario = UsuarioCreateSerializer()
    tipos_cliente_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=TipoCliente.objects.all(),
        source='tipos_cliente',
        write_only=True
    )
    provincia = serializers.CharField(required=False, allow_blank=True, write_only=True)
    ciudad = serializers.CharField(required=False, allow_blank=True, write_only=True)
    direccion = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = Cuidador
        fields = [
            'usuario',
            'anios_experiencia',
            'tipos_cliente_ids',
            'provincia',
            'ciudad',
            'direccion',
        ]

    def create(self, validated_data):
        from location.models import Provincia, Ciudad, Direccion
        
        usuario_data = validated_data.pop('usuario', None)
        if not usuario_data:
            raise ValidationError({"usuario": "Es requerido"})

        tipos_cliente = validated_data.pop('tipos_cliente', [])
        
        # Extraer datos de ubicación
        provincia_nombre = validated_data.pop('provincia', None)
        ciudad_nombre = validated_data.pop('ciudad', None)
        direccion_calle = validated_data.pop('direccion', None)
        
        print(f"DEBUG CUIDADOR - Provincia: {provincia_nombre}, Ciudad: {ciudad_nombre}, Dirección: {direccion_calle}")

        # Crear dirección si hay datos de ubicación
        direccion_obj = None
        if provincia_nombre and ciudad_nombre:
            try:
                provincia = Provincia.objects.get(nombre__iexact=provincia_nombre)
                ciudad = Ciudad.objects.get(nombre__iexact=ciudad_nombre, provincia=provincia)
                direccion_obj = Direccion.objects.create(
                    direccion=direccion_calle or '',
                    ciudad=ciudad
                )
                print(f"DEBUG CUIDADOR - Dirección creada: {direccion_obj.id}")
            except (Provincia.DoesNotExist, Ciudad.DoesNotExist) as e:
                print(f"DEBUG CUIDADOR - Error creando dirección: {e}")
        
        # Asignar dirección al usuario_data
        if direccion_obj:
            usuario_data['direccion'] = direccion_obj

        user_ser = UsuarioCreateSerializer(data=usuario_data)
        user_ser.is_valid(raise_exception=True)
        usuario = user_ser.save()

        cuidador = Cuidador.objects.create(usuario=usuario, **validated_data)
        if tipos_cliente:
            cuidador.tipos_cliente.set(tipos_cliente)

        return cuidador

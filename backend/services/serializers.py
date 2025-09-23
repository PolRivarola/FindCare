from django.utils import timezone
from rest_framework import serializers
from .models import Calificacion, Servicio, Experiencia, Certificacion, DiaSemanal, HorarioDiario
from django.contrib.auth import get_user_model

Usuario = get_user_model()

class UsuarioSerializer(serializers.ModelSerializer):
    foto_perfil = serializers.SerializerMethodField()
    
    class Meta:
        model = Usuario
        fields = ['id', 'first_name', 'last_name', 'email', 'foto_perfil']
    
    def get_foto_perfil(self, obj):
        if not obj.foto_perfil:
            return None
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.foto_perfil.url)
        return obj.foto_perfil.url

class DiaSemanalSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiaSemanal
        fields = ['id', 'nombre']

class HorarioDiarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = HorarioDiario
        fields = ['id', 'nombre']

class ServicioSerializer(serializers.ModelSerializer):
    # --- lectura (GET) ---
    cliente = UsuarioSerializer(read_only=True)
    receptor = UsuarioSerializer(read_only=True)
    dias_semanales = DiaSemanalSerializer(many=True, read_only=True)

    # --- escritura (POST/PUT/PATCH) ---
    receptor_id = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(), source="receptor", write_only=True
    )
    dias_semanales_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=DiaSemanal.objects.all(),
        source="dias_semanales", write_only=True
    )

    en_curso = serializers.SerializerMethodField()
    # calificaciones por rol
    calificacion_cliente = serializers.SerializerMethodField()
    calificacion_cuidador = serializers.SerializerMethodField()
    # flags de conveniencia para el front (para el usuario autenticado)
    puede_calificar = serializers.SerializerMethodField()

    class Meta:
        model = Servicio
        fields = [
            "id",
            "cliente", "receptor",            # read-only
            "receptor_id",                    # write-only
            "fecha_inicio", "fecha_fin",
            "descripcion", "horas_dia",
            "dias_semanales",                 # read-only
            "dias_semanales_ids",             # write-only
            "aceptado","en_curso",
            "calificacion_cliente", "calificacion_cuidador",
            "puede_calificar",
            
        ]
        read_only_fields = ["id", "cliente", "receptor", "dias_semanales"]

    def create(self, validated_data):
        return super().create(validated_data)
    
    def get_en_curso(self, obj):
        now = timezone.now()
        en_curso = obj.aceptado and (obj.fecha_inicio <= now <= obj.fecha_fin)
        
        print("en_curso");
        print(en_curso);
        return en_curso;

    def _get_calif(self, obj, who):
        if who == "cliente":
            cal = next((c for c in obj.calificaciones.all() if c.autor_id == obj.cliente_id), None)
        else:
            cal = next((c for c in obj.calificaciones.all() if c.autor_id == obj.receptor_id), None)
        if not cal:
            return None
        return {
            "puntuacion": cal.puntuacion,
            "comentario": cal.comentario,
            "creado_en": cal.creado_en,
        }

    def get_calificacion_cliente(self, obj):
        return self._get_calif(obj, "cliente")

    def get_calificacion_cuidador(self, obj):
        return self._get_calif(obj, "receptor")

    def get_puede_calificar(self, obj):
        """
        El usuario actual puede calificar si:
        - Es cliente o receptor del servicio,
        - El servicio está aceptado y ya finalizó (fecha_fin < now),
        - Aún no emitió su calificación (autor=obj.user).
        """
        req = self.context.get("request")
        if not req or not req.user or not req.user.is_authenticated:
            return False
        if req.user.id not in (obj.cliente_id, obj.receptor_id):
            return False

        now = timezone.now()
        if not obj.aceptado or not (obj.fecha_fin < now):
            return False

        ya = any(c.autor_id == req.user.id for c in obj.calificaciones.all())
        return not ya

class CalificacionSerializer(serializers.ModelSerializer):
    usuario = UsuarioSerializer(read_only=True)

    class Meta:
        model = Calificacion
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


class CalificacionSerializer(serializers.ModelSerializer):
    autor = UsuarioSerializer(read_only=True)
    receptor = UsuarioSerializer(read_only=True)

    class Meta:
        model = Calificacion
        fields = ["id", "puntuacion", "comentario", "creado_en", "autor", "receptor", "reportada"]

class CertMiniSerializer(serializers.ModelSerializer):
    archivo = serializers.SerializerMethodField()

    class Meta:
        model = Certificacion
        fields = ["nombre", "archivo"]


    def get_archivo(self, obj):
        if not obj.archivo:
            return None
        request = self.context.get("request")
        url = obj.archivo.url
        return request.build_absolute_uri(url) if request else url


class ExpMiniSerializer(serializers.ModelSerializer):
    fecha_inicio = serializers.DateTimeField()
    fecha_fin = serializers.DateTimeField()

    class Meta:
        model = Experiencia
        fields = ["descripcion", "fecha_inicio", "fecha_fin"]


class CuidadorPerfilReadSerializer(serializers.Serializer):
    # Usuario
    id = serializers.IntegerField()
    username = serializers.CharField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.EmailField()
    telefono = serializers.CharField(allow_blank=True)
    fecha_nacimiento = serializers.DateField(allow_null=True)
    descripcion = serializers.CharField(allow_blank=True)
    foto_perfil = serializers.ImageField(allow_null=True)

    # Dirección “plana”
    provincia = serializers.CharField(allow_blank=True)
    ciudad = serializers.CharField(allow_blank=True)
    direccion = serializers.CharField(allow_blank=True)

    # Perfil de cuidador
    tipo_usuario = serializers.CharField(default="cuidador")
    categorias = serializers.ListField(child=serializers.CharField(), default=list)
    certificados = CertMiniSerializer(many=True)
    experiencias = ExpMiniSerializer(many=True)

    # métricas opcionales
    rating = serializers.FloatField(required=False, allow_null=True)
    reviews = serializers.ListField(required=False)  # si devolvés objetos de reseñas

# services/serializers.py
from rest_framework import serializers

class CuidadorPerfilUpdateSerializer(serializers.Serializer):
    # campos básicos del usuario
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False)
    telefono = serializers.CharField(required=False, allow_blank=True)
    fecha_nacimiento = serializers.DateField(required=False, allow_null=True)
    descripcion = serializers.CharField(required=False, allow_blank=True)
    foto_perfil = serializers.ImageField(required=False, allow_empty_file=False)
    current_password = serializers.CharField(required=False, write_only=True, allow_blank=False, trim_whitespace=False)
    new_password = serializers.CharField(required=False, write_only=True, allow_blank=False, trim_whitespace=False)
    confirm_password = serializers.CharField(required=False, write_only=True, allow_blank=False, trim_whitespace=False)

    # dirección
    provincia = serializers.CharField(required=False)
    ciudad = serializers.CharField(required=False)
    direccion = serializers.CharField(required=False)

    # categorías (ids de TipoCliente)
    categorias_ids = serializers.ListField(child=serializers.IntegerField(), required=False)

    # 👇 clave: viene como string JSON en multipart
    experiencias = serializers.JSONField(required=False)

    # archivos
    certificados = serializers.ListField(child=serializers.FileField(), required=False)
    certificados_nombres = serializers.ListField(child=serializers.CharField(), required=False)

    def validate(self, data):
        files = data.get("certificados") or []
        names = data.get("certificados_nombres") or []
        if names and len(names) != len(files):
            raise serializers.ValidationError("certificados y certificados_nombres deben tener la misma longitud.")
        
        files = data.get("certificados") or []
        names = data.get("certificados_nombres") or []
        if names and len(names) != len(files):
            raise serializers.ValidationError("certificados y certificados_nombres deben tener la misma longitud.")

        # validación de cambio de contraseña (si vienen campos)
        cp = data.get("current_password")
        np = data.get("new_password")
        rp = data.get("confirm_password")
        if any([cp, np, rp]):
            # todos deben venir
            if not (cp and np and rp):
                raise serializers.ValidationError("Debe enviar current_password, new_password y confirm_password.")
            if np != rp:
                raise serializers.ValidationError("La nueva contraseña y su confirmación no coinciden.")
            if len(np) < 8:
                raise serializers.ValidationError("La nueva contraseña debe tener al menos 8 caracteres.")
        return data

    def validate_experiencias(self, value):
        # value puede venir ya como lista (porque JSONField parsea el string)
        if not isinstance(value, list):
            raise serializers.ValidationError("Debe ser una lista.")
        errs = {}
        for i, e in enumerate(value):
            if not isinstance(e, dict):
                errs[i] = "Cada ítem debe ser objeto."
                continue
            for k in ("descripcion", "fecha_inicio", "fecha_fin"):
                if not e.get(k):
                    errs.setdefault(i, {})[k] = "Este campo es requerido."
        if errs:
            raise serializers.ValidationError(errs)
        return value

from rest_framework import serializers
from django.utils import timezone
from .models import Conversacion, Mensaje
from users.models import Usuario  # tu user

class ConversacionListSerializer(serializers.ModelSerializer):
    nombre = serializers.SerializerMethodField()
    tipo = serializers.SerializerMethodField()
    ultimoMensaje = serializers.SerializerMethodField()
    hora = serializers.SerializerMethodField()
    noLeidos = serializers.SerializerMethodField()
    user_id = serializers.SerializerMethodField()

    class Meta:
        model = Conversacion
        fields = ["id", "nombre", "tipo", "ultimoMensaje", "hora", "noLeidos", "user_id"]

    def get_contraparte(self, obj):
        user = self.context["request"].user
        return obj.cuidador if obj.cliente_id == user.id else obj.cliente

    def get_nombre(self, obj):
        u = self.get_contraparte(obj)
        nombre = f"{u.first_name} {u.last_name}".strip()
        return nombre or u.username

    def get_tipo(self, obj):
        u = self.get_contraparte(obj)
        if hasattr(u, "cuidador"):
            return "Cuidador"
        if hasattr(u, "cliente"):
            return "Cliente"
        return "Usuario"

    def get_ultimoMensaje(self, obj):
        m = obj.mensajes.order_by("-creado_en").first()
        return m.contenido if m else ""

    def get_hora(self, obj):
        m = obj.mensajes.order_by("-creado_en").first()
        if not m:
            return ""
        return timezone.localtime(m.creado_en).strftime("%H:%M")

    def get_noLeidos(self, obj):
        user = self.context["request"].user
        return obj.mensajes.exclude(emisor=user).exclude(leido_por=user).count()

    def get_user_id(self, obj):
        return self.get_contraparte(obj).id



class MensajeSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()
    content = serializers.CharField(source="contenido")
    time = serializers.SerializerMethodField()
    isOwn = serializers.SerializerMethodField()

    class Meta:
        model = Mensaje
        fields = ["id", "sender", "content", "time", "isOwn"]

    def get_sender(self, obj):
        u = obj.emisor
        nombre = f"{u.first_name} {u.last_name}".strip()
        return nombre or ("Yo" if self.get_isOwn(obj) else u.username)

    def get_time(self, obj):
        return timezone.localtime(obj.creado_en).strftime("%H:%M")

    def get_isOwn(self, obj):
        request = self.context.get("request")
        return bool(request and request.user and obj.emisor_id == request.user.id)

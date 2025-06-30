from rest_framework import serializers
from .models import Conversacion, Mensaje

class MensajeSerializer(serializers.ModelSerializer):
    remitente_str = serializers.StringRelatedField(source='remitente', read_only=True)
    receptor_str = serializers.StringRelatedField(source='receptor', read_only=True)

    class Meta:
        model = Mensaje
        fields = [
            'id', 'contenido', 'fecha_envio',
            'remitente', 'receptor',
            'remitente_str', 'receptor_str',
        ]

class ConversacionSerializer(serializers.ModelSerializer):
    remitente_str = serializers.StringRelatedField(source='remitente', read_only=True)
    receptor_str = serializers.StringRelatedField(source='receptor', read_only=True)
    mensajes = MensajeSerializer(many=True, read_only=True, source='mensaje_set')

    class Meta:
        model = Conversacion
        fields = [
            'id', 'remitente', 'remitente_str',
            'receptor', 'receptor_str',
            'fecha_creacion', 'mensajes'
        ]
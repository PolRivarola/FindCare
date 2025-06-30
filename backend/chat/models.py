from django.db import models
from django.contrib.auth import get_user_model

class Conversacion(models.Model):
    remitente = models.ForeignKey(get_user_model(), related_name='conversaciones_enviadas', on_delete=models.DO_NOTHING)
    receptor = models.ForeignKey(get_user_model(), related_name='conversaciones_recibidas', on_delete=models.DO_NOTHING)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

class Mensaje(models.Model):
    conversacion = models.ForeignKey(Conversacion, related_name='mensajes', on_delete=models.CASCADE)
    remitente = models.ForeignKey(get_user_model(), related_name='mensajes_enviados', on_delete=models.DO_NOTHING)
    receptor = models.ForeignKey(get_user_model(), related_name='mensajes_recibidos', on_delete=models.DO_NOTHING)
    contenido = models.TextField()
    fecha_envio = models.DateTimeField(auto_now_add=True)


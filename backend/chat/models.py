# chat/models.py
from django.conf import settings
from django.db import models

User = settings.AUTH_USER_MODEL

class Conversacion(models.Model):
    cliente = models.ForeignKey(
        User, on_delete=models.CASCADE,
        related_name="conversaciones_como_cliente",
        null=True, blank=True  # temporal
    )
    cuidador = models.ForeignKey(
        User, on_delete=models.CASCADE,
        related_name="conversaciones_como_cuidador",
        null=True, blank=True  # temporal
    )
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["cliente", "cuidador"],
                name="uniq_conv_cliente_cuidador"
            )
        ]

class Mensaje(models.Model):
    conversacion = models.ForeignKey(Conversacion, on_delete=models.CASCADE, related_name="mensajes")
    emisor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="mensajes_enviados")
    contenido = models.TextField()
    creado_en = models.DateTimeField(auto_now_add=True)
    leido_por = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name="mensajes_leidos")

    class Meta:
        ordering = ["creado_en"]
    
    

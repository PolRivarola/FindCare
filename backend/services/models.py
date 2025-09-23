from django.db import models
from django.contrib.auth import get_user_model
User = get_user_model()
class Servicio(models.Model):
    cliente = models.ForeignKey(get_user_model(), related_name='servicios_recibidos', on_delete=models.DO_NOTHING)
    receptor = models.ForeignKey(get_user_model(), related_name='servicios', on_delete=models.DO_NOTHING)
    fecha_inicio = models.DateTimeField()
    fecha_fin = models.DateTimeField()
    descripcion = models.TextField()
    horas_dia = models.TextField()
    dias_semanales = models.ManyToManyField('DiaSemanal', related_name='servicios')
    aceptado = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.cliente} - {self.receptor} - {self.fecha_inicio} - {self.fecha_fin}"

class Calificacion(models.Model):
    servicio = models.ForeignKey("Servicio", on_delete=models.CASCADE, related_name="calificaciones")
    autor = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)  # cliente o cuidador
    receptor = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name="calificaciones_recibidas")
    puntuacion = models.PositiveSmallIntegerField()
    comentario = models.TextField(blank=True, null=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    reportada = models.BooleanField(default=False)

    class Meta:
        unique_together = ("servicio", "autor")
    
    def __str__(self):
        return f"Calificación de {self.autor} para {self.receptor}:{self.puntuacion}"
    

class Experiencia(models.Model):
    cuidador = models.ForeignKey(get_user_model(), related_name='experiencias', on_delete=models.CASCADE)
    descripcion = models.TextField()
    fecha_inicio = models.DateTimeField()
    fecha_fin = models.DateTimeField()

class DiaSemanal(models.Model):
    nombre = models.CharField(max_length=20, unique=True)

class HorarioDiario(models.Model):
    nombre = models.CharField(max_length=20, unique=True)

class Certificacion(models.Model):
    cuidador = models.ForeignKey(get_user_model(), related_name='certificaciones', on_delete=models.CASCADE)
    nombre = models.CharField(max_length=255)
    archivo = models.FileField(upload_to='certificaciones/')





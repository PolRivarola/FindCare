from django.db import models
from django.contrib.auth import get_user_model

class Servicio(models.Model):
    cliente = models.ForeignKey(get_user_model(), related_name='servicios_recibidos', on_delete=models.DO_NOTHING)
    receptor = models.ForeignKey(get_user_model(), related_name='servicios', on_delete=models.DO_NOTHING)
    fecha_inicio = models.DateTimeField()
    fecha_fin = models.DateTimeField()
    descripcion = models.TextField()
    horas_dia = models.TextField()
    dias_semanales = models.ManyToManyField('DiaSemanal', related_name='servicios')

class Clasificacion(models.Model):
    usuario = models.ForeignKey(get_user_model(), related_name='clasificaciones', on_delete=models.CASCADE)
    comentario = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)
    puntuacion = models.IntegerField()

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
    nommbre = models.CharField(max_length=255)
    archivo = models.FileField(upload_to='certificaciones/')
    horario = models.ForeignKey(HorarioDiario, on_delete=models.SET_NULL, null=True, blank=True, related_name='cuidadores')
    dias_disponibles = models.ManyToManyField(DiaSemanal, related_name='cuidadores')





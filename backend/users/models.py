from django.contrib.auth.models import AbstractUser
from django.db import models

from location.models import Direccion

class Usuario(AbstractUser):
    fecha_nacimiento = models.DateField(null=True, blank=True)
    direccion = models.ForeignKey(Direccion, null=True, blank=True, on_delete=models.SET_NULL)
    telefono = models.CharField(max_length=20, blank=True)
    foto_perfil = models.ImageField(upload_to='perfiles/', null=True, blank=True)
    descripcion = models.TextField(blank=True)
    descripcion_min = models.CharField(max_length=255, blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

class TipoCliente(models.Model):
    nombre = models.CharField(max_length=100)

    def __str__(self):
        return self.nombre
    
class Cliente(models.Model):
    usuario = models.OneToOneField('Usuario', on_delete=models.CASCADE, related_name='cliente')
    tipos_cliente = models.ManyToManyField('TipoCliente', related_name='clientes')

    def __str__(self):
        return f"Cliente: {self.usuario}"

class FotoCliente(models.Model):
    cliente = models.ForeignKey('Cliente', on_delete=models.CASCADE, related_name='fotos')
    imagen = models.ImageField(upload_to='clientes/fotos/')

class Cuidador(models.Model):
    usuario = models.OneToOneField('Usuario', on_delete=models.CASCADE, related_name='cuidador')
    anios_experiencia = models.PositiveIntegerField()
    tipos_cliente = models.ManyToManyField('TipoCliente', related_name='cuidadores')

    def __str__(self):
        return f"Cuidador: {self.usuario}"
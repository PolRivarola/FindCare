from django.db import models

class Provincia(models.Model):
    nombre = models.CharField(max_length=100, unique=True)

class Ciudad(models.Model):
    nombre = models.CharField(max_length=100)
    provincia = models.ForeignKey(Provincia, related_name='ciudades', on_delete=models.CASCADE)
    class Meta:
        unique_together = ('nombre', 'provincia')

class Direccion(models.Model):
    direccion = models.CharField(max_length=255)
    ciudad = models.ForeignKey(Ciudad, related_name='direcciones', on_delete=models.CASCADE)
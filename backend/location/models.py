from django.db import models

class Provincia(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    def __str__(self):
        return self.nombre

class Ciudad(models.Model):
    nombre = models.CharField(max_length=100)
    provincia = models.ForeignKey(Provincia, related_name='ciudades', on_delete=models.CASCADE)
    class Meta:
        unique_together = ('nombre', 'provincia')
    def __str__(self):
        return f"{self.nombre}, {self.provincia.nombre}"

class Direccion(models.Model):
    direccion = models.CharField(max_length=255)
    ciudad = models.ForeignKey(Ciudad, related_name='direcciones', on_delete=models.CASCADE)
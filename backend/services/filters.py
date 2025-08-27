# services/filters.py
import django_filters as df
from django.db.models import Q
from django.contrib.auth import get_user_model
from .models import Servicio
from .models import DiaSemanal  # si necesitás exponerlo como filtro múltiple

User = get_user_model()

class ServicioFilter(df.FilterSet):
    # IDs directos
    cliente_id  = df.NumberFilter(field_name="cliente__id")
    receptor_id = df.NumberFilter(field_name="receptor__id")  # cuidador

    # Conveniencia: un único parámetro para traer servicios donde participe este usuario
    usuario_id  = df.NumberFilter(method="filter_usuario_id")

    # Rango de fechas
    fecha_inicio = df.DateTimeFromToRangeFilter(field_name="fecha_inicio")
    fecha_fin    = df.DateTimeFromToRangeFilter(field_name="fecha_fin")

    # Boolean
    aceptado = df.BooleanFilter(field_name="aceptado")

    # Texto
    descripcion = df.CharFilter(field_name="descripcion", lookup_expr="icontains")
    horas_dia   = df.CharFilter(field_name="horas_dia", lookup_expr="icontains")

    # ManyToMany (si querés filtrar por días; soporta múltiples ?dias=1&dias=3)
    dias = df.ModelMultipleChoiceFilter(
        field_name="dias_semanales",
        queryset=DiaSemanal.objects.all(),
        to_field_name="id",
    )

    class Meta:
        model = Servicio
        # Lookups “masivos” por si querés filtrar por casi todo sin escribir métodos
        fields = {
            # relaciones por id ya las cubrimos arriba, pero podés permitir exact/in
            # "cliente": ["exact"], "receptor": ["exact"],  # (no suele hacer falta)
            "aceptado": ["exact"],
            "fecha_inicio": ["exact", "date", "date__gte", "date__lte"],
            "fecha_fin": ["exact", "date", "date__gte", "date__lte"],
            # Los de texto los definimos arriba con icontains
        }

    def filter_usuario_id(self, qs, name, value):
        # participa como cliente o como cuidador
        return qs.filter(Q(cliente_id=value) | Q(receptor_id=value))

# services/filters.py
import django_filters as df
from django.db.models import Q
from django.contrib.auth import get_user_model
from .models import Servicio
from .models import DiaSemanal

User = get_user_model()

class ServicioFilter(df.FilterSet):
    cliente_id  = df.NumberFilter(field_name="cliente__id")
    receptor_id = df.NumberFilter(field_name="receptor__id")

    usuario_id  = df.NumberFilter(method="filter_usuario_id")

    fecha_inicio = df.DateTimeFromToRangeFilter(field_name="fecha_inicio")
    fecha_fin    = df.DateTimeFromToRangeFilter(field_name="fecha_fin")

    aceptado = df.BooleanFilter(field_name="aceptado")

    descripcion = df.CharFilter(field_name="descripcion", lookup_expr="icontains")
    horas_dia   = df.CharFilter(field_name="horas_dia", lookup_expr="icontains")

    dias = df.ModelMultipleChoiceFilter(
        field_name="dias_semanales",
        queryset=DiaSemanal.objects.all(),
        to_field_name="id",
    )

    class Meta:
        model = Servicio
        fields = {
            "aceptado": ["exact"],
            "fecha_inicio": ["exact", "date", "date__gte", "date__lte"],
            "fecha_fin": ["exact", "date", "date__gte", "date__lte"],
        }

    def filter_usuario_id(self, qs, name, value):
        return qs.filter(Q(cliente_id=value) | Q(receptor_id=value))

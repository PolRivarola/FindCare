# services/views.py

from datetime import datetime
from django.utils import timezone
from django.db import transaction
from django.db.models import Avg
from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Servicio,
    Calificacion,
    Experiencia,
    Certificacion,
    DiaSemanal,
    HorarioDiario,
)
from .serializers import (
    ServicioSerializer,
    CalificacionSerializer,
    ExperienciaSerializer,
    CertificacionSerializer,
    DiaSemanalSerializer,
    HorarioDiarioSerializer,
    CuidadorPerfilReadSerializer,
    CuidadorPerfilUpdateSerializer,
    CertMiniSerializer,
    ExpMiniSerializer,
)
from .filters import ServicioFilter

from location.models import Provincia, Ciudad, Direccion
from users.models import TipoCliente


# --------------------------
# Helpers
# --------------------------

def _make_aware(dt: datetime) -> datetime:
    if timezone.is_naive(dt):
        return timezone.make_aware(dt, timezone.get_current_timezone())
    return dt

def _parse_dt(val: str) -> datetime:
    """
    Acepta 'YYYY-MM-DD' o ISO con hora y devuelve datetime aware.
    """
    if not val:
        return None
    try:
        if len(val) == 10:  # 'YYYY-MM-DD'
            dt = datetime.fromisoformat(val + " 00:00:00")
        else:
            dt = datetime.fromisoformat(val)
        return _make_aware(dt)
    except Exception:
        raise ValueError(f"Formato de fecha inválido: {val}")


# --------------------------
# Servicios
# --------------------------

class ServicioViewSet(viewsets.ModelViewSet):
    queryset = (
        Servicio.objects
        .select_related("cliente", "receptor")
        .prefetch_related("dias_semanales")
        .all()
    )
    serializer_class = ServicioSerializer

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ServicioFilter
    search_fields = [
        "descripcion", "horas_dia",
        "cliente__username", "cliente__first_name", "cliente__last_name", "cliente__email",
        "receptor__username", "receptor__first_name", "receptor__last_name", "receptor__email",
    ]
    ordering_fields = ["fecha_inicio", "fecha_fin", "id", "aceptado"]
    ordering = ["-fecha_inicio"]

    def perform_create(self, serializer):
        # el cliente autenticado crea la solicitud
        serializer.save(cliente=self.request.user)

    @action(detail=False, methods=["get"], url_path="stats/cuidador")
    def stats_cuidador(self, request):
        """
        GET /api/servicios/stats/cuidador/?receptor_id=<user_id>
        Devuelve: { pendientes, completados, calificacion_promedio }
        """
        try:
            rid = int(request.query_params.get("receptor_id", ""))
        except (TypeError, ValueError):
            return Response({"detail": "receptor_id requerido"}, status=400)

        now = timezone.now()

        pendientes = Servicio.objects.filter(
            receptor_id=rid, aceptado=False
        ).count()

        completados = Servicio.objects.filter(
            receptor_id=rid, aceptado=True, fecha_fin__lt=now
        ).count()

        avg = (
            Calificacion.objects
            .filter(receptor_id=rid)
            .aggregate(v=Avg("puntuacion"))["v"] or 0
        )

        return Response({
            "pendientes": pendientes,
            "completados": completados,
            "calificacion_promedio": round(float(avg), 2),
        })

    @action(detail=True, methods=["post"], url_path="aceptar")
    def aceptar(self, request, pk=None):
        """
        POST /api/servicios/{id}/aceptar/
        Marca aceptado=True. (Opcional: validar que request.user sea el receptor)
        """
        servicio = self.get_object()
        # if request.user.id != servicio.receptor_id: return Response({"detail": "Solo el receptor puede aceptar"}, 403)
        servicio.aceptado = True
        servicio.save(update_fields=["aceptado"])
        return Response({"detail": "ok"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="calificar")
    def calificar(self, request, pk=None):
        """
        POST /api/servicios/{id}/calificar/
        body: { "puntuacion": 1..5, "comentario": "..." }

        El autor es request.user y el receptor es la contraparte.
        Requiere: servicio aceptado y finalizado (fecha_fin < now).
        """
        servicio = self.get_object()
        user = request.user

        if not user.is_authenticated:
            return Response({"detail": "Auth requerida"}, status=401)

        if user.id not in (servicio.cliente_id, servicio.receptor_id):
            return Response({"detail": "No participas en este servicio"}, status=403)

        now = timezone.now()
        if not servicio.aceptado or not (servicio.fecha_fin < now):
            return Response({"detail": "El servicio debe estar finalizado"}, status=400)

        try:
            puntuacion = int(request.data.get("puntuacion", 0))
        except (TypeError, ValueError):
            return Response({"detail": "puntuacion inválida"}, status=400)

        if not (1 <= puntuacion <= 5):
            return Response({"detail": "puntuacion debe ser 1..5"}, status=400)

        comentario = request.data.get("comentario", "")

        # receptor = el otro participante
        receptor_id = servicio.receptor_id if user.id == servicio.cliente_id else servicio.cliente_id

        calif, created = Calificacion.objects.update_or_create(
            servicio=servicio,
            autor=user,
            defaults={
                "receptor_id": receptor_id,
                "puntuacion": puntuacion,
                "comentario": comentario,
            },
        )
        return Response(
            {"detail": "ok", "puntuacion": calif.puntuacion, "created": created},
            status=200
        )


class CalificacionViewSet(viewsets.ModelViewSet):
    queryset = Calificacion.objects.all()
    serializer_class = CalificacionSerializer


class ExperienciaViewSet(viewsets.ModelViewSet):
    queryset = Experiencia.objects.all()
    serializer_class = ExperienciaSerializer


class CertificacionViewSet(viewsets.ModelViewSet):
    queryset = Certificacion.objects.all()
    serializer_class = CertificacionSerializer


class DiaSemanalViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DiaSemanal.objects.all()
    serializer_class = DiaSemanalSerializer


class HorarioDiarioViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = HorarioDiario.objects.all()
    serializer_class = HorarioDiarioSerializer


# --------------------------
# Perfil de Cuidador (GET/PATCH)
# --------------------------

class CuidadorPerfilView(APIView):
    """
    GET  /api/cuidador/perfil        -> datos públicos/propios del cuidador autenticado
    PATCH /api/cuidador/perfil       -> multipart/form-data
       - experiencias: JSON string de [{descripcion, fecha_inicio, fecha_fin}]
       - certificados: múltiples files (key repetida "certificados")
       - certificados_nombres: nombres paralelos (key repetida)
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    # --- Utilidades internas ---

    def _ensure_cuidador(self, user):
        # Debe tener relación users.Cuidador (OneToOne) creada
        return hasattr(user, "cuidador")

    def _build_read_payload(self,request,user):
        u = user
        dir_str = u.direccion.direccion if u.direccion else ""
        prov = u.direccion.ciudad.provincia.nombre if u.direccion else ""
        ciu = u.direccion.ciudad.nombre if u.direccion else ""

        cu = u.cuidador
        cats = list(cu.tipos_cliente.values_list("nombre", flat=True))

        certs = Certificacion.objects.filter(cuidador=u).order_by("-id")
        exps = Experiencia.objects.filter(cuidador=u).order_by("-fecha_inicio")

        data = {
            "id": u.id,
            "username": u.username,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "email": u.email,
            "telefono": u.telefono or "",
            "fecha_nacimiento": u.fecha_nacimiento,
            "descripcion": u.descripcion or "",
            "foto_perfil": request.build_absolute_uri(u.foto_perfil.url) if u.foto_perfil else None,
            "provincia": prov,
            "ciudad": ciu,
            "direccion": dir_str,
            "tipo_usuario": "cuidador",
            "categorias": cats,
            "certificados": CertMiniSerializer(certs, many=True, context={"request": request}).data,
            "experiencias": ExpMiniSerializer(exps, many=True).data,
        }
        return data

    # --- Endpoints ---

    def get(self, request):
        user = request.user
        if not self._ensure_cuidador(user):
            return Response({"detail": "No es cuidador."}, status=403)
        payload = self._build_read_payload(request, user)
        # opcional: podrías validar/serializar otra vez
        return Response(payload, status=200)

    @transaction.atomic
    def patch(self, request):
        user = request.user
        if not self._ensure_cuidador(user):
            return Response({"detail": "No es cuidador."}, status=403)

        ser = CuidadorPerfilUpdateSerializer(data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        # --- usuario básico ---
        for field in ["first_name", "last_name", "email", "telefono", "fecha_nacimiento", "descripcion"]:
            if field in data:
                setattr(user, field, data[field])

        if "foto_perfil" in data:
            user.foto_perfil = data["foto_perfil"]

        # --- dirección ---
        prov_name = data.get("provincia")
        city_name = data.get("ciudad")
        addr_str = data.get("direccion")
        if prov_name and city_name and addr_str:
            prov, _ = Provincia.objects.get_or_create(nombre=prov_name)
            ciu, _ = Ciudad.objects.get_or_create(nombre=city_name, provincia=prov)
            dir_obj, _ = Direccion.objects.get_or_create(direccion=addr_str, ciudad=ciu)
            user.direccion = dir_obj

        user.save()

        # --- categorías (TipoCliente) ---
        if "categorias_ids" in data and hasattr(user, "cuidador"):
            qs = TipoCliente.objects.filter(id__in=data["categorias_ids"])
            user.cuidador.tipos_cliente.set(qs)

        # --- experiencias ---
        # vienen como JSON en request.data["experiencias"] -> validado por JSONField
        if "experiencias" in data:
            Experiencia.objects.filter(cuidador=user).delete()
            bulk = []
            for e in data["experiencias"]:
                try:
                    fi = _parse_dt(e["fecha_inicio"])
                    ff = _parse_dt(e["fecha_fin"])
                except ValueError as ex:
                    return Response({"experiencias": str(ex)}, status=400)
                bulk.append(
                    Experiencia(
                        cuidador=user,
                        descripcion=e["descripcion"],
                        fecha_inicio=fi,
                        fecha_fin=ff,
                    )
                )
            if bulk:
                Experiencia.objects.bulk_create(bulk)

        # --- certificados (nuevos) ---
        files = request.FILES.getlist("certificados")
        names = request.data.getlist("certificados_nombres")
        for idx, f in enumerate(files):
            label = names[idx] if idx < len(names) and names[idx] else f.name
            Certificacion.objects.create(
                cuidador=user,
                nombre=label,
                archivo=f,
            )

        payload = self._build_read_payload(request, user)
        return Response(payload, status=200)

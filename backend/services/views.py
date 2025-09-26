# services/views.py

from datetime import datetime
from django.utils import timezone
from django.db import transaction
from django.db.models import Avg
from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView

from django.utils.text import slugify
import json
from django.contrib.auth import get_user_model



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
from users.models import Cuidador, Cliente, TipoCliente, FotoCliente


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
        .select_related("cliente__direccion__ciudad__provincia", "receptor__direccion__ciudad__provincia")
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
        # The data from frontend already contains proper DiaSemanal objects
        dias_semanales = serializer.validated_data.get('dias_semanales')
        if not dias_semanales:
            # If no days provided, return error
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"dias_semanales_ids": "Debe seleccionar al menos un día de la semana."})
        
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
    queryset = Calificacion.objects.select_related("autor", "receptor").all()
    serializer_class = CalificacionSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        # Permite filtrar por receptor_id (quien recibió la calificación)
        rid = self.request.query_params.get("receptor_id")
        if rid:
            try:
                qs = qs.filter(receptor_id=int(rid))
            except ValueError:
                pass
        return qs.order_by("-creado_en")

    @action(detail=True, methods=["post"], url_path="reportar")
    def reportar(self, request, pk=None):
        cal = self.get_object()
        # Solo el receptor o admin puede reportar
        if request.user != cal.receptor and not request.user.is_staff:
            return Response({"detail": "No autorizado"}, status=403)
        cal.reportada = True
        cal.save(update_fields=["reportada"])
        return Response({"detail": "ok", "reportada": True})

    @action(detail=True, methods=["post"], url_path="desreportar")
    def desreportar(self, request, pk=None):
        cal = self.get_object()
        # Solo el receptor o admin puede revertir
        if request.user != cal.receptor and not request.user.is_staff:
            return Response({"detail": "No autorizado"}, status=403)
        cal.reportada = False
        cal.save(update_fields=["reportada"])
        return Response({"detail": "ok", "reportada": False})


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
    parser_classes = [MultiPartParser, FormParser, JSONParser]


    def _ensure_cuidador(self, user):
        return hasattr(user, "cuidador")
    
    def get_permissions(self):
        # Permite registrar (POST) sin autenticación, el resto requiere login
        if self.request.method == "POST":
            return [AllowAny()]
        return super().get_permissions()
    

    def _gen_username(self, first_name: str, last_name: str, fecha_nac):
        """first.last.yyyymmdd (único)"""
        if isinstance(fecha_nac, str):
            try:
                fecha_nac = datetime.fromisoformat(fecha_nac).date()
            except Exception:
                fecha_nac = None
        ymd = fecha_nac.strftime("%Y%m%d") if fecha_nac else "00000000"
        base = slugify(f"{first_name}.{last_name}.{ymd}") or "user"
        candidate = base
        i = 1
        User = get_user_model()
        while User.objects.filter(username=candidate).exists():
            candidate = f"{base}-{i}"
            i += 1
        return candidate

    def _parse_dt(self, s: str):
        """Acepta 'YYYY-MM-DD' o ISO8601; devuelve timezone-aware."""
        if not s:
            raise ValueError("fecha requerida")
        try:
            if len(s) == 10:
                # solo fecha
                dt = datetime.strptime(s, "%Y-%m-%d")
            else:
                dt = datetime.fromisoformat(s.replace("Z", "+00:00"))
        except Exception:
            raise ValueError(f"fecha inválida: {s}")
        if timezone.is_naive(dt):
            dt = timezone.make_aware(dt, timezone.get_current_timezone())
        return dt

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
        cp = data.get("current_password")
        np = data.get("new_password")
        rp = data.get("confirm_password")

        if cp and np and rp:
            # Verificamos la actual
            if not user.check_password(cp):
                return Response({"detail": "La contraseña actual no es correcta."}, status=400)
            # Seteamos la nueva
            user.set_password(np)
            user.save(update_fields=["password"])

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
    
    @transaction.atomic
    def post(self, request):
        """
        Registro de cuidador (público):
        multipart/form-data o JSON.
        Campos principales:
          - first_name, last_name, email, telefono, fecha_nacimiento (YYYY-MM-DD), descripcion (opc.)
          - password, confirm_password
          - provincia, ciudad, direccion (para crear Direccion)
          - categorias_ids: array (o JSON string) de IDs de TipoCliente
          - experiencias: JSON string array [{descripcion, fecha_inicio, fecha_fin}]
          - certificados: múltiples files (key repetida 'certificados')
            certificados_nombres: múltiples strings (key repetida paralela)
          - foto_perfil: file (opcional)
        """
        User = get_user_model()

        # 1) tomar datos básicos
        first_name = request.data.get("first_name", "").strip()
        last_name  = request.data.get("last_name", "").strip()
        email      = request.data.get("email", "").strip().lower()
        telefono   = request.data.get("telefono", "").strip()
        fecha_nac  = request.data.get("fecha_nacimiento")  # 'YYYY-MM-DD'
        descripcion = request.data.get("descripcion", "")

        password   = request.data.get("password")
        confirm    = request.data.get("confirm_password")

        if not first_name or not last_name:
            return Response({"detail": "Nombre y apellido son obligatorios."}, status=400)
        if not email:
            return Response({"detail": "Email es obligatorio."}, status=400)
        if not telefono:
            return Response({"detail": "El teléfono es obligatorio."}, status=400)
        if not fecha_nac:
            return Response({"detail": "La fecha de nacimiento es obligatoria."}, status=400)
        if not descripcion:
            return Response({"detail": "La descripción personal es obligatoria."}, status=400)
        
        # Validar ubicación
        provincia = request.data.get("provincia")
        ciudad = request.data.get("ciudad")
        if not provincia:
            return Response({"detail": "La provincia es obligatoria."}, status=400)
        if not ciudad:
            return Response({"detail": "La ciudad es obligatoria."}, status=400)
            
        if not password or not confirm:
            return Response({"detail": "password y confirm_password son obligatorios."}, status=400)
        if password != confirm:
            return Response({"detail": "Las contraseñas no coinciden."}, status=400)
        if User.objects.filter(email=email).exists():
            return Response({"detail": "Ya existe un usuario con ese email."}, status=400)

        # parse fecha nacimiento a date
        fecha_nac_date = None
        if fecha_nac:
            try:
                fecha_nac_date = datetime.fromisoformat(fecha_nac).date()
            except Exception:
                return Response({"detail": "fecha_nacimiento inválida (use YYYY-MM-DD)."}, status=400)

        # 2) dirección
        direccion = request.data.get("direccion")
        direccion_obj = None
        if provincia and ciudad and direccion:
            prov, _ = Provincia.objects.get_or_create(nombre=provincia)
            ciu,  _ = Ciudad.objects.get_or_create(nombre=ciudad, provincia=prov)
            direccion_obj, _ = Direccion.objects.get_or_create(direccion=direccion, ciudad=ciu)

        # 3) username único autogenerado
        username = self._gen_username(first_name, last_name, fecha_nac_date)

        # 4) crear usuario
        user = User(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            telefono=telefono,
            fecha_nacimiento=fecha_nac_date,
            descripcion=descripcion,
            direccion=direccion_obj,
        )

        # foto de perfil (opcional)
        foto = request.FILES.get("foto_perfil")
        if foto:
            user.foto_perfil = foto

        user.set_password(password)
        user.save()

        # 5) crear perfil cuidador
        anios_experiencia = int(request.data.get("anios_experiencia", 0) or 0)
        # si tu modelo exige >0 podrías forzar mínimo 0 o 1
        Cuidador.objects.create(usuario=user, anios_experiencia=max(0, anios_experiencia))

        # 6) categorías (TipoCliente) por ids
        raw_cats = request.data.get("categorias_ids")
        cats_list = []
        if isinstance(raw_cats, list):
            cats_list = [int(x) for x in raw_cats]
        elif isinstance(raw_cats, str) and raw_cats.strip():
            # podría venir como JSON string "[]"
            try:
                parsed = json.loads(raw_cats)
                if isinstance(parsed, list):
                    cats_list = [int(x) for x in parsed]
            except Exception:
                # también podría venir "1,2,3"
                try:
                    cats_list = [int(x) for x in raw_cats.split(",") if x.strip()]
                except Exception:
                    cats_list = []

        if cats_list:
            qs = TipoCliente.objects.filter(id__in=cats_list)
            user.cuidador.tipos_cliente.set(qs)

        # 7) experiencias (JSON string)
        raw_exps = request.data.get("experiencias")
        if raw_exps:
            try:
                exps = json.loads(raw_exps)
                if not isinstance(exps, list):
                    raise ValueError
            except Exception:
                return Response({"detail": "experiencias debe ser un JSON array."}, status=400)

            to_create = []
            for e in exps:
                desc = (e.get("descripcion") or "").strip()
                fi_s = e.get("fecha_inicio")
                ff_s = e.get("fecha_fin")
                if not desc or not fi_s or not ff_s:
                    return Response({"detail": "cada experiencia requiere descripcion, fecha_inicio y fecha_fin."}, status=400)
                try:
                    fi = self._parse_dt(fi_s)
                    ff = self._parse_dt(ff_s)
                except ValueError as ex:
                    return Response({"detail": str(ex)}, status=400)
                to_create.append(Experiencia(cuidador=user, descripcion=desc, fecha_inicio=fi, fecha_fin=ff))
            if to_create:
                Experiencia.objects.bulk_create(to_create)

        # 8) certificados (archivos)
        files = request.FILES.getlist("certificados")
        names = request.data.getlist("certificados_nombres")
        for idx, f in enumerate(files):
            label = names[idx] if idx < len(names) and names[idx] else f.name
            Certificacion.objects.create(cuidador=user, nombre=label, archivo=f)
        
        print("Usuario cuidador creado:", user.username, user.email, user.id)

    
        payload = self._build_read_payload(request, user)
        return Response(payload, status=201)


# --------------------------
# Perfil de Cliente (GET/PATCH/POST)
# --------------------------

class ClientePerfilView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def _ensure_cliente(self, user):
        return hasattr(user, "cliente")

    def _build_read_payload(self, request, user):
        u = user
        dir_str = u.direccion.direccion if u.direccion else ""
        prov = u.direccion.ciudad.provincia.nombre if u.direccion else ""
        ciu = u.direccion.ciudad.nombre if u.direccion else ""

        cl = u.cliente
        cats = list(cl.tipos_cliente.values_list("nombre", flat=True))
        fotos = list(FotoCliente.objects.filter(cliente=cl).values_list("imagen", flat=True))
        fotos_abs = []
        for path in fotos:
            url = f"{request.build_absolute_uri('/')[:-1]}{path.url if hasattr(path,'url') else path}"
            fotos_abs.append(url)

        return {
            "username": u.username,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "email": u.email,
            "telefono": u.telefono or "",
            "direccion": dir_str,
            "fecha_nacimiento": u.fecha_nacimiento,
            "descripcion": u.descripcion or "",
            "foto_perfil": request.build_absolute_uri(u.foto_perfil.url) if u.foto_perfil else "",
            "fotos": fotos_abs,
            "categorias": cats,
            "provincia": prov,
            "ciudad": ciu,
        }

    def get(self, request):
        user = request.user
        if not self._ensure_cliente(user):
            return Response({"detail": "No es cliente."}, status=403)
        return Response(self._build_read_payload(request, user), status=200)

    @transaction.atomic
    def patch(self, request):
        user = request.user
        if not self._ensure_cliente(user):
            return Response({"detail": "No es cliente."}, status=403)

        # básicos
        for field in ["first_name", "last_name", "email", "telefono", "fecha_nacimiento", "descripcion"]:
            if field in request.data and request.data.get(field) not in (None, ""):
                setattr(user, field, request.data.get(field))

        if request.FILES.get("foto_perfil"):
            user.foto_perfil = request.FILES["foto_perfil"]

        # dirección
        prov_name = request.data.get("provincia")
        city_name = request.data.get("ciudad")
        addr_str = request.data.get("direccion")
        if prov_name and city_name and addr_str:
            prov, _ = Provincia.objects.get_or_create(nombre=prov_name)
            ciu, _ = Ciudad.objects.get_or_create(nombre=city_name, provincia=prov)
            dir_obj, _ = Direccion.objects.get_or_create(direccion=addr_str, ciudad=ciu)
            user.direccion = dir_obj

        user.save()

        # categorías (por nombres en JSON string)
        raw_cats = request.data.get("categorias")
        cats = []
        if isinstance(raw_cats, str) and raw_cats.strip():
            try:
                parsed = json.loads(raw_cats)
                if isinstance(parsed, list):
                    cats = list(TipoCliente.objects.filter(nombre__in=parsed))
            except Exception:
                cats = []
        if cats:
            user.cliente.tipos_cliente.set(cats)

        # fotos nuevas (append)
        for f in request.FILES.getlist("fotos"):
            FotoCliente.objects.create(cliente=user.cliente, imagen=f)

        return Response(self._build_read_payload(request, user), status=200)

    @transaction.atomic
    def post(self, request):
        """Registro de cliente (similar a cuidador)."""
        User = get_user_model()
        first_name = request.data.get("first_name", "").strip()
        last_name = request.data.get("last_name", "").strip()
        email = request.data.get("email", "").strip().lower()
        telefono = request.data.get("telefono", "").strip()
        fecha_nac = request.data.get("fecha_nacimiento")
        descripcion = request.data.get("descripcion", "")
        password = request.data.get("password")
        confirm = request.data.get("confirm_password")
        if not all([first_name, last_name, email, telefono, fecha_nac, descripcion, password, confirm]):
            return Response({"detail": "Campos obligatorios faltantes."}, status=400)
        if password != confirm:
            return Response({"detail": "Las contraseñas no coinciden."}, status=400)
        if User.objects.filter(email=email).exists():
            return Response({"detail": "Ya existe un usuario con ese email."}, status=400)

        # direccion
        provincia = request.data.get("provincia")
        ciudad = request.data.get("ciudad")
        direccion = request.data.get("direccion")
        dir_obj = None
        if provincia and ciudad and direccion:
            prov, _ = Provincia.objects.get_or_create(nombre=provincia)
            ciu, _ = Ciudad.objects.get_or_create(nombre=ciudad, provincia=prov)
            dir_obj, _ = Direccion.objects.get_or_create(direccion=direccion, ciudad=ciu)

        username = (first_name or "user").lower() + "." + (last_name or "user").lower()
        i = 1
        base = username
        while User.objects.filter(username=username).exists():
            username = f"{base}-{i}"
            i += 1

        user = User(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            telefono=telefono,
            descripcion=descripcion,
            direccion=dir_obj,
        )
        if fecha_nac:
            try:
                user.fecha_nacimiento = datetime.fromisoformat(fecha_nac).date()
            except Exception:
                pass
        foto = request.FILES.get("foto_perfil")
        if foto:
            user.foto_perfil = foto
        user.set_password(password)
        user.save()

        # crear cliente y setear categorias
        Cliente.objects.create(usuario=user)
        raw_cats = request.data.get("categorias")
        if raw_cats:
            try:
                parsed = json.loads(raw_cats)
                if isinstance(parsed, list):
                    qs = TipoCliente.objects.filter(nombre__in=parsed)
                    user.cliente.tipos_cliente.set(qs)
            except Exception:
                pass

        # fotos
        for f in request.FILES.getlist("fotos"):
            FotoCliente.objects.create(cliente=user.cliente, imagen=f)

        return Response(self._build_read_payload(request, user), status=201)

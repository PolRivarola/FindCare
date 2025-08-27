# users/views_public.py
from django.utils.timezone import localtime
from django.db.models import Avg, Count
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from django.contrib.auth import get_user_model
from location.models import Direccion
from users.models import Cliente, Cuidador, TipoCliente, FotoCliente
from services.models import Calificacion, Experiencia, Certificacion

User = get_user_model()

def _full_media_url(request, f):
    if not f:
        return ""
    try:
        return request.build_absolute_uri(f.url)
    except Exception:
        return ""

class PerfilPublicoView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk: int):
        user = get_object_or_404(User, pk=pk)

        es_cliente = hasattr(user, "cliente")
        es_cuidador = hasattr(user, "cuidador")
        tipo_usuario = "cuidador" if es_cuidador else ("cliente" if es_cliente else "cliente")

        direccion_txt = ""
        provincia = ""
        ciudad = ""
        if user.direccion_id:
            dir: Direccion = user.direccion
            direccion_txt = dir.direccion
            ciudad = dir.ciudad.nombre
            provincia = dir.ciudad.provincia.nombre

        foto_perfil = _full_media_url(request, user.foto_perfil) if user.foto_perfil else ""

        categorias = []
        if es_cuidador:
            categorias = list(user.cuidador.tipos_cliente.values_list("nombre", flat=True))
        elif es_cliente:
            categorias = list(user.cliente.tipos_cliente.values_list("nombre", flat=True))

        fotos = []
        if es_cliente:
            fotos = [
                _full_media_url(request, f.imagen)
                for f in user.cliente.fotos.all()
            ]

        agg = Calificacion.objects.filter(receptor=user).aggregate(
            rating=Avg("puntuacion"),
            total=Count("id"),
        )
        rating = round(agg["rating"], 2) if agg["rating"] is not None else None
        reviews_total = agg["total"] or 0

        # listado (paginable si quieres; aquí mandamos las últimas 20)
        califs_qs = (
            Calificacion.objects
            .filter(receptor=user)
            .select_related("autor")
            .order_by("-creado_en")[:20]
        )

        def _author_name(u: User) -> str: # type: ignore
            full = f"{u.first_name or ''} {u.last_name or ''}".strip()
            return full or u.username
        
        reviews = [
            {
                "id": c.id,
                "rating": c.puntuacion,
                "author": _author_name(c.autor),
                "date": c.creado_en.strftime("%d/%m/%Y"),
                "comment": c.comentario or "",
            }
            for c in califs_qs
        ]

        experiencias = []
        certificados = []
        especialidad = None
        experiencia_anios = None
        if es_cuidador:
            experiencia_anios = user.cuidador.anios_experiencia
            especialidad = user.descripcion_min or None

            experiencias = [
                {
                    "descripcion": e.descripcion,
                    "fecha_inicio": e.fecha_inicio.isoformat(),
                    "fecha_fin": e.fecha_fin.isoformat(),
                }
                for e in Experiencia.objects.filter(cuidador=user).order_by("-fecha_fin", "-fecha_inicio")
            ]
            certificados = [
                {
                    "file": _full_media_url(request, c.archivo),
                    "name": c.nombre,  
                }
                for c in Certificacion.objects.filter(cuidador=user).order_by("nombre")
            ]

        payload = {
            "id": user.id,
            "username": user.username,
            "first_name": user.first_name or "",
            "last_name": user.last_name or "",
            "email": user.email or "",
            "telefono": user.telefono or "",
            "direccion": direccion_txt,
            "fecha_nacimiento": user.fecha_nacimiento.isoformat() if user.fecha_nacimiento else "1970-01-01",
            "descripcion": user.descripcion or "",
            "foto_perfil": foto_perfil,
            "fotos": fotos,
            "categorias": categorias,
            "provincia": provincia,
            "ciudad": ciudad,
            "rating": rating,              
            "reviews": reviews,            
            "reviews_count": reviews_total, 
            "experiencia": experiencia_anios,    
            "especialidad": especialidad,         
            "precio": None,               
            "disponible": True,           
            "tipo_usuario": tipo_usuario, 
            "certificados": certificados, 
            "experiencias": experiencias, 
        }
        return Response(payload)

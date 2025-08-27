from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, NotFound
from django.db.models import Q

from .models import Conversacion, Mensaje
from .serializer import ConversacionListSerializer, MensajeSerializer

class IsParticipant(permissions.BasePermission):
    def has_object_permission(self, request, view, obj: Conversacion):
        return obj.cliente_id == request.user.id or obj.cuidador_id == request.user.id

class ConversacionViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ConversacionListSerializer

    def get_queryset(self):
        user = self.request.user
        return Conversacion.objects.filter(Q(cliente=user) | Q(cuidador=user)).order_by("-actualizado_en")

    @action(detail=True, methods=["get", "post"], url_path="mensajes")
    def mensajes(self, request, pk=None):
        conv = self.get_object()
        if not (conv.cliente_id == request.user.id or conv.cuidador_id == request.user.id):
            raise PermissionDenied("No participás en esta conversación.")

        if request.method.lower() == "get":
            qs = conv.mensajes.select_related("emisor").all()
            # marcar como leídos los no propios
            no_propios = qs.exclude(emisor=request.user)
            for m in no_propios:
                m.leido_por.add(request.user)
            ser = MensajeSerializer(qs, many=True, context={"request": request})
            return Response(ser.data)

        # POST
        contenido = (request.data.get("content") or request.data.get("contenido") or "").strip()
        if not contenido:
            return Response({"detail": "content es requerido"}, status=400)
        msg = Mensaje.objects.create(conversacion=conv, emisor=request.user, contenido=contenido)
        conv.save(update_fields=["actualizado_en"])
        ser = MensajeSerializer(msg, context={"request": request})
        return Response(ser.data, status=201)


class MensajeViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MensajeSerializer

    def get_queryset(self):
        user = self.request.user
        return Mensaje.objects.filter(
            Q(conversacion__cliente=user) | Q(conversacion__cuidador=user)
        ).select_related("emisor", "conversacion")


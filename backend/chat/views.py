from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, NotFound
from django.db.models import Q
from django.db.models import Count
from django.contrib.auth import get_user_model

from .models import Conversacion, Mensaje
from .serializer import ConversacionListSerializer, MensajeSerializer
from .pagination import ConversationPagination, MessagePagination

class IsParticipant(permissions.BasePermission):
    def has_object_permission(self, request, view, obj: Conversacion):
        return obj.cliente_id == request.user.id or obj.cuidador_id == request.user.id

class ConversacionViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ConversacionListSerializer
    pagination_class = ConversationPagination

    def get_queryset(self):
        user = self.request.user
        return Conversacion.objects.filter(Q(cliente=user) | Q(cuidador=user)).order_by("-actualizado_en")

    @action(detail=False, methods=["post"], url_path="ensure")
    def ensure(self, request):
        other_id = request.data.get("user_id")
        if not other_id:
            return Response({"detail": "user_id es requerido"}, status=400)

        User = get_user_model()
        try:
            other = User.objects.get(pk=other_id)
        except User.DoesNotExist:
            raise NotFound("Usuario no encontrado")

        me = request.user
        if me.id == other.id:
            return Response({"detail": "No se puede conversar con uno mismo"}, status=400)

        me_is_cliente = hasattr(me, "cliente")
        me_is_cuidador = hasattr(me, "cuidador")
        other_is_cliente = hasattr(other, "cliente")
        other_is_cuidador = hasattr(other, "cuidador")

        if me_is_cliente and other_is_cuidador:
            cliente_user, cuidador_user = me, other
        elif me_is_cuidador and other_is_cliente:
            cliente_user, cuidador_user = other, me
        else:
            if other_is_cuidador:
                cliente_user, cuidador_user = me, other
            elif other_is_cliente:
                cliente_user, cuidador_user = other, me
            else:
                return Response({"detail": "No se pudo determinar roles cliente/cuidador"}, status=400)

        conv, _ = Conversacion.objects.get_or_create(cliente=cliente_user, cuidador=cuidador_user)
        return Response({"id": conv.id})

    @action(detail=False, methods=["get"], url_path="unread")
    def unread(self, request):
        user = request.user
        total = Mensaje.objects.filter(
            Q(conversacion__cliente=user) | Q(conversacion__cuidador=user)
        ).exclude(emisor=user).exclude(leido_por=user).count()
        return Response({"has_unread": total > 0, "count": total})

    @action(detail=True, methods=["get", "post"], url_path="mensajes")
    def mensajes(self, request, pk=None):
        conv = self.get_object()
        if not (conv.cliente_id == request.user.id or conv.cuidador_id == request.user.id):
            raise PermissionDenied("No participás en esta conversación.")

        if request.method.lower() == "get":
            paginator = MessagePagination()
            qs = conv.mensajes.select_related("emisor").order_by("-creado_en")
            page = paginator.paginate_queryset(qs, request, view=self)
            mensajes = list(page)

            for m in mensajes:
                if m.emisor_id != request.user.id:
                    m.leido_por.add(request.user)

            ser = MensajeSerializer(mensajes, many=True, context={"request": request})
            return paginator.get_paginated_response(ser.data)

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


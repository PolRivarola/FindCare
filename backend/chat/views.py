from rest_framework import viewsets, permissions
from .models import Conversacion, Mensaje
from .serializer import ConversacionSerializer, MensajeSerializer

class ConversacionViewSet(viewsets.ModelViewSet):
    queryset = Conversacion.objects.all()
    serializer_class = ConversacionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Conversacion.objects.filter(remitente=user).union(
                    Conversacion.objects.filter(receptor=user)
                ).order_by('-fecha_creacion')

class MensajeViewSet(viewsets.ModelViewSet):
    queryset = Mensaje.objects.all()
    serializer_class = MensajeSerializer


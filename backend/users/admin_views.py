from django.db.models import Count, Q
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from services.models import Calificacion, Servicio
from users.models import Cuidador, Cliente

Usuario = get_user_model()

class AdminStatsView(APIView):
    """
    GET /api/admin/stats/
    Returns platform statistics for admin dashboard
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Check if user is admin (you might want to add proper admin permission check)
        if not request.user.is_staff:
            return Response({"detail": "Permission denied"}, status=403)

        # Get total users
        total_usuarios = Usuario.objects.count()
        
        # Get active cuidadores (users with cuidador profile)
        cuidadores_activos = Cuidador.objects.count()
        
        # Get active clientes (users with cliente profile)
        clientes_activos = Cliente.objects.count()
        
        # Get flagged ratings count
        calificaciones_pendientes = Calificacion.objects.filter(reportada=True).count()
        
        # Get completed services
        servicios_completados = Servicio.objects.filter(aceptado=True).count()
        
        # Calculate monthly revenue (placeholder - you might want to implement actual revenue tracking)
        ingresos_mes = "$0"  # Placeholder

        return Response({
            "totalUsuarios": total_usuarios,
            "cuidadoresActivos": cuidadores_activos,
            "clientesActivos": clientes_activos,
            "calificacionesPendientes": calificaciones_pendientes,
            "serviciosCompletados": servicios_completados,
            "ingresosMes": ingresos_mes,
        })


class AdminFlaggedRatingsView(APIView):
    """
    GET /api/admin/flagged-ratings/
    Returns all flagged ratings for admin review
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Check if user is admin
        if not request.user.is_staff:
            return Response({"detail": "Permission denied"}, status=403)

        # Get all flagged ratings with related user information
        flagged_ratings = Calificacion.objects.filter(
            reportada=True
        ).select_related(
            'autor', 'receptor', 'servicio'
        ).order_by('-creado_en')

        ratings_data = []
        for rating in flagged_ratings:
            # Get cliente and cuidador names from the service
            servicio = rating.servicio
            cliente_nombre = f"{servicio.cliente.first_name} {servicio.cliente.last_name}".strip() or servicio.cliente.username
            cuidador_nombre = f"{servicio.receptor.first_name} {servicio.receptor.last_name}".strip() or servicio.receptor.username
            
            ratings_data.append({
                "id": rating.id,
                "cliente": cliente_nombre,
                "cuidador": cuidador_nombre,
                "rating": rating.puntuacion,
                "comentario": rating.comentario or "",
                "fecha": rating.creado_en.strftime("%Y-%m-%d"),
                "reportado": "Contenido inapropiado",  # You might want to add a reason field to Calificacion model
                "estado": "Pendiente",  # You might want to add a status field
            })

        return Response(ratings_data)


class AdminRatingActionView(APIView):
    """
    POST /api/admin/rating-action/
    Handle approve/delete actions for flagged ratings
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Check if user is admin
        if not request.user.is_staff:
            return Response({"detail": "Permission denied"}, status=403)

        rating_id = request.data.get('rating_id')
        action = request.data.get('action')  # 'approve' or 'delete'

        if not rating_id or not action:
            return Response({"detail": "rating_id and action are required"}, status=400)

        try:
            rating = Calificacion.objects.get(id=rating_id, reportada=True)
        except Calificacion.DoesNotExist:
            return Response({"detail": "Rating not found"}, status=404)

        if action == 'approve':
            # Remove the flag
            rating.reportada = False
            rating.save()
            return Response({"message": "Rating approved successfully"})
        
        elif action == 'delete':
            # Delete the rating
            rating.delete()
            return Response({"message": "Rating deleted successfully"})
        
        else:
            return Response({"detail": "Invalid action. Use 'approve' or 'delete'"}, status=400)

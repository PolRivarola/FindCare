"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from users.views_public import PerfilPublicoView
from users.views import MeView, RegistroClienteView, RegistroCuidadorView, UsuarioViewSet,ClienteViewSet, CuidadorViewSet, TipoClienteViewSet, CuidadorSearchView
from users.admin_views import AdminStatsView, AdminFlaggedRatingsView, AdminRatingActionView
from location.views import CiudadViewSet, DireccionViewSet, ProvinciaViewSet
from chat.views import ConversacionViewSet, MensajeViewSet
from rest_framework_simplejwt.views import TokenRefreshView
from users.views_auth import LoginView, LogoutView
from django.conf import settings
from django.conf.urls.static import static
from services.views import (
    CalificacionViewSet,
    CuidadorPerfilView,
    ClientePerfilView,
    ServicioViewSet,
    ExperienciaViewSet,
    CertificacionViewSet,
    DiaSemanalViewSet,
    HorarioDiarioViewSet
)

router = DefaultRouter()
router.register(r'conversaciones', ConversacionViewSet, basename='conversacion')
router.register(r'mensajes', MensajeViewSet, basename='mensaje')
router.register(r'provincias', ProvinciaViewSet)
router.register(r'ciudades', CiudadViewSet)
router.register(r'direcciones', DireccionViewSet)
router.register(r'usuarios', UsuarioViewSet)
router.register(r'clientes', ClienteViewSet)
router.register(r'cuidadores', CuidadorViewSet)
router.register(r'tipos-cliente', TipoClienteViewSet)
router.register(r'servicios', ServicioViewSet)
router.register(r'calificaciones', CalificacionViewSet)
router.register(r'experiencias', ExperienciaViewSet)
router.register(r'certificaciones', CertificacionViewSet)
router.register(r'dias-semanales', DiaSemanalViewSet)
router.register(r'horarios-diarios', HorarioDiarioViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/registro/cliente/', RegistroClienteView.as_view(), name='registro-cliente'),
    path('api/registro/cuidador/', RegistroCuidadorView.as_view(), name='registro-cuidador'),
    path("api/auth/login/", LoginView.as_view(), name="auth_login"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="auth_refresh"),
    path("api/auth/logout/", LogoutView.as_view(), name="auth_logout"),
    path("api/users/me/", MeView.as_view(), name="users_me"),
    path("api/perfil/<int:pk>/",  PerfilPublicoView.as_view(), name="perfil_publico"),  
    path("api/cuidador/perfil/", CuidadorPerfilView.as_view(), name="cuidador_perfil"),
    path("api/cliente/perfil/", ClientePerfilView.as_view(), name="cliente_perfil"),
    path("api/search/", CuidadorSearchView.as_view(), name="cuidadores_search"),
    
    # Admin endpoints
    path("api/admin/stats/", AdminStatsView.as_view(), name="admin_stats"),
    path("api/admin/flagged-ratings/", AdminFlaggedRatingsView.as_view(), name="admin_flagged_ratings"),
    path("api/admin/rating-action/", AdminRatingActionView.as_view(), name="admin_rating_action"),

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'usuarios', views.UsuarioViewSet)
router.register(r'proveedores', views.ProveedorViewSet)
router.register(r'clientes', views.ClienteViewSet)
router.register(r'categorias', views.CategoriaViewSet)
router.register(r'ubicaciones', views.UbicacionViewSet)
router.register(r'articulos', views.ArticuloViewSet)
router.register(r'movimientos', views.MovimientoViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/auth/login/', views.login_view, name='login'),
    path('api/auth/refresh/', views.refresh_token_view, name='token_refresh'),
    path('api/auth/me/', views.me_view, name='me'),
    path('api/dashboard/', views.dashboard_view, name='dashboard'),
    path('api/alertas/', views.alertas_stock_view, name='alertas'),
    path('api/configuracion/', views.configuracion_view, name='configuracion'),
]

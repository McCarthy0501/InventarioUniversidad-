from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model, authenticate
from django.db.models import Count, Sum, F, Q
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from django_filters.rest_framework import DjangoFilterBackend
from openpyxl import Workbook
from django.http import HttpResponse

from .models import Categoria, Ubicacion, Articulo, Movimiento, Proveedor, Cliente, TasaDolar
from .serializers import (
    LoginSerializer, UsuarioSerializer, UsuarioListSerializer,
    ProveedorSerializer, ClienteSerializer,
    CategoriaSerializer, UbicacionSerializer,
    ArticuloListSerializer, ArticuloDetailSerializer,
    MovimientoSerializer, DashboardSerializer, TasaDolarSerializer
)

User = get_user_model()


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.rol == 'admin'


class IsAdminOrOperador(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and request.user.rol in ['admin', 'operador']


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = authenticate(**serializer.validated_data)
    if user is None:
        return Response({'error': 'Credenciales invalidas'}, status=status.HTTP_401_UNAUTHORIZED)
    if not user.is_active:
        return Response({'error': 'Usuario desactivado'}, status=status.HTTP_401_UNAUTHORIZED)
    refresh = RefreshToken.for_user(user)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': UsuarioListSerializer(user).data,
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token_view(request):
    try:
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'Refresh token requerido'}, status=status.HTTP_400_BAD_REQUEST)
        refresh = RefreshToken(refresh_token)
        return Response({'access': str(refresh.access_token)})
    except Exception:
        return Response({'error': 'Token invalido o expirado'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    return Response(UsuarioListSerializer(request.user).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    total_articulos = Articulo.objects.count()
    total_stock = Articulo.objects.aggregate(total=Sum('stock'))['total'] or 0
    articulos_stock_bajo = Articulo.objects.filter(stock__lte=F('stock_minimo'), stock__gt=0).count()
    articulos_agotados = Articulo.objects.filter(stock=0).count()
    articulos_por_categoria = dict(
        Articulo.objects.values('categoria__nombre').annotate(count=Count('id'))
        .filter(categoria__isnull=False).values_list('categoria__nombre', 'count')
    )
    articulos_por_ubicacion = dict(
        Articulo.objects.values('ubicacion__edificio').annotate(count=Count('id'))
        .filter(ubicacion__isnull=False).values_list('ubicacion__edificio', 'count')
    )
    ultimos_movimientos = Movimiento.objects.select_related(
        'articulo', 'usuario', 'proveedor', 'cliente'
    ).order_by('-fecha')[:10]
    valor_inventario = Articulo.objects.aggregate(
        total=Sum(F('stock') * F('precio_compra'))
    )['total'] or 0

    tasa = TasaDolar.objects.first()
    tasa_dolar = float(tasa.tasa) if tasa else 1.0

    ahora = timezone.now()
    hoy = ahora.date()
    inicio_semana = hoy - timedelta(days=hoy.weekday())
    inicio_mes = hoy.replace(day=1)

    def stats_periodo(inicio):
        ventas = Movimiento.objects.filter(tipo='salida', fecha__date__gte=inicio)
        compras = Movimiento.objects.filter(tipo='entrada', fecha__date__gte=inicio)
        return {
            'ventas_unidades': ventas.aggregate(t=Sum('cantidad'))['t'] or 0,
            'ventas_usd': float(ventas.aggregate(t=Sum(F('cantidad') * F('precio_unitario')))['t'] or 0),
            'compras_unidades': compras.aggregate(t=Sum('cantidad'))['t'] or 0,
            'compras_usd': float(compras.aggregate(t=Sum(F('cantidad') * F('precio_unitario')))['t'] or 0),
        }

    hoy_stats = stats_periodo(hoy)
    semana_stats = stats_periodo(inicio_semana)
    mes_stats = stats_periodo(inicio_mes)

    data = {
        'total_articulos': total_articulos,
        'total_stock': total_stock,
        'articulos_stock_bajo': articulos_stock_bajo,
        'articulos_agotados': articulos_agotados,
        'articulos_por_categoria': articulos_por_categoria,
        'articulos_por_ubicacion': articulos_por_ubicacion,
        'ultimos_movimientos': MovimientoSerializer(ultimos_movimientos, many=True).data,
        'valor_inventario': valor_inventario,
        'tasa_dolar': tasa_dolar,
        'ventas_hoy_unidades': hoy_stats['ventas_unidades'],
        'ventas_hoy_usd': hoy_stats['ventas_usd'],
        'compras_hoy_unidades': hoy_stats['compras_unidades'],
        'compras_hoy_usd': hoy_stats['compras_usd'],
        'ventas_semana_unidades': semana_stats['ventas_unidades'],
        'ventas_semana_usd': semana_stats['ventas_usd'],
        'compras_semana_unidades': semana_stats['compras_unidades'],
        'compras_semana_usd': semana_stats['compras_usd'],
        'ventas_mes_unidades': mes_stats['ventas_unidades'],
        'ventas_mes_usd': mes_stats['ventas_usd'],
        'compras_mes_unidades': mes_stats['compras_unidades'],
        'compras_mes_usd': mes_stats['compras_usd'],
    }
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def alertas_stock_view(request):
    alertas = Articulo.objects.filter(
        stock__lte=F('stock_minimo')
    ).select_related('categoria', 'proveedor')
    data = [{
        'id': a.id,
        'codigo_inventario': a.codigo_inventario,
        'nombre': a.nombre,
        'stock': a.stock,
        'stock_minimo': a.stock_minimo,
        'estado': 'agotado' if a.stock == 0 else 'bajo',
        'categoria_nombre': a.categoria.nombre if a.categoria else None,
        'proveedor_nombre': a.proveedor.nombre if a.proveedor else None,
        'precio_compra': float(a.precio_compra) if a.precio_compra else None,
    } for a in alertas]
    return Response(data)


def export_articulos_excel(request):
    wb = Workbook()
    ws = wb.active
    ws.title = 'Articulos'

    headers = ['Codigo', 'Nombre', 'Descripcion', 'Categoria', 'Ubicacion', 'Proveedor',
               'Stock', 'Stock Minimo', 'Precio Compra', 'Precio Venta',
               'Estado', 'Marca', 'Modelo', 'N Serie']
    ws.append(headers)

    articulos = Articulo.objects.select_related('categoria', 'ubicacion', 'proveedor').all()
    for a in articulos:
        ws.append([
            a.codigo_inventario, a.nombre, a.descripcion,
            a.categoria.nombre if a.categoria else '',
            str(a.ubicacion) if a.ubicacion else '',
            a.proveedor.nombre if a.proveedor else '',
            a.stock, a.stock_minimo,
            float(a.precio_compra) if a.precio_compra else 0,
            float(a.precio_venta) if a.precio_venta else 0,
            a.get_estado_display(), a.marca, a.modelo, a.numero_serie,
        ])

    response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = 'attachment; filename=articulos.xlsx'
    wb.save(response)
    return response


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['rol', 'is_active']
    search_fields = ['username', 'first_name', 'last_name', 'email', 'departamento']

    def get_serializer_class(self):
        if self.action == 'list':
            return UsuarioListSerializer
        return UsuarioSerializer


class ProveedorViewSet(viewsets.ModelViewSet):
    queryset = Proveedor.objects.all()
    serializer_class = ProveedorSerializer
    permission_classes = [IsAuthenticated, IsAdminOrOperador]
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre', 'contacto']
    pagination_class = None


class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [IsAuthenticated, IsAdminOrOperador]
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre', 'contacto']
    pagination_class = None


class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [IsAuthenticated, IsAdminOrOperador]
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre']
    pagination_class = None


class UbicacionViewSet(viewsets.ModelViewSet):
    queryset = Ubicacion.objects.all()
    serializer_class = UbicacionSerializer
    permission_classes = [IsAuthenticated, IsAdminOrOperador]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['edificio']
    search_fields = ['edificio', 'aula']
    pagination_class = None


class ArticuloViewSet(viewsets.ModelViewSet):
    queryset = Articulo.objects.select_related('categoria', 'ubicacion', 'proveedor').all()
    permission_classes = [IsAuthenticated, IsAdminOrOperador]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['estado', 'categoria', 'ubicacion', 'proveedor']
    search_fields = ['codigo_inventario', 'nombre', 'marca', 'modelo', 'numero_serie', 'descripcion']
    ordering_fields = ['nombre', 'codigo_inventario', 'fecha_creacion', 'stock', 'precio_venta']

    def get_serializer_class(self):
        if self.action == 'list':
            return ArticuloListSerializer
        return ArticuloDetailSerializer

    @action(detail=False, methods=['get'], url_path='exportar')
    def exportar(self, request):
        return export_articulos_excel(request)

    @action(detail=False, methods=['get'], url_path='alertas')
    def alertas(self, request):
        return alertas_stock_view(request)


class MovimientoViewSet(viewsets.ModelViewSet):
    queryset = Movimiento.objects.select_related(
        'articulo', 'usuario', 'proveedor', 'cliente'
    ).all()
    serializer_class = MovimientoSerializer
    permission_classes = [IsAuthenticated, IsAdminOrOperador]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['tipo', 'articulo', 'usuario']

    def perform_create(self, serializer):
        movimiento = serializer.save()
        articulo = movimiento.articulo
        cantidad = movimiento.cantidad

        if movimiento.tipo == 'entrada':
            articulo.stock += cantidad
        elif movimiento.tipo == 'salida':
            articulo.stock = max(0, articulo.stock - cantidad)
        elif movimiento.tipo == 'devolucion':
            articulo.stock += cantidad
        elif movimiento.tipo == 'ajuste':
            articulo.stock = cantidad

        if articulo.stock == 0:
            articulo.estado = 'agotado'
        elif articulo.stock <= articulo.stock_minimo:
            articulo.estado = 'disponible'
        else:
            articulo.estado = 'disponible'

        articulo.save()


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def configuracion_view(request):
    if request.method == 'GET':
        tasa = TasaDolar.objects.first()
        if tasa:
            return Response({'id': tasa.id, 'tasa': float(tasa.tasa), 'fecha_actualizacion': tasa.fecha_actualizacion})
        return Response({'id': None, 'tasa': 1.0, 'fecha_actualizacion': None})

    if request.method == 'PUT':
        if request.user.rol != 'admin':
            return Response({'error': 'Solo administradores'}, status=status.HTTP_403_FORBIDDEN)
        tasa_valor = request.data.get('tasa')
        if tasa_valor is None:
            return Response({'error': 'tasa requerida'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            tasa_valor = Decimal(str(tasa_valor))
        except Exception:
            return Response({'error': 'tasa inválida'}, status=status.HTTP_400_BAD_REQUEST)
        if tasa_valor <= 0 or tasa_valor > Decimal('999999999999.99'):
            return Response({'error': 'tasa fuera de rango (0.01 - 999999999999.99)'}, status=status.HTTP_400_BAD_REQUEST)
        tasa = TasaDolar.objects.first()
        if tasa:
            tasa.tasa = tasa_valor
            tasa.save()
        else:
            tasa = TasaDolar.objects.create(tasa=tasa_valor)
        return Response({'id': tasa.id, 'tasa': float(tasa.tasa), 'fecha_actualizacion': tasa.fecha_actualizacion})

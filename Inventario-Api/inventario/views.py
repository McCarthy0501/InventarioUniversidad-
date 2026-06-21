from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model, authenticate
from django.db.models import Count, Sum, Q
from django_filters.rest_framework import DjangoFilterBackend
from openpyxl import Workbook
from django.http import HttpResponse

from .models import Categoria, Ubicacion, Articulo, Movimiento
from .serializers import (
    LoginSerializer, UsuarioSerializer, UsuarioListSerializer,
    CategoriaSerializer, UbicacionSerializer,
    ArticuloListSerializer, ArticuloDetailSerializer,
    MovimientoSerializer, DashboardSerializer
)

User = get_user_model()


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and request.user.rol == 'admin'


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
    username = serializer.validated_data['username']
    password = serializer.validated_data['password']
    user = authenticate(username=username, password=password)
    if user is None:
        return Response({'error': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)
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
        return Response({'error': 'Token inválido o expirado'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    return Response(UsuarioListSerializer(request.user).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    total_articulos = Articulo.objects.count()
    articulos_por_estado = dict(
        Articulo.objects.values('estado').annotate(count=Count('id')).values_list('estado', 'count')
    )
    articulos_por_categoria = dict(
        Articulo.objects.values('categoria__nombre').annotate(count=Count('id'))
        .filter(categoria__isnull=False).values_list('categoria__nombre', 'count')
    )
    articulos_por_ubicacion = dict(
        Articulo.objects.values('ubicacion__edificio').annotate(count=Count('id'))
        .filter(ubicacion__isnull=False).values_list('ubicacion__edificio', 'count')
    )
    ultimos_movimientos = Movimiento.objects.select_related(
        'articulo', 'usuario', 'ubicacion_origen', 'ubicacion_destino'
    ).order_by('-fecha')[:10]
    valor_total = Articulo.objects.aggregate(total=Sum('valor'))['total'] or 0

    data = {
        'total_articulos': total_articulos,
        'articulos_por_estado': articulos_por_estado,
        'articulos_por_categoria': articulos_por_categoria,
        'articulos_por_ubicacion': articulos_por_ubicacion,
        'ultimos_movimientos': MovimientoSerializer(ultimos_movimientos, many=True).data,
        'valor_total': valor_total,
    }
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_articulos_excel(request):
    wb = Workbook()
    ws = wb.active
    ws.title = 'Artículos'

    headers = ['Código', 'Nombre', 'Descripción', 'Categoría', 'Ubicación', 'Responsable',
               'Estado', 'Fecha Adquisición', 'Valor', 'Marca', 'Modelo', 'Nº Serie']
    ws.append(headers)

    articulos = Articulo.objects.select_related('categoria', 'ubicacion', 'responsable').all()
    for a in articulos:
        ws.append([
            a.codigo_inventario, a.nombre, a.descripcion,
            a.categoria.nombre if a.categoria else '',
            str(a.ubicacion) if a.ubicacion else '',
            a.responsable.get_full_name() if a.responsable else '',
            a.get_estado_display(), a.fecha_adquisicion, float(a.valor) if a.valor else 0,
            a.marca, a.modelo, a.numero_serie,
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
    queryset = Articulo.objects.select_related('categoria', 'ubicacion', 'responsable').all()
    permission_classes = [IsAuthenticated, IsAdminOrOperador]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['estado', 'categoria', 'ubicacion', 'responsable']
    search_fields = ['codigo_inventario', 'nombre', 'marca', 'modelo', 'numero_serie', 'descripcion']
    ordering_fields = ['nombre', 'codigo_inventario', 'fecha_creacion', 'fecha_adquisicion', 'valor']

    def get_serializer_class(self):
        if self.action == 'list':
            return ArticuloListSerializer
        return ArticuloDetailSerializer

    @action(detail=False, methods=['get'], url_path='exportar')
    def exportar(self, request):
        return export_articulos_excel(request)


class MovimientoViewSet(viewsets.ModelViewSet):
    queryset = Movimiento.objects.select_related(
        'articulo', 'usuario', 'ubicacion_origen', 'ubicacion_destino'
    ).all()
    serializer_class = MovimientoSerializer
    permission_classes = [IsAuthenticated, IsAdminOrOperador]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['tipo', 'articulo', 'usuario']

    def perform_create(self, serializer):
        movimiento = serializer.save()
        articulo = movimiento.articulo
        tipo = movimiento.tipo

        if tipo == 'salida' or tipo == 'prestamo':
            articulo.estado = 'prestado'
        elif tipo == 'entrada' or tipo == 'devolucion':
            articulo.estado = 'disponible'
        elif tipo == 'mantenimiento':
            articulo.estado = 'mantenimiento'
        elif tipo == 'baja':
            articulo.estado = 'dado_de_baja'

        if tipo == 'traslado' and movimiento.ubicacion_destino:
            articulo.ubicacion = movimiento.ubicacion_destino

        articulo.save()

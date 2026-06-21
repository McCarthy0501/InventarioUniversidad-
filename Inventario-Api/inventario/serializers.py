from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Categoria, Ubicacion, Articulo, Movimiento, Proveedor, Cliente, TasaDolar

User = get_user_model()


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()


class UsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'rol', 'departamento', 'telefono', 'password', 'is_active']
        read_only_fields = ['id']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user


class UsuarioListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'rol', 'departamento', 'telefono', 'is_active']


class ProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedor
        fields = '__all__'


class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'


class UbicacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ubicacion
        fields = '__all__'


class ArticuloListSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    ubicacion_nombre = serializers.SerializerMethodField()
    proveedor_nombre = serializers.CharField(source='proveedor.nombre', read_only=True)
    stock_bajo = serializers.BooleanField(read_only=True)

    class Meta:
        model = Articulo
        fields = ['id', 'codigo_inventario', 'nombre', 'stock', 'stock_minimo',
                  'stock_bajo', 'precio_compra', 'precio_venta', 'estado',
                  'categoria', 'categoria_nombre', 'ubicacion', 'ubicacion_nombre',
                  'proveedor', 'proveedor_nombre', 'marca', 'modelo', 'fecha_creacion']

    def get_ubicacion_nombre(self, obj):
        if obj.ubicacion:
            return str(obj.ubicacion)
        return None


class ArticuloDetailSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    ubicacion_nombre = serializers.SerializerMethodField()
    proveedor_nombre = serializers.CharField(source='proveedor.nombre', read_only=True)
    stock_bajo = serializers.BooleanField(read_only=True)

    class Meta:
        model = Articulo
        fields = '__all__'

    def get_ubicacion_nombre(self, obj):
        if obj.ubicacion:
            return str(obj.ubicacion)
        return None


class MovimientoSerializer(serializers.ModelSerializer):
    articulo_codigo = serializers.CharField(source='articulo.codigo_inventario', read_only=True)
    articulo_nombre = serializers.CharField(source='articulo.nombre', read_only=True)
    usuario_nombre = serializers.SerializerMethodField()
    proveedor_nombre = serializers.CharField(source='proveedor.nombre', read_only=True)
    cliente_nombre = serializers.CharField(source='cliente.nombre', read_only=True)

    class Meta:
        model = Movimiento
        fields = '__all__'

    def get_usuario_nombre(self, obj):
        if obj.usuario:
            return obj.usuario.get_full_name() or obj.usuario.username
        return None


class DashboardSerializer(serializers.Serializer):
    total_articulos = serializers.IntegerField()
    total_stock = serializers.IntegerField()
    articulos_stock_bajo = serializers.IntegerField()
    articulos_agotados = serializers.IntegerField()
    articulos_por_categoria = serializers.DictField()
    articulos_por_ubicacion = serializers.DictField()
    ultimos_movimientos = MovimientoSerializer(many=True)
    valor_inventario = serializers.DecimalField(max_digits=14, decimal_places=2)
    tasa_dolar = serializers.DecimalField(max_digits=10, decimal_places=2)
    ventas_hoy_unidades = serializers.IntegerField()
    ventas_hoy_usd = serializers.DecimalField(max_digits=14, decimal_places=2)
    compras_hoy_unidades = serializers.IntegerField()
    compras_hoy_usd = serializers.DecimalField(max_digits=14, decimal_places=2)
    ventas_semana_unidades = serializers.IntegerField()
    ventas_semana_usd = serializers.DecimalField(max_digits=14, decimal_places=2)
    compras_semana_unidades = serializers.IntegerField()
    compras_semana_usd = serializers.DecimalField(max_digits=14, decimal_places=2)
    ventas_mes_unidades = serializers.IntegerField()
    ventas_mes_usd = serializers.DecimalField(max_digits=14, decimal_places=2)
    compras_mes_unidades = serializers.IntegerField()
    compras_mes_usd = serializers.DecimalField(max_digits=14, decimal_places=2)


class TasaDolarSerializer(serializers.ModelSerializer):
    class Meta:
        model = TasaDolar
        fields = ['id', 'tasa', 'fecha_actualizacion']

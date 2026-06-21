from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Categoria, Ubicacion, Articulo, Movimiento

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
    responsable_nombre = serializers.SerializerMethodField()

    class Meta:
        model = Articulo
        fields = ['id', 'codigo_inventario', 'nombre', 'estado',
                  'categoria', 'categoria_nombre', 'ubicacion', 'ubicacion_nombre',
                  'responsable', 'responsable_nombre', 'marca', 'modelo',
                  'fecha_creacion']

    def get_ubicacion_nombre(self, obj):
        if obj.ubicacion:
            return str(obj.ubicacion)
        return None

    def get_responsable_nombre(self, obj):
        if obj.responsable:
            return obj.responsable.get_full_name() or obj.responsable.username
        return None


class ArticuloDetailSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    ubicacion_nombre = serializers.SerializerMethodField()
    responsable_nombre = serializers.SerializerMethodField()

    class Meta:
        model = Articulo
        fields = '__all__'

    def get_ubicacion_nombre(self, obj):
        if obj.ubicacion:
            return str(obj.ubicacion)
        return None

    def get_responsable_nombre(self, obj):
        if obj.responsable:
            return obj.responsable.get_full_name() or obj.responsable.username
        return None


class MovimientoSerializer(serializers.ModelSerializer):
    articulo_codigo = serializers.CharField(source='articulo.codigo_inventario', read_only=True)
    articulo_nombre = serializers.CharField(source='articulo.nombre', read_only=True)
    usuario_nombre = serializers.SerializerMethodField()
    ubicacion_origen_nombre = serializers.SerializerMethodField()
    ubicacion_destino_nombre = serializers.SerializerMethodField()

    class Meta:
        model = Movimiento
        fields = '__all__'

    def get_usuario_nombre(self, obj):
        if obj.usuario:
            return obj.usuario.get_full_name() or obj.usuario.username
        return None

    def get_ubicacion_origen_nombre(self, obj):
        if obj.ubicacion_origen:
            return str(obj.ubicacion_origen)
        return None

    def get_ubicacion_destino_nombre(self, obj):
        if obj.ubicacion_destino:
            return str(obj.ubicacion_destino)
        return None


class DashboardSerializer(serializers.Serializer):
    total_articulos = serializers.IntegerField()
    articulos_por_estado = serializers.DictField()
    articulos_por_categoria = serializers.DictField()
    articulos_por_ubicacion = serializers.DictField()
    ultimos_movimientos = MovimientoSerializer(many=True)
    valor_total = serializers.DecimalField(max_digits=14, decimal_places=2)

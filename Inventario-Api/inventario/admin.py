from django.contrib import admin
from .models import Usuario, Proveedor, Cliente, Categoria, Ubicacion, Articulo, Movimiento, TasaDolar


@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'rol', 'departamento', 'is_active']
    list_filter = ['rol', 'is_active']
    search_fields = ['username', 'first_name', 'last_name', 'email']


@admin.register(Proveedor)
class ProveedorAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'contacto', 'telefono', 'email', 'activo']
    list_filter = ['activo']
    search_fields = ['nombre', 'contacto']


@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'contacto', 'telefono', 'email', 'activo']
    list_filter = ['activo']
    search_fields = ['nombre', 'contacto']


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'activa']
    list_filter = ['activa']
    search_fields = ['nombre']


@admin.register(Ubicacion)
class UbicacionAdmin(admin.ModelAdmin):
    list_display = ['edificio', 'aula', 'piso']
    search_fields = ['edificio', 'aula']


@admin.register(Articulo)
class ArticuloAdmin(admin.ModelAdmin):
    list_display = ['codigo_inventario', 'nombre', 'categoria', 'ubicacion', 'proveedor', 'stock', 'stock_minimo', 'precio_venta', 'estado']
    list_filter = ['estado', 'categoria', 'proveedor']
    search_fields = ['codigo_inventario', 'nombre', 'marca', 'modelo']


@admin.register(Movimiento)
class MovimientoAdmin(admin.ModelAdmin):
    list_display = ['articulo', 'tipo', 'cantidad', 'precio_unitario', 'usuario', 'proveedor', 'cliente', 'fecha']
    list_filter = ['tipo']
    search_fields = ['articulo__nombre', 'articulo__codigo_inventario']


@admin.register(TasaDolar)
class TasaDolarAdmin(admin.ModelAdmin):
    list_display = ['tasa', 'fecha_actualizacion']

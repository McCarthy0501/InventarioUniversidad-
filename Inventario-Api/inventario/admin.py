from django.contrib import admin
from .models import Usuario, Categoria, Ubicacion, Articulo, Movimiento


@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'rol', 'departamento', 'is_active']
    list_filter = ['rol', 'is_active']
    search_fields = ['username', 'first_name', 'last_name', 'email']


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
    list_display = ['codigo_inventario', 'nombre', 'categoria', 'ubicacion', 'estado', 'valor']
    list_filter = ['estado', 'categoria']
    search_fields = ['codigo_inventario', 'nombre', 'marca', 'modelo', 'numero_serie']


@admin.register(Movimiento)
class MovimientoAdmin(admin.ModelAdmin):
    list_display = ['articulo', 'tipo', 'usuario', 'fecha']
    list_filter = ['tipo']
    search_fields = ['articulo__nombre', 'articulo__codigo_inventario']

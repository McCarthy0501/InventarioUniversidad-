from django.contrib.auth.models import AbstractUser
from django.db import models


class Usuario(AbstractUser):
    ROL_CHOICES = [
        ('admin', 'Administrador'),
        ('operador', 'Operador'),
        ('consulta', 'Consulta'),
    ]
    rol = models.CharField(max_length=20, choices=ROL_CHOICES, default='consulta')
    departamento = models.CharField(max_length=100, blank=True)
    telefono = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f'{self.get_full_name()} ({self.username})'


class Categoria(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True)
    activa = models.BooleanField(default=True)

    class Meta:
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class Ubicacion(models.Model):
    edificio = models.CharField(max_length=100)
    aula = models.CharField(max_length=100)
    piso = models.CharField(max_length=20, blank=True)
    descripcion = models.TextField(blank=True)

    class Meta:
        ordering = ['edificio', 'aula']
        verbose_name_plural = 'ubicaciones'

    def __str__(self):
        return f'{self.edificio} - {self.aula}'


class Articulo(models.Model):
    ESTADO_CHOICES = [
        ('disponible', 'Disponible'),
        ('prestado', 'Prestado'),
        ('mantenimiento', 'En Mantenimiento'),
        ('dado_de_baja', 'Dado de Baja'),
    ]
    codigo_inventario = models.CharField(max_length=50, unique=True)
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True, blank=True, related_name='articulos')
    ubicacion = models.ForeignKey(Ubicacion, on_delete=models.SET_NULL, null=True, blank=True, related_name='articulos')
    responsable = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, blank=True, related_name='articulos_asignados')
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='disponible')
    fecha_adquisicion = models.DateField(null=True, blank=True)
    valor = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    marca = models.CharField(max_length=100, blank=True)
    modelo = models.CharField(max_length=100, blank=True)
    numero_serie = models.CharField(max_length=100, blank=True)
    observaciones = models.TextField(blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-fecha_creacion']

    def __str__(self):
        return f'{self.codigo_inventario} - {self.nombre}'


class Movimiento(models.Model):
    TIPO_CHOICES = [
        ('entrada', 'Entrada'),
        ('salida', 'Salida'),
        ('traslado', 'Traslado'),
        ('mantenimiento', 'Mantenimiento'),
        ('baja', 'Baja'),
    ]
    articulo = models.ForeignKey(Articulo, on_delete=models.CASCADE, related_name='movimientos')
    usuario = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, related_name='movimientos')
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    ubicacion_origen = models.ForeignKey(Ubicacion, on_delete=models.SET_NULL, null=True, blank=True, related_name='movimientos_origen')
    ubicacion_destino = models.ForeignKey(Ubicacion, on_delete=models.SET_NULL, null=True, blank=True, related_name='movimientos_destino')
    fecha = models.DateTimeField(auto_now_add=True)
    motivo = models.TextField(blank=True)
    observaciones = models.TextField(blank=True)

    class Meta:
        ordering = ['-fecha']

    def __str__(self):
        return f'{self.tipo} - {self.articulo.nombre} ({self.fecha.strftime("%d/%m/%Y %H:%M")})'

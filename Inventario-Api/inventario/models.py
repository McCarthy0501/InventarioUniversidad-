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


class Proveedor(models.Model):
    nombre = models.CharField(max_length=200, unique=True)
    contacto = models.CharField(max_length=100, blank=True)
    telefono = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    direccion = models.TextField(blank=True)
    activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['nombre']
        verbose_name_plural = 'proveedores'

    def __str__(self):
        return self.nombre


class Cliente(models.Model):
    nombre = models.CharField(max_length=200, unique=True)
    contacto = models.CharField(max_length=100, blank=True)
    telefono = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    direccion = models.TextField(blank=True)
    activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class Categoria(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True)
    activa = models.BooleanField(default=True)

    class Meta:
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class Ubicacion(models.Model):
    edificio = models.CharField(max_length=100, verbose_name='Almacén / Pasillo')
    aula = models.CharField(max_length=100, verbose_name='Estante / Sección')
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
        ('agotado', 'Agotado'),
        ('descontinuado', 'Descontinuado'),
    ]
    codigo_inventario = models.CharField(max_length=50, unique=True)
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True, blank=True, related_name='articulos')
    ubicacion = models.ForeignKey(Ubicacion, on_delete=models.SET_NULL, null=True, blank=True, related_name='articulos', verbose_name='Ubicación en almacén')
    proveedor = models.ForeignKey(Proveedor, on_delete=models.SET_NULL, null=True, blank=True, related_name='articulos')
    stock = models.IntegerField(default=0)
    stock_minimo = models.IntegerField(default=5, verbose_name='Stock mínimo')
    precio_compra = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name='Precio de compra')
    precio_venta = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name='Precio de venta')
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='disponible')
    fecha_adquisicion = models.DateField(null=True, blank=True)
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

    @property
    def stock_bajo(self):
        return self.stock <= self.stock_minimo


class Movimiento(models.Model):
    TIPO_CHOICES = [
        ('entrada', 'Entrada (Compra)'),
        ('salida', 'Salida (Venta)'),
        ('ajuste', 'Ajuste de inventario'),
        ('devolucion', 'Devolución'),
    ]
    articulo = models.ForeignKey(Articulo, on_delete=models.CASCADE, related_name='movimientos')
    usuario = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, related_name='movimientos')
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    cantidad = models.IntegerField(default=1)
    precio_unitario = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    proveedor = models.ForeignKey(Proveedor, on_delete=models.SET_NULL, null=True, blank=True, related_name='movimientos')
    cliente = models.ForeignKey(Cliente, on_delete=models.SET_NULL, null=True, blank=True, related_name='movimientos')
    fecha = models.DateTimeField(auto_now_add=True)
    motivo = models.TextField(blank=True)
    observaciones = models.TextField(blank=True)

    class Meta:
        ordering = ['-fecha']

    def __str__(self):
        return f'{self.get_tipo_display()} - {self.articulo.nombre} ({self.cantidad} uds)'


class TasaDolar(models.Model):
    tasa = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Tasa del dolar'
        verbose_name_plural = 'Tasa del dolar'

    def __str__(self):
        return f'Bs {self.tasa} / USD'

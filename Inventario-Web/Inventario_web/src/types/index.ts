export interface Usuario {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  rol: 'admin' | 'operador' | 'consulta'
  departamento: string
  telefono: string
  is_active: boolean
}

export interface Proveedor {
  id: number
  nombre: string
  contacto: string
  telefono: string
  email: string
  direccion: string
  activo: boolean
  fecha_creacion: string
}

export interface Cliente {
  id: number
  nombre: string
  contacto: string
  telefono: string
  email: string
  direccion: string
  activo: boolean
  fecha_creacion: string
}

export interface Categoria {
  id: number
  nombre: string
  descripcion: string
  activa: boolean
}

export interface Ubicacion {
  id: number
  edificio: string
  aula: string
  piso: string
  descripcion: string
}

export interface Articulo {
  id: number
  codigo_inventario: string
  nombre: string
  descripcion: string
  categoria: number | null
  categoria_nombre: string | null
  ubicacion: number | null
  ubicacion_nombre: string | null
  proveedor: number | null
  proveedor_nombre: string | null
  stock: number
  stock_minimo: number
  stock_bajo: boolean
  precio_compra: number | null
  precio_venta: number | null
  estado: 'disponible' | 'agotado' | 'descontinuado'
  fecha_adquisicion: string | null
  marca: string
  modelo: string
  numero_serie: string
  observaciones: string
  fecha_creacion: string
  fecha_actualizacion: string
}

export interface Movimiento {
  id: number
  articulo: number
  articulo_codigo: string
  articulo_nombre: string
  usuario: number | null
  usuario_nombre: string | null
  tipo: 'entrada' | 'salida' | 'ajuste' | 'devolucion'
  cantidad: number
  precio_unitario: number | null
  proveedor: number | null
  proveedor_nombre: string | null
  cliente: number | null
  cliente_nombre: string | null
  fecha: string
  motivo: string
  observaciones: string
}

export interface DashboardData {
  total_articulos: number
  total_stock: number
  articulos_stock_bajo: number
  articulos_agotados: number
  articulos_por_categoria: Record<string, number>
  articulos_por_ubicacion: Record<string, number>
  ultimos_movimientos: Movimiento[]
  valor_inventario: number
  tasa_dolar: number
  ventas_hoy_unidades: number
  ventas_hoy_usd: number
  compras_hoy_unidades: number
  compras_hoy_usd: number
  ventas_semana_unidades: number
  ventas_semana_usd: number
  compras_semana_unidades: number
  compras_semana_usd: number
  ventas_mes_unidades: number
  ventas_mes_usd: number
  compras_mes_unidades: number
  compras_mes_usd: number
}

export interface Configuracion {
  id: number | null
  tasa: number
  fecha_actualizacion: string | null
}

export interface AlertaStock {
  id: number
  codigo_inventario: string
  nombre: string
  stock: number
  stock_minimo: number
  estado: 'bajo' | 'agotado'
  categoria_nombre: string | null
  proveedor_nombre: string | null
  precio_compra: number | null
}

export interface LoginResponse {
  access: string
  refresh: string
  user: Usuario
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface ArticuloFormData {
  codigo_inventario: string
  nombre: string
  descripcion: string
  categoria: number | null
  ubicacion: number | null
  proveedor: number | null
  stock: number
  stock_minimo: number
  precio_compra: number | null
  precio_venta: number | null
  estado: string
  fecha_adquisicion: string | null
  marca: string
  modelo: string
  numero_serie: string
  observaciones: string
}

export interface MovimientoFormData {
  articulo: number
  tipo: 'entrada' | 'salida' | 'ajuste' | 'devolucion'
  cantidad: number
  precio_unitario: number | null
  proveedor: number | null
  cliente: number | null
  motivo: string
  observaciones: string
}

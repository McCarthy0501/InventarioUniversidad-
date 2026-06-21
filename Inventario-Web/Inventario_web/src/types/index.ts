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
  responsable: number | null
  responsable_nombre: string | null
  estado: 'disponible' | 'prestado' | 'mantenimiento' | 'dado_de_baja'
  fecha_adquisicion: string | null
  valor: number | null
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
  tipo: 'entrada' | 'salida' | 'traslado' | 'mantenimiento' | 'baja'
  ubicacion_origen: number | null
  ubicacion_origen_nombre: string | null
  ubicacion_destino: number | null
  ubicacion_destino_nombre: string | null
  fecha: string
  motivo: string
  observaciones: string
}

export interface DashboardData {
  total_articulos: number
  articulos_por_estado: Record<string, number>
  articulos_por_categoria: Record<string, number>
  articulos_por_ubicacion: Record<string, number>
  ultimos_movimientos: Movimiento[]
  valor_total: number
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
  responsable: number | null
  estado: string
  fecha_adquisicion: string | null
  valor: number | null
  marca: string
  modelo: string
  numero_serie: string
  observaciones: string
}

export interface MovimientoFormData {
  articulo: number
  tipo: 'entrada' | 'salida' | 'traslado' | 'mantenimiento' | 'baja'
  ubicacion_origen: number | null
  ubicacion_destino: number | null
  motivo: string
  observaciones: string
}

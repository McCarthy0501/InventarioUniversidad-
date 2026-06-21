import api from './client'
import type {
  LoginResponse, Usuario, PaginatedResponse,
  Categoria, Ubicacion, Articulo, Movimiento,
  DashboardData, ArticuloFormData, MovimientoFormData,
  Proveedor, Cliente, AlertaStock, Configuracion
} from '../types'

export const authApi = {
  login: (username: string, password: string) =>
    api.post<LoginResponse>('/auth/login/', { username, password }),
  refresh: (refresh: string) =>
    api.post<{ access: string }>('/auth/refresh/', { refresh }),
  me: () => api.get<Usuario>('/auth/me/'),
}

export const articulosApi = {
  list: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<Articulo>>('/articulos/', { params }),
  get: (id: number) => api.get<Articulo>(`/articulos/${id}/`),
  create: (data: ArticuloFormData) => api.post<Articulo>('/articulos/', data),
  update: (id: number, data: Partial<ArticuloFormData>) => api.put<Articulo>(`/articulos/${id}/`, data),
  delete: (id: number) => api.delete(`/articulos/${id}/`),
  export: () => api.get('/articulos/exportar/', { responseType: 'blob' }),
}

export const categoriasApi = {
  list: () => api.get<Categoria[]>('/categorias/'),
  create: (data: Partial<Categoria>) => api.post<Categoria>('/categorias/', data),
  update: (id: number, data: Partial<Categoria>) => api.put<Categoria>(`/categorias/${id}/`, data),
  delete: (id: number) => api.delete(`/categorias/${id}/`),
}

export const ubicacionesApi = {
  list: (params?: Record<string, string>) =>
    api.get<Ubicacion[]>('/ubicaciones/', { params }),
  create: (data: Partial<Ubicacion>) => api.post<Ubicacion>('/ubicaciones/', data),
  update: (id: number, data: Partial<Ubicacion>) => api.put<Ubicacion>(`/ubicaciones/${id}/`, data),
  delete: (id: number) => api.delete(`/ubicaciones/${id}/`),
}

export const proveedoresApi = {
  list: () => api.get<Proveedor[]>('/proveedores/'),
  create: (data: Partial<Proveedor>) => api.post<Proveedor>('/proveedores/', data),
  update: (id: number, data: Partial<Proveedor>) => api.put<Proveedor>(`/proveedores/${id}/`, data),
  delete: (id: number) => api.delete(`/proveedores/${id}/`),
}

export const clientesApi = {
  list: () => api.get<Cliente[]>('/clientes/'),
  create: (data: Partial<Cliente>) => api.post<Cliente>('/clientes/', data),
  update: (id: number, data: Partial<Cliente>) => api.put<Cliente>(`/clientes/${id}/`, data),
  delete: (id: number) => api.delete(`/clientes/${id}/`),
}

export const movimientosApi = {
  list: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<Movimiento>>('/movimientos/', { params }),
  create: (data: MovimientoFormData) => api.post<Movimiento>('/movimientos/', data),
}

export const usuariosApi = {
  list: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<Usuario>>('/usuarios/', { params }),
  create: (data: Record<string, unknown>) => api.post<Usuario>('/usuarios/', data),
  update: (id: number, data: Record<string, unknown>) => api.put<Usuario>(`/usuarios/${id}/`, data),
  delete: (id: number) => api.delete(`/usuarios/${id}/`),
}

export const dashboardApi = {
  get: () => api.get<DashboardData>('/dashboard/'),
}

export const alertasApi = {
  list: () => api.get<AlertaStock[]>('/alertas/'),
}

export const configuracionApi = {
  get: () => api.get<Configuracion>('/configuracion/'),
  update: (tasa: number) => api.put<Configuracion>('/configuracion/', { tasa }),
}

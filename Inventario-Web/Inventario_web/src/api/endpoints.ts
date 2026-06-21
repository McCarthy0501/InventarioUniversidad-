import api from './client'
import type {
  LoginResponse, Usuario, PaginatedResponse,
  Categoria, Ubicacion, Articulo, Movimiento,
  DashboardData, ArticuloFormData, MovimientoFormData
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

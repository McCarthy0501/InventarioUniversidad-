import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProtectedRoute, AdminRoute } from './routes/ProtectedRoute'
import { DashboardLayout } from './components/layout/DashboardLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ArticulosPage from './pages/ArticulosPage'
import CategoriasPage from './pages/CategoriasPage'
import UbicacionesPage from './pages/UbicacionesPage'
import MovimientosPage from './pages/MovimientosPage'
import UsuariosPage from './pages/UsuariosPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/articulos" element={<ArticulosPage />} />
              <Route path="/categorias" element={<CategoriasPage />} />
              <Route path="/ubicaciones" element={<UbicacionesPage />} />
              <Route path="/movimientos" element={<MovimientosPage />} />
              <Route element={<AdminRoute />}>
                <Route path="/usuarios" element={<UsuariosPage />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App

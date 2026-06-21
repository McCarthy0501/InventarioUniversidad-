import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { cn } from '../../lib/utils'
import {
  LayoutDashboard, Package, Tags, MapPin, ArrowRightLeft,
  Users, LogOut, ChevronLeft, Menu
} from 'lucide-react'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet'
import { useState } from 'react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/articulos', label: 'Artículos', icon: Package },
  { to: '/categorias', label: 'Categorías', icon: Tags },
  { to: '/ubicaciones', label: 'Ubicaciones', icon: MapPin },
  { to: '/movimientos', label: 'Movimientos', icon: ArrowRightLeft },
]

const adminItems = [
  { to: '/usuarios', label: 'Usuarios', icon: Users },
]

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2 px-4 border-b">
        <Package className="h-6 w-6 text-primary" />
        <span className="font-semibold text-lg">Inventario</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
        {user?.rol === 'admin' && (
          <>
            <Separator className="my-2" />
            {adminItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </>
        )}
      </nav>
      <div className="border-t p-3">
        <div className="mb-2 px-3 text-xs text-muted-foreground">
          <p className="font-medium text-sm text-foreground">{user?.first_name} {user?.last_name}</p>
          <p>{user?.rol === 'admin' ? 'Administrador' : user?.rol === 'operador' ? 'Operador' : 'Consulta'}</p>
        </div>
        <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden lg:flex w-64 bg-sidebar border-r h-screen flex-col fixed left-0 top-0 z-30">
        {content}
      </aside>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="left" className="w-64 p-0">
          {content}
        </SheetContent>
      </Sheet>
    </>
  )
}

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { proveedoresApi } from '../api/endpoints'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent } from '../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import type { Proveedor } from '../types'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const emptyForm = { nombre: '', contacto: '', telefono: '', email: '', direccion: '' }

export default function ProveedoresPage() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const isConsulta = user?.rol === 'consulta'
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Proveedor | null>(null)
  const [form, setForm] = useState(emptyForm)

  const { data, isLoading } = useQuery({
    queryKey: ['proveedores'],
    queryFn: () => proveedoresApi.list().then((r) => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => proveedoresApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['proveedores'] }); setDialogOpen(false); resetForm() },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: typeof form }) => proveedoresApi.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['proveedores'] }); setDialogOpen(false); resetForm() },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => proveedoresApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['proveedores'] }),
  })

  const resetForm = () => { setForm(emptyForm); setEditing(null) }

  const openEdit = (p: Proveedor) => {
    setEditing(p)
    setForm({ nombre: p.nombre, contacto: p.contacto || '', telefono: p.telefono || '', email: p.email || '', direccion: p.direccion || '' })
    setDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editing) updateMutation.mutate({ id: editing.id, data: form })
    else createMutation.mutate(form)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Proveedores</h1>
        {!isConsulta && (
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm() }}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => { resetForm(); setDialogOpen(true) }}><Plus className="mr-2 h-4 w-4" />Nuevo Proveedor</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader><DialogTitle>{editing ? 'Editar Proveedor' : 'Nuevo Proveedor'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2"><Label>Nombre *</Label><Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Contacto</Label><Input value={form.contacto} onChange={(e) => setForm({ ...form, contacto: e.target.value })} /></div>
                <div className="space-y-2"><Label>Teléfono</Label><Input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="space-y-2"><Label>Dirección</Label><Input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} /></div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm() }}>Cancelar</Button>
                <Button type="submit">{editing ? 'Actualizar' : 'Crear'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        )}
      </div>
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center py-8"><div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Sin proveedores</TableCell></TableRow>}
                {data?.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.nombre}</TableCell>
                    <TableCell>{p.contacto || '-'}</TableCell>
                    <TableCell>{p.telefono || '-'}</TableCell>
                    <TableCell>{p.email || '-'}</TableCell>
                    <TableCell><Badge variant="outline" className={p.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>{p.activo ? 'Activo' : 'Inactivo'}</Badge></TableCell>
                    <TableCell>
                      {!isConsulta && (
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => { if (confirm('¿Eliminar este proveedor?')) deleteMutation.mutate(p.id) }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

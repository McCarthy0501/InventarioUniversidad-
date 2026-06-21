import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientesApi } from '../api/endpoints'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent } from '../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import type { Cliente } from '../types'
import { Plus, Pencil, Trash2 } from 'lucide-react'

const emptyForm = { nombre: '', contacto: '', telefono: '', email: '', direccion: '' }

export default function ClientesPage() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Cliente | null>(null)
  const [form, setForm] = useState(emptyForm)

  const { data, isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => clientesApi.list().then((r) => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => clientesApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['clientes'] }); setDialogOpen(false); resetForm() },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: typeof form }) => clientesApi.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['clientes'] }); setDialogOpen(false); resetForm() },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => clientesApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clientes'] }),
  })

  const resetForm = () => { setForm(emptyForm); setEditing(null) }

  const openEdit = (c: Cliente) => {
    setEditing(c)
    setForm({ nombre: c.nombre, contacto: c.contacto || '', telefono: c.telefono || '', email: c.email || '', direccion: c.direccion || '' })
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
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm() }}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => { resetForm(); setDialogOpen(true) }}><Plus className="mr-2 h-4 w-4" />Nuevo Cliente</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader><DialogTitle>{editing ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle></DialogHeader>
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
                {data?.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Sin clientes</TableCell></TableRow>}
                {data?.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.nombre}</TableCell>
                    <TableCell>{c.contacto || '-'}</TableCell>
                    <TableCell>{c.telefono || '-'}</TableCell>
                    <TableCell>{c.email || '-'}</TableCell>
                    <TableCell><Badge variant="outline" className={c.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>{c.activo ? 'Activo' : 'Inactivo'}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => { if (confirm('¿Eliminar este cliente?')) deleteMutation.mutate(c.id) }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
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

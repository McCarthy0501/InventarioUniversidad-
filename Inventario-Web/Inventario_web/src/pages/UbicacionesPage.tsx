import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ubicacionesApi } from '../api/endpoints'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent } from '../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Label } from '../components/ui/label'
import type { Ubicacion } from '../types'
import { Plus, Pencil, Trash2 } from 'lucide-react'

export default function UbicacionesPage() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Ubicacion | null>(null)
  const [form, setForm] = useState({ edificio: '', aula: '', piso: '', descripcion: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['ubicaciones'],
    queryFn: () => ubicacionesApi.list().then((r) => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => ubicacionesApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['ubicaciones'] }); setDialogOpen(false); resetForm() },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: typeof form }) => ubicacionesApi.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['ubicaciones'] }); setDialogOpen(false); resetForm() },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => ubicacionesApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ubicaciones'] }),
  })

  const resetForm = () => { setForm({ edificio: '', aula: '', piso: '', descripcion: '' }); setEditing(null) }

  const openEdit = (u: Ubicacion) => {
    setEditing(u)
    setForm({ edificio: u.edificio, aula: u.aula, piso: u.piso || '', descripcion: u.descripcion || '' })
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
        <h1 className="text-2xl font-bold">Ubicaciones</h1>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm() }}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => { resetForm(); setDialogOpen(true) }}>
              <Plus className="mr-2 h-4 w-4" /> Nueva Ubicación
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader><DialogTitle>{editing ? 'Editar Ubicación' : 'Nueva Ubicación'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2"><Label>Edificio *</Label><Input value={form.edificio} onChange={(e) => setForm({ ...form, edificio: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Aula *</Label><Input value={form.aula} onChange={(e) => setForm({ ...form, aula: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Piso</Label><Input value={form.piso} onChange={(e) => setForm({ ...form, piso: e.target.value })} /></div>
              <div className="space-y-2"><Label>Descripción</Label><Input value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} /></div>
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
                  <TableHead>Edificio</TableHead>
                  <TableHead>Aula</TableHead>
                  <TableHead>Piso</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="w-[80px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Sin ubicaciones</TableCell></TableRow>
                )}
                {data?.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.edificio}</TableCell>
                    <TableCell>{u.aula}</TableCell>
                    <TableCell>{u.piso || '-'}</TableCell>
                    <TableCell>{u.descripcion || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(u)}><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => { if (confirm('¿Eliminar esta ubicación?')) deleteMutation.mutate(u.id) }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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

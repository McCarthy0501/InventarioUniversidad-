import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { movimientosApi, articulosApi } from '../api/endpoints'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Label } from '../components/ui/label'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Plus, ArrowRightLeft } from 'lucide-react'

const TIPO_VARIANTS: Record<string, string> = {
  entrada: 'bg-green-100 text-green-800',
  salida: 'bg-red-100 text-red-800',
  traslado: 'bg-blue-100 text-blue-800',
  mantenimiento: 'bg-yellow-100 text-yellow-800',
  baja: 'bg-gray-100 text-gray-800',
}

export default function MovimientosPage() {
  const queryClient = useQueryClient()
  const [tipoFilter, setTipoFilter] = useState('todos')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({
    articulo: 0, tipo: 'entrada' as const, motivo: '', observaciones: '',
    ubicacion_origen: null as number | null, ubicacion_destino: null as number | null,
  })

  const params: Record<string, string> = {}
  if (tipoFilter !== 'todos') params.tipo = tipoFilter

  const { data, isLoading } = useQuery({
    queryKey: ['movimientos', params],
    queryFn: () => movimientosApi.list(params).then((r) => r.data),
  })

  const { data: articulosData } = useQuery({
    queryKey: ['articulos-all'],
    queryFn: () => articulosApi.list({ page: '1' }).then((r) => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => movimientosApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movimientos'] })
      queryClient.invalidateQueries({ queryKey: ['articulos'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setDialogOpen(false)
      setForm({ articulo: 0, tipo: 'entrada', motivo: '', observaciones: '', ubicacion_origen: null, ubicacion_destino: null })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(form)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Movimientos</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Nuevo Movimiento</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader><DialogTitle>Registrar Movimiento</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Artículo *</Label>
                <Select value={form.articulo ? form.articulo.toString() : ''} onValueChange={(v) => setForm({ ...form, articulo: Number(v) })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar artículo..." /></SelectTrigger>
                  <SelectContent>
                    {articulosData?.results?.map((a) => (
                      <SelectItem key={a.id} value={a.id.toString()}>{a.codigo_inventario} - {a.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v as typeof form.tipo })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="salida">Salida</SelectItem>
                    <SelectItem value="traslado">Traslado</SelectItem>
                    <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                    <SelectItem value="baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Motivo</Label><Input value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} /></div>
              <div className="space-y-2"><Label>Observaciones</Label><Input value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} /></div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={!form.articulo}>Registrar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <Select value={tipoFilter} onValueChange={setTipoFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filtrar tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="entrada">Entrada</SelectItem>
              <SelectItem value="salida">Salida</SelectItem>
              <SelectItem value="traslado">Traslado</SelectItem>
              <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
              <SelectItem value="baja">Baja</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artículo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.results.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Sin movimientos</TableCell></TableRow>
                )}
                {data?.results.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">
                      <span className="font-mono text-xs text-muted-foreground mr-2">{m.articulo_codigo}</span>
                      {m.articulo_nombre}
                    </TableCell>
                    <TableCell><Badge variant="outline" className={TIPO_VARIANTS[m.tipo]}>{m.tipo}</Badge></TableCell>
                    <TableCell>{m.usuario_nombre || '-'}</TableCell>
                    <TableCell>{m.motivo || '-'}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{new Date(m.fecha).toLocaleString()}</TableCell>
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

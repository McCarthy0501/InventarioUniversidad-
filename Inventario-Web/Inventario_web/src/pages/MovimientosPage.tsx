import { useState } from 'react'
import type { MovimientoFormData } from '../types'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { movimientosApi, articulosApi, proveedoresApi, clientesApi } from '../api/endpoints'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Label } from '../components/ui/label'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Plus } from 'lucide-react'

const TIPO_VARIANTS: Record<string, string> = {
  entrada: 'bg-green-100 text-green-800',
  salida: 'bg-red-100 text-red-800',
  ajuste: 'bg-blue-100 text-blue-800',
  devolucion: 'bg-yellow-100 text-yellow-800',
}

export default function MovimientosPage() {
  const queryClient = useQueryClient()
  const [tipoFilter, setTipoFilter] = useState('todos')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<MovimientoFormData>({
    articulo: 0, tipo: 'entrada', cantidad: 1,
    precio_unitario: null, proveedor: null,
    cliente: null, motivo: '', observaciones: '',
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

  const { data: proveedores } = useQuery({
    queryKey: ['proveedores'],
    queryFn: () => proveedoresApi.list().then((r) => r.data),
  })

  const { data: clientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => clientesApi.list().then((r) => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: MovimientoFormData) => movimientosApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movimientos'] })
      queryClient.invalidateQueries({ queryKey: ['articulos'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['alertas'] })
      setDialogOpen(false)
      setForm({ articulo: 0, tipo: 'entrada', cantidad: 1, precio_unitario: null, proveedor: null, cliente: null, motivo: '', observaciones: '' })
    },
  })

  const handleArticuloSelect = (artId: number) => {
    const art = articulosData?.results.find((a) => a.id === artId)
    setForm({
      ...form, articulo: artId,
      proveedor: art?.proveedor || null,
      precio_unitario: null,
    })
  }

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
            <Button size="sm"><Plus className="mr-2 h-4 w-4" />Nuevo Movimiento</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader><DialogTitle>Registrar Movimiento</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Artículo *</Label>
                <Select value={form.articulo ? form.articulo.toString() : ''} onValueChange={(v) => handleArticuloSelect(Number(v))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    {articulosData?.results.map((a) => (
                      <SelectItem key={a.id} value={a.id.toString()}>{a.codigo_inventario} - {a.nombre} (stock: {a.stock})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo *</Label>
                  <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v as typeof form.tipo })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entrada">Entrada (Compra)</SelectItem>
                      <SelectItem value="salida">Salida (Venta)</SelectItem>
                      <SelectItem value="devolucion">Devolución</SelectItem>
                      <SelectItem value="ajuste">Ajuste Inventario</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Cantidad *</Label><Input type="number" min="1" value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: Number(e.target.value) })} required /></div>
              </div>
              {(form.tipo === 'entrada' || form.tipo === 'devolucion') && (
                <div className="space-y-2">
                  <Label>Proveedor</Label>
                  <Select value={form.proveedor?.toString() || ''} onValueChange={(v) => setForm({ ...form, proveedor: v ? Number(v) : null })}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>{proveedores?.map((p) => <SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              {(form.tipo === 'salida' || form.tipo === 'devolucion') && (
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Select value={form.cliente?.toString() || ''} onValueChange={(v) => setForm({ ...form, cliente: v ? Number(v) : null })}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>{clientes?.map((c) => <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              {(form.tipo === 'entrada' || form.tipo === 'salida') && (
                <div className="space-y-2"><Label>Precio Unitario</Label><Input type="number" step="0.01" value={form.precio_unitario?.toString() || ''} onChange={(e) => setForm({ ...form, precio_unitario: e.target.value ? Number(e.target.value) : null })} /></div>
              )}
              <div className="space-y-2"><Label>Motivo</Label><Input value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} /></div>
              <div className="space-y-2"><Label>Observaciones</Label><Input value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} /></div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={!form.articulo || form.cantidad < 1}>Registrar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="entrada">Entrada (Compra)</SelectItem>
                <SelectItem value="salida">Salida (Venta)</SelectItem>
                <SelectItem value="devolucion">Devolución</SelectItem>
                <SelectItem value="ajuste">Ajuste</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-8"><div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artículo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Proveedor / Cliente</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.results.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Sin movimientos</TableCell></TableRow>
                )}
                {data?.results.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">
                      <span className="font-mono text-xs text-muted-foreground mr-2">{m.articulo_codigo}</span>
                      {m.articulo_nombre}
                    </TableCell>
                    <TableCell><Badge variant="outline" className={TIPO_VARIANTS[m.tipo]}>{m.tipo}</Badge></TableCell>
                    <TableCell className="font-bold">{m.cantidad}</TableCell>
                    <TableCell className="text-xs">{m.proveedor_nombre || m.cliente_nombre || '-'}</TableCell>
                    <TableCell>{m.precio_unitario ? `$${m.precio_unitario}` : '-'}</TableCell>
                    <TableCell>{m.usuario_nombre || '-'}</TableCell>
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

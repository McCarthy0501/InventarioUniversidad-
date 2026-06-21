import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { articulosApi, categoriasApi, ubicacionesApi, usuariosApi } from '../api/endpoints'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '../components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '../components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '../components/ui/select'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import type { Articulo, ArticuloFormData } from '../types'
import { Plus, Download, Pencil, Trash2, Search } from 'lucide-react'

const ESTADO_VARIANTS: Record<string, string> = {
  disponible: 'bg-green-100 text-green-800',
  prestado: 'bg-blue-100 text-blue-800',
  mantenimiento: 'bg-yellow-100 text-yellow-800',
  dado_de_baja: 'bg-red-100 text-red-800',
}

const ESTADO_LABELS: Record<string, string> = {
  disponible: 'Disponible',
  prestado: 'Prestado',
  mantenimiento: 'Mantenimiento',
  dado_de_baja: 'Dado de baja',
}

const emptyForm: ArticuloFormData = {
  codigo_inventario: '', nombre: '', descripcion: '',
  categoria: null, ubicacion: null, responsable: null,
  estado: 'disponible', fecha_adquisicion: '', valor: null,
  marca: '', modelo: '', numero_serie: '', observaciones: '',
}

export default function ArticulosPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('todos')
  const [categoriaFilter, setCategoriaFilter] = useState('todos')
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Articulo | null>(null)
  const [form, setForm] = useState<ArticuloFormData>(emptyForm)

  const params: Record<string, string> = { page: String(page) }
  if (search) params.search = search
  if (estadoFilter !== 'todos') params.estado = estadoFilter
  if (categoriaFilter !== 'todos') params.categoria = categoriaFilter

  const { data, isLoading } = useQuery({
    queryKey: ['articulos', params],
    queryFn: () => articulosApi.list(params).then((r) => r.data),
  })

  const { data: categorias } = useQuery({
    queryKey: ['categorias'],
    queryFn: () => categoriasApi.list().then((r) => r.data),
  })

  const { data: ubicaciones } = useQuery({
    queryKey: ['ubicaciones'],
    queryFn: () => ubicacionesApi.list().then((r) => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: ArticuloFormData) => articulosApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articulos'] })
      setDialogOpen(false)
      resetForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ArticuloFormData> }) =>
      articulosApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articulos'] })
      setDialogOpen(false)
      resetForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => articulosApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['articulos'] }),
  })

  const resetForm = () => {
    setForm(emptyForm)
    setEditing(null)
  }

  const openEdit = (articulo: Articulo) => {
    setEditing(articulo)
    setForm({
      codigo_inventario: articulo.codigo_inventario,
      nombre: articulo.nombre,
      descripcion: articulo.descripcion || '',
      categoria: articulo.categoria,
      ubicacion: articulo.ubicacion,
      responsable: articulo.responsable,
      estado: articulo.estado,
      fecha_adquisicion: articulo.fecha_adquisicion || '',
      valor: articulo.valor,
      marca: articulo.marca || '',
      modelo: articulo.modelo || '',
      numero_serie: articulo.numero_serie || '',
      observaciones: articulo.observaciones || '',
    })
    setDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      ...form,
      valor: form.valor ? Number(form.valor) : null,
      fecha_adquisicion: form.fecha_adquisicion || null,
    }
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const handleExport = async () => {
    const response = await articulosApi.export()
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const a = document.createElement('a')
    a.href = url
    a.download = 'articulos.xlsx'
    a.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Artículos</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Exportar Excel
          </Button>
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm() }}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => { resetForm(); setDialogOpen(true) }}>
                <Plus className="mr-2 h-4 w-4" /> Nuevo Artículo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editing ? 'Editar Artículo' : 'Nuevo Artículo'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Código Inventario *</Label>
                    <Input value={form.codigo_inventario} onChange={(e) => setForm({ ...form, codigo_inventario: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Nombre *</Label>
                    <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Categoría</Label>
                    <Select value={form.categoria?.toString() || ''} onValueChange={(v) => setForm({ ...form, categoria: v ? Number(v) : null })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>
                        {categorias?.map((c) => (
                          <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Select value={form.estado} onValueChange={(v) => setForm({ ...form, estado: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(ESTADO_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Ubicación</Label>
                    <Select value={form.ubicacion?.toString() || ''} onValueChange={(v) => setForm({ ...form, ubicacion: v ? Number(v) : null })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>
                        {ubicaciones?.map((u) => (
                          <SelectItem key={u.id} value={u.id.toString()}>{u.edificio} - {u.aula}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Marca</Label>
                    <Input value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Modelo</Label>
                    <Input value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>N° Serie</Label>
                    <Input value={form.numero_serie} onChange={(e) => setForm({ ...form, numero_serie: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha Adquisición</Label>
                    <Input type="date" value={form.fecha_adquisicion || ''} onChange={(e) => setForm({ ...form, fecha_adquisicion: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Valor</Label>
                    <Input type="number" step="0.01" value={form.valor?.toString() || ''} onChange={(e) => setForm({ ...form, valor: e.target.value ? Number(e.target.value) : null })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Input value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Observaciones</Label>
                  <Input value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm() }}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editing ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                className="pl-8"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              />
            </div>
            <Select value={estadoFilter} onValueChange={(v) => { setEstadoFilter(v); setPage(1) }}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {Object.entries(ESTADO_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoriaFilter} onValueChange={(v) => { setCategoriaFilter(v); setPage(1) }}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Categoría" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                {categorias?.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead className="w-[80px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.results.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No se encontraron artículos
                      </TableCell>
                    </TableRow>
                  )}
                  {data?.results.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-mono text-xs">{a.codigo_inventario}</TableCell>
                      <TableCell className="font-medium">{a.nombre}</TableCell>
                      <TableCell>{a.categoria_nombre || '-'}</TableCell>
                      <TableCell>{a.ubicacion_nombre || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={ESTADO_VARIANTS[a.estado]}>
                          {ESTADO_LABELS[a.estado]}
                        </Badge>
                      </TableCell>
                      <TableCell>{a.responsable_nombre || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEdit(a)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => {
                            if (confirm('¿Eliminar este artículo?')) deleteMutation.mutate(a.id)
                          }}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {data && data.count > 20 && (
                <div className="flex items-center justify-between pt-4">
                  <Button variant="outline" size="sm" disabled={!data.previous} onClick={() => setPage((p) => p - 1)}>
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {page} de {Math.ceil(data.count / 20)}
                  </span>
                  <Button variant="outline" size="sm" disabled={!data.next} onClick={() => setPage((p) => p + 1)}>
                    Siguiente
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

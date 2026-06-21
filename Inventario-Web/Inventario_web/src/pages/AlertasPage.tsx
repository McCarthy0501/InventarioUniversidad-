import { useQuery } from '@tanstack/react-query'
import { alertasApi } from '../api/endpoints'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Badge } from '../components/ui/badge'
import { AlertTriangle, Package } from 'lucide-react'

export default function AlertasPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['alertas'],
    queryFn: () => alertasApi.list().then((r) => r.data),
    refetchInterval: 30000,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-6 w-6 text-destructive" />
        <h1 className="text-2xl font-bold">Alertas de Stock</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>
      ) : !data || data.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <Package className="h-12 w-12 text-success" />
            <p className="text-lg font-medium text-success">Todo en orden</p>
            <p className="text-muted-foreground">No hay productos con stock bajo o agotado</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex gap-3">
            <Card className="flex-1 border-destructive/50 bg-destructive/10">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-destructive">Agotados</CardTitle></CardHeader>
              <CardContent><span className="text-2xl font-bold">{data.filter((a) => a.stock === 0).length}</span></CardContent>
            </Card>
            <Card className="flex-1 border-accent/50 bg-accent/10">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-accent">Stock Bajo</CardTitle></CardHeader>
              <CardContent><span className="text-2xl font-bold">{data.filter((a) => a.stock > 0).length}</span></CardContent>
            </Card>
            <Card className="flex-1">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Total Alertas</CardTitle></CardHeader>
              <CardContent><span className="text-2xl font-bold">{data.length}</span></CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Stock Actual</TableHead>
                    <TableHead>Stock Mínimo</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((a) => (
                    <TableRow key={a.id} className={a.stock === 0 ? 'bg-red-50' : 'bg-yellow-50'}>
                      <TableCell className="font-mono text-xs">{a.codigo_inventario}</TableCell>
                      <TableCell className="font-medium">{a.nombre}</TableCell>
                      <TableCell>{a.categoria_nombre || '-'}</TableCell>
                      <TableCell className="text-xs">{a.proveedor_nombre || '-'}</TableCell>
                      <TableCell className="font-bold text-destructive">{a.stock}</TableCell>
                      <TableCell>{a.stock_minimo}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={a.stock === 0 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                          {a.estado === 'agotado' ? 'Agotado' : 'Stock Bajo'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

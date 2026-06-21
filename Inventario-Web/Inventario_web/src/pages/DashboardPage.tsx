import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { dashboardApi, configuracionApi } from '../api/endpoints'
import { useAuthStore } from '../store/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Package, AlertTriangle, ShoppingCart, DollarSign, ArrowRightLeft, TrendingDown, TrendingUp, RefreshCw } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Link } from 'react-router-dom'

function BsValue({ usd, tasa }: { usd: number; tasa: number }) {
  return <span className="text-muted-foreground">Bs {(usd * tasa).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
}

export default function DashboardPage() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const [tasaInput, setTasaInput] = useState('')
  const [updatingTasa, setUpdatingTasa] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.get().then((r) => r.data),
    refetchInterval: 30000,
  })

  const handleUpdateTasa = async () => {
    const valor = parseFloat(tasaInput)
    if (!valor || valor <= 0) return
    setUpdatingTasa(true)
    try {
      await configuracionApi.update(valor)
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setTasaInput('')
    } finally {
      setUpdatingTasa(false)
    }
  }

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  const tasa = data.tasa_dolar || 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard - Bodegón JL</h1>
        {user?.rol === 'admin' && (
          <Card className="px-3 py-2 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Tasa BCV:</span>
            <Input
              className="w-24 h-8 text-sm"
              placeholder={tasa.toString()}
              value={tasaInput}
              onChange={(e) => setTasaInput(e.target.value)}
            />
            <Button size="sm" variant="outline" onClick={handleUpdateTasa} disabled={updatingTasa}>
              <RefreshCw className={`h-3 w-3 mr-1 ${updatingTasa ? 'animate-spin' : ''}`} />
              {tasa.toFixed(2)}
            </Button>
          </Card>
        )}
      </div>

      {(data.articulos_agotados > 0 || data.articulos_stock_bajo > 0) && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span className="font-semibold text-destructive">
              {data.articulos_agotados > 0 && `${data.articulos_agotados} agotado(s) `}
              {data.articulos_stock_bajo > 0 && `${data.articulos_stock_bajo} con stock bajo`}
            </span>
            <Link to="/alertas" className="underline text-sm ml-2">Ver alertas</Link>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Productos</CardTitle>
            <Package className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{data.total_articulos}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unidades en Stock</CardTitle>
            <ShoppingCart className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{data.total_stock}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Valor Inventario</CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.valor_inventario?.toLocaleString() || 0}</div>
            <div className="text-xs text-muted-foreground">Bs {(data.valor_inventario * tasa).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
        <Card>
          <Link to="/alertas">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Stock Bajo</CardTitle>
              <TrendingDown className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-accent">{data.articulos_stock_bajo + data.articulos_agotados}</div></CardContent>
          </Link>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-success" /> Ventas
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Hoy</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.ventas_hoy_unidades} <span className="text-sm font-normal text-muted-foreground">unids</span></div>
              <div className="text-sm">${data.ventas_hoy_usd.toFixed(2)} <span className="text-muted-foreground">USD</span></div>
              <BsValue usd={data.ventas_hoy_usd} tasa={tasa} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Esta Semana</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.ventas_semana_unidades} <span className="text-sm font-normal text-muted-foreground">unids</span></div>
              <div className="text-sm">${data.ventas_semana_usd.toFixed(2)} <span className="text-muted-foreground">USD</span></div>
              <BsValue usd={data.ventas_semana_usd} tasa={tasa} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Este Mes</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.ventas_mes_unidades} <span className="text-sm font-normal text-muted-foreground">unids</span></div>
              <div className="text-sm">${data.ventas_mes_usd.toFixed(2)} <span className="text-muted-foreground">USD</span></div>
              <BsValue usd={data.ventas_mes_usd} tasa={tasa} />
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5 text-primary" /> Compras
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Hoy</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.compras_hoy_unidades} <span className="text-sm font-normal text-muted-foreground">unids</span></div>
              <div className="text-sm">${data.compras_hoy_usd.toFixed(2)} <span className="text-muted-foreground">USD</span></div>
              <BsValue usd={data.compras_hoy_usd} tasa={tasa} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Esta Semana</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.compras_semana_unidades} <span className="text-sm font-normal text-muted-foreground">unids</span></div>
              <div className="text-sm">${data.compras_semana_usd.toFixed(2)} <span className="text-muted-foreground">USD</span></div>
              <BsValue usd={data.compras_semana_usd} tasa={tasa} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Este Mes</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.compras_mes_unidades} <span className="text-sm font-normal text-muted-foreground">unids</span></div>
              <div className="text-sm">${data.compras_mes_usd.toFixed(2)} <span className="text-muted-foreground">USD</span></div>
              <BsValue usd={data.compras_mes_usd} tasa={tasa} />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Productos por Categoría</CardTitle></CardHeader>
          <CardContent>
            {Object.keys(data.articulos_por_categoria).length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={Object.entries(data.articulos_por_categoria).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-muted-foreground py-10">Sin datos</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Productos por Almacén</CardTitle></CardHeader>
          <CardContent>
            {Object.keys(data.articulos_por_ubicacion).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(data.articulos_por_ubicacion).map(([nombre, count]) => (
                  <div key={nombre} className="flex items-center justify-between"><span>{nombre}</span><Badge variant="outline">{count} prod.</Badge></div>
                ))}
              </div>
            ) : <p className="text-muted-foreground py-10">Sin datos</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Últimos Movimientos</CardTitle></CardHeader>
        <CardContent>
          {data.ultimos_movimientos.length > 0 ? (
            <div className="space-y-3">
              {data.ultimos_movimientos.map((m) => (
                <div key={m.id} className="flex items-center gap-3 text-sm border-b pb-2 last:border-0">
                  <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline" className={m.tipo === 'entrada' ? 'bg-green-100 text-green-800' : m.tipo === 'salida' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>{m.tipo}</Badge>
                  <span className="font-medium">{m.articulo_nombre}</span>
                  <span className="text-muted-foreground">{m.cantidad} uds</span>
                  {m.cliente_nombre && <span className="text-muted-foreground">→ {m.cliente_nombre}</span>}
                  <span className="text-muted-foreground ml-auto">{new Date(m.fecha).toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-muted-foreground">Sin movimientos recientes</p>}
        </CardContent>
      </Card>
    </div>
  )
}

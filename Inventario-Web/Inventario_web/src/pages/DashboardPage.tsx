import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../api/endpoints'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Package, AlertTriangle, Wrench, Trash2, DollarSign, ArrowRightLeft } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const ESTADO_COLORS: Record<string, string> = {
  disponible: '#22c55e',
  prestado: '#3b82f6',
  mantenimiento: '#f59e0b',
  dado_de_baja: '#ef4444',
}

const ESTADO_LABELS: Record<string, string> = {
  disponible: 'Disponible',
  prestado: 'Prestado',
  mantenimiento: 'Mantenimiento',
  dado_de_baja: 'Dado de baja',
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.get().then((r) => r.data),
    refetchInterval: 30000,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!data) return null

  const pieData = Object.entries(data.articulos_por_estado).map(([name, value]) => ({
    name: ESTADO_LABELS[name] || name,
    value,
    color: ESTADO_COLORS[name] || '#64748b',
  }))

  const barData = Object.entries(data.articulos_por_categoria)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const stats = [
    { title: 'Total Artículos', value: data.total_articulos, icon: Package, color: 'text-primary' },
    { title: 'Disponibles', value: data.articulos_por_estado?.disponible || 0, icon: Package, color: 'text-success' },
    { title: 'En Mantenimiento', value: data.articulos_por_estado?.mantenimiento || 0, icon: Wrench, color: 'text-accent' },
    { title: 'Valor Total', value: `$${data.valor_total?.toLocaleString() || 0}`, icon: DollarSign, color: 'text-primary' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Artículos por Estado</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground py-10">Sin datos</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Artículos por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground py-10">Sin datos</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Últimos Movimientos</CardTitle>
        </CardHeader>
        <CardContent>
          {data.ultimos_movimientos.length > 0 ? (
            <div className="space-y-3">
              {data.ultimos_movimientos.map((m) => (
                <div key={m.id} className="flex items-center gap-3 text-sm border-b pb-2 last:border-0">
                  <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium capitalize">{m.tipo}</span>
                  <span>{m.articulo_nombre}</span>
                  <span className="text-muted-foreground ml-auto">
                    {new Date(m.fecha).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Sin movimientos recientes</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

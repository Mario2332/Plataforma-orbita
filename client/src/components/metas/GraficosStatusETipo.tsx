import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { PieChart as PieChartIcon, BarChart3 } from "lucide-react";

interface Meta {
  id: string;
  tipo: string;
  status: string;
}

interface GraficosStatusETipoProps {
  metas: Meta[];
}

const CORES_STATUS = {
  ativa: '#3b82f6',      // azul
  concluida: '#10b981',  // verde
  expirada: '#ef4444',   // vermelho
  cancelada: '#6b7280',  // cinza
};

const NOMES_STATUS: Record<string, string> = {
  ativa: 'Ativas',
  concluida: 'Concluídas',
  expirada: 'Expiradas',
  cancelada: 'Canceladas',
};

const NOMES_TIPOS: Record<string, string> = {
  horas: 'Horas de Estudo',
  questoes: 'Questões',
  simulados: 'Simulados',
  topicos: 'Tópicos',
  sequencia: 'Sequência',
  desempenho: 'Desempenho',
};

export function GraficosStatusETipo({ metas }: GraficosStatusETipoProps) {
  // Dados para gráfico de pizza (status)
  const dadosStatus = Object.entries(
    metas.reduce((acc, meta) => {
      acc[meta.status] = (acc[meta.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([status, count]) => ({
    name: NOMES_STATUS[status] || status,
    value: count,
    color: CORES_STATUS[status as keyof typeof CORES_STATUS] || '#6b7280',
  }));

  // Dados para gráfico de barras (tipo)
  const dadosTipo = Object.entries(
    metas.reduce((acc, meta) => {
      acc[meta.tipo] = (acc[meta.tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([tipo, count]) => ({
    tipo: NOMES_TIPOS[tipo] || tipo,
    total: count,
    concluidas: metas.filter(m => m.tipo === tipo && m.status === 'concluida').length,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de Pizza - Status das Metas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-primary" />
            Status das Metas
          </CardTitle>
          <CardDescription>
            Distribuição por status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dadosStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {dadosStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Barras - Taxa de Conclusão por Tipo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Taxa de Conclusão por Tipo
          </CardTitle>
          <CardDescription>
            Metas concluídas vs total por tipo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosTipo}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="tipo" 
                className="text-xs"
                tick={{ fontSize: 11 }}
                angle={-15}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                className="text-xs"
                tick={{ fontSize: 12 }}
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="total" fill="#3b82f6" name="Total" />
              <Bar dataKey="concluidas" fill="#10b981" name="Concluídas" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

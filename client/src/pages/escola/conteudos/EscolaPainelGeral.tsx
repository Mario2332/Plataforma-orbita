import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import studyData from "@shared/study-content-data.json";

export default function EscolaPainelGeral() {
  const stats = useMemo(() => {
    const materias = Object.entries(studyData as Record<string, any>);
    let totalTopicos = 0;

    const resumoPorMateria = materias.map(([key, materia]) => {
      const topicosMateria = materia.topics?.length || 0;
      totalTopicos += topicosMateria;

      return {
        materia: materia.displayName,
        topicos: topicosMateria,
      };
    });

    return {
      totalTopicos,
      resumoPorMateria
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tópicos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTopicos}</div>
            <p className="text-xs text-muted-foreground">
              Distribuídos em {stats.resumoPorMateria.length} matérias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Barras */}
      <Card>
        <CardHeader>
          <CardTitle>Tópicos por Matéria</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={stats.resumoPorMateria}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="materia" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="topicos" name="Tópicos" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela Resumo */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo por Matéria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Matéria</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Tópicos</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {stats.resumoPorMateria.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{item.materia}</td>
                    <td className="px-4 py-3 text-sm text-center">{item.topicos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

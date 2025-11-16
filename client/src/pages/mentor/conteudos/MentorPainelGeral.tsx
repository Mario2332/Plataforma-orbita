import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BookOpen } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import studyData from "@shared/study-content-data.json";
import { toast } from "sonner";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#6366f1"];

export default function MentorPainelGeral() {
  const [customTopics, setCustomTopics] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Carregar customizações do Firestore
      const customTopicsSnapshot = await getDocs(collection(db, "conteudos"));
      const customTopicsData: Record<string, any> = {};
      customTopicsSnapshot.forEach((doc) => {
        customTopicsData[doc.id] = doc.data();
      });
      setCustomTopics(customTopicsData);
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    const materias = Object.entries(studyData as Record<string, any>);
    let totalTopicos = 0;

    const resumoPorMateria = materias.map(([key, materia]) => {
      let topics = [...(materia.topics || [])];
      
      // Aplicar customizações
      Object.entries(customTopics).forEach(([topicId, topicData]: [string, any]) => {
        if (topicData.materiaKey === key) {
          if (topicData.deleted) {
            topics = topics.filter(t => t.id !== topicId);
          } else {
            const existingIndex = topics.findIndex(t => t.id === topicId);
            if (existingIndex >= 0) {
              topics[existingIndex] = { ...topics[existingIndex], ...topicData };
            } else {
              topics.push(topicData);
            }
          }
        }
      });
      
      const topicosMateria = topics.length;
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
  }, [customTopics]);

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

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

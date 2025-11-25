import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from "lucide-react";

interface Meta {
  id: string;
  status: string;
  createdAt: any;
  dataConclusao?: any;
}

interface GraficoMetasPorDiaProps {
  metas: Meta[];
  diasPeriodo?: number; // Número de dias a exibir (padrão: 30)
}

export function GraficoMetasPorDia({ metas, diasPeriodo = 30 }: GraficoMetasPorDiaProps) {
  // Gerar dados dos últimos N dias
  const hoje = new Date();
  const dados: any[] = [];
  
  for (let i = diasPeriodo - 1; i >= 0; i--) {
    const data = new Date(hoje);
    data.setDate(data.getDate() - i);
    data.setHours(0, 0, 0, 0);
    // Usar timezone local
    const year = data.getFullYear();
    const month = String(data.getMonth() + 1).padStart(2, '0');
    const day = String(data.getDate()).padStart(2, '0');
    const dataStr = `${year}-${month}-${day}`;
    
    // Contar metas criadas neste dia
    const metasCriadas = metas.filter(m => {
      if (!m.createdAt) return false;
      try {
        // Converter Firestore Timestamp para Date
        let createdDate: Date;
        if (m.createdAt?._seconds) {
          // Formato Firestore Timestamp {_seconds, _nanoseconds}
          createdDate = new Date(m.createdAt._seconds * 1000);
        } else if (m.createdAt?.toDate) {
          // Firestore Timestamp com método toDate()
          createdDate = m.createdAt.toDate();
        } else {
          // String ou número
          createdDate = new Date(m.createdAt);
        }
        
        if (isNaN(createdDate.getTime())) return false;
        // Usar timezone local
        const cYear = createdDate.getFullYear();
        const cMonth = String(createdDate.getMonth() + 1).padStart(2, '0');
        const cDay = String(createdDate.getDate()).padStart(2, '0');
        const metaDataStr = `${cYear}-${cMonth}-${cDay}`;
        return metaDataStr === dataStr;
      } catch {
        return false;
      }
    }).length;
    
    // Contar metas concluídas neste dia
    const metasConcluidas = metas.filter(m => {
      if (!m.dataConclusao) return false;
      try {
        // Converter Firestore Timestamp para Date
        let conclusaoDate: Date;
        if (m.dataConclusao?._seconds) {
          // Formato Firestore Timestamp {_seconds, _nanoseconds}
          conclusaoDate = new Date(m.dataConclusao._seconds * 1000);
        } else if (m.dataConclusao?.toDate) {
          // Firestore Timestamp com método toDate()
          conclusaoDate = m.dataConclusao.toDate();
        } else {
          // String ou número
          conclusaoDate = new Date(m.dataConclusao);
        }
        
        if (isNaN(conclusaoDate.getTime())) return false;
        // Usar timezone local
        const concYear = conclusaoDate.getFullYear();
        const concMonth = String(conclusaoDate.getMonth() + 1).padStart(2, '0');
        const concDay = String(conclusaoDate.getDate()).padStart(2, '0');
        return `${concYear}-${concMonth}-${concDay}` === dataStr;
      } catch {
        return false;
      }
    }).length;
    
    // Formatar data para exibição (DD/MM)
    const dia = data.getDate().toString().padStart(2, '0');
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    
    dados.push({
      data: `${dia}/${mes}`,
      criadas: metasCriadas,
      concluidas: metasConcluidas,
    });
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Acompanhamento de metas
        </CardTitle>
        <CardDescription>
          {diasPeriodo === 7 ? 'Últimos 7 dias' : diasPeriodo === 15 ? 'Últimos 15 dias' : diasPeriodo === 30 ? 'Últimos 30 dias' : diasPeriodo === 60 ? 'Últimos 60 dias' : diasPeriodo === 90 ? 'Últimos 90 dias' : 'Todos os períodos'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dados}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="data" 
              className="text-xs"
              tick={{ fontSize: 12 }}
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
            <Line 
              type="monotone" 
              dataKey="criadas" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Metas Criadas"
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="concluidas" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Metas Concluídas"
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

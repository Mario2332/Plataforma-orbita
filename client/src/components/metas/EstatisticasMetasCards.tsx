import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, CheckCircle2, TrendingUp, Flame } from "lucide-react";

interface Meta {
  id: string;
  status: string;
  valorAtual: number;
  valorAlvo: number;
  createdAt: any;
}

interface EstatisticasMetasCardsProps {
  metas: Meta[];
}

export function EstatisticasMetasCards({ metas }: EstatisticasMetasCardsProps) {
  // Calcular estatísticas
  const totalMetas = metas.length;
  const metasConcluidas = metas.filter(m => m.status === 'concluida').length;
  const metasAtivas = metas.filter(m => m.status === 'ativa').length;
  
  // Taxa de conclusão
  const taxaConclusao = totalMetas > 0 
    ? Math.round((metasConcluidas / totalMetas) * 100) 
    : 0;
  
  // Sequência de dias com metas concluídas
  const diasComMetasConcluidas = new Set(
    metas
      .filter(m => m.status === 'concluida' && m.dataConclusao)
      .map(m => {
        try {
          const date = m.dataConclusao?.toDate ? m.dataConclusao.toDate() : new Date(m.dataConclusao);
          if (isNaN(date.getTime())) return null;
          // Usar timezone local para evitar problemas de fuso horário
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        } catch {
          return null;
        }
      })
      .filter(d => d !== null)
  );
  
  // Calcular sequência atual (dias consecutivos)
  let sequenciaAtual = 0;
  const hoje = new Date();
  for (let i = 0; i < 365; i++) {
    const data = new Date(hoje);
    data.setDate(data.getDate() - i);
    // Usar timezone local
    const year = data.getFullYear();
    const month = String(data.getMonth() + 1).padStart(2, '0');
    const day = String(data.getDate()).padStart(2, '0');
    const dataStr = `${year}-${month}-${day}`;
    
    if (diasComMetasConcluidas.has(dataStr)) {
      sequenciaAtual++;
    } else if (i > 0) {
      // Se não é hoje e não tem meta, quebra a sequência
      break;
    }
  }
  
  // Meta com melhor desempenho (maior progresso)
  const metaComMelhorDesempenho = metas
    .filter(m => m.status === 'ativa')
    .sort((a, b) => {
      const progressoA = (a.valorAtual / a.valorAlvo) * 100;
      const progressoB = (b.valorAtual / b.valorAlvo) * 100;
      return progressoB - progressoA;
    })[0];
  
  const melhorDesempenho = metaComMelhorDesempenho
    ? Math.round((metaComMelhorDesempenho.valorAtual / metaComMelhorDesempenho.valorAlvo) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
      {/* Metas Ativas */}
      <Card className="relative overflow-hidden border-2 hover:border-blue-500 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
        
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Metas Ativas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{metasAtivas}</div>
          <p className="text-xs text-muted-foreground mt-1">em andamento</p>
        </CardContent>
      </Card>

      {/* Metas Concluídas */}
      <Card className="relative overflow-hidden border-2 hover:border-green-500 transition-all duration-500 hover:shadow-2xl hover:shadow-green-500/20 group">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
        
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Metas Concluídas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">{metasConcluidas}</div>
          <p className="text-xs text-muted-foreground mt-1">alcançadas</p>
        </CardContent>
      </Card>

      {/* Taxa de Conclusão */}
      <Card className="relative overflow-hidden border-2 hover:border-purple-500 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 group">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
        
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            Taxa de Conclusão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{taxaConclusao}%</div>
          <p className="text-xs text-muted-foreground mt-1">de sucesso</p>
        </CardContent>
      </Card>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getEstudosDirect, getSimuladosDirect } from "@/lib/firestore-direct";
import { 
  Activity, BookOpen, Calendar, FileText, TrendingUp, Clock,
  CheckCircle2, BarChart3, PlayCircle, Plus, ArrowRight,
  Flame, Zap, Star, TrendingDown, Heart
} from "lucide-react";
import { useLocation } from "wouter";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { RankingModal, RankingResumo } from "@/components/RankingModal";
import { InContentAd, ResponsiveAd } from "@/components/ads";

const formatarDataBrasil = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const MATERIAS_ENEM = [
  "Matemática", "Biologia", "Física", "Química",
  "História", "Geografia", "Filosofia", "Sociologia", "Linguagens",
] as const;

export default function AlunoHome() {
  const { user } = useAuthContext();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [estudos, setEstudos] = useState<any[]>([]);
  const [simulados, setSimulados] = useState<any[]>([]);
  
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        const [estudosData, simuladosData] = await Promise.all([
          getEstudosDirect(),
          getSimuladosDirect()
        ]);
        setEstudos(estudosData);
        setSimulados(simuladosData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const calcularEstatisticas = () => {
    const hoje = new Date();
    const ultimos7Dias = estudos.filter(e => {
      const dataEstudo = new Date(e.data);
      const diffTime = Math.abs(hoje.getTime() - dataEstudo.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    });
    
    const tempoTotal = estudos.reduce((acc, e) => acc + (e.tempoMinutos || 0), 0);
    const questoesTotal = estudos.reduce((acc, e) => acc + (e.questoesRealizadas || 0), 0);
    const questoesCorretas = estudos.reduce((acc, e) => acc + (e.questoesCorretas || 0), 0);
    const percentualAcerto = questoesTotal > 0 ? Math.round((questoesCorretas / questoesTotal) * 100) : 0;
    
    const ultimoSimulado = simulados.length > 0 ? simulados[simulados.length - 1] : null;
    
    return {
      diasAtivos: ultimos7Dias.length,
      tempoTotal,
      questoesTotal,
      percentualAcerto,
      ultimoSimulado
    };
  };

  const stats = calcularEstatisticas();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Hero Section com Gradiente */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Olá, {user?.nome || "Estudante"}!</h1>
              <p className="text-emerald-50">Continue focado nos seus estudos e alcance seus objetivos!</p>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
              <Flame className="h-6 w-6 text-orange-300" />
              <div className="text-right">
                <div className="text-2xl font-bold">{stats.diasAtivos}</div>
                <div className="text-xs text-emerald-50">dias ativos</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8" />
                <div>
                  <div className="text-2xl font-bold">{Math.floor(stats.tempoTotal / 60)}h {stats.tempoTotal % 60}min</div>
                  <div className="text-sm text-emerald-50">Tempo Total</div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8" />
                <div>
                  <div className="text-2xl font-bold">{stats.questoesTotal}</div>
                  <div className="text-sm text-emerald-50">Questões ({stats.percentualAcerto}% acerto)</div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8" />
                <div>
                  <div className="text-2xl font-bold">{stats.ultimoSimulado?.acertos || 0}/180</div>
                  <div className="text-sm text-emerald-50">Último Simulado</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Ação Rápida */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setLocation("/aluno/estudos")}
          className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <div className="flex items-center gap-4">
            <PlayCircle className="h-12 w-12" />
            <div className="text-left">
              <div className="text-xl font-bold">Iniciar Cronômetro</div>
              <div className="text-sm text-blue-100">Registre seu tempo de estudo</div>
            </div>
          </div>
        </button>
        
        <button
          onClick={() => setLocation("/aluno/estudos")}
          className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <div className="flex items-center gap-4">
            <Plus className="h-12 w-12" />
            <div className="text-left">
              <div className="text-xl font-bold">Registrar Estudo</div>
              <div className="text-sm text-purple-100">Adicione manualmente</div>
            </div>
          </div>
        </button>
        
        <button
          onClick={() => setLocation("/aluno/simulados")}
          className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 p-6 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <div className="flex items-center gap-4">
            <FileText className="h-12 w-12" />
            <div className="text-left">
              <div className="text-xl font-bold">Novo Simulado</div>
              <div className="text-sm text-teal-100">Registre seus resultados</div>
            </div>
          </div>
        </button>
      </div>

      <InContentAd />

      {/* Timeline de Atividade Recente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-500" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {estudos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum estudo registrado ainda</p>
              <Button onClick={() => setLocation("/aluno/estudos")} className="mt-4">
                Registrar Primeiro Estudo
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {estudos.slice(-5).reverse().map((estudo, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{estudo.materia}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(estudo.data).toLocaleDateString("pt-BR")} • {estudo.tempoMinutos} min
                      {estudo.questoesRealizadas > 0 && ` • ${estudo.questoesRealizadas} questões`}
                    </div>
                  </div>
                  {estudo.questoesRealizadas > 0 && (
                    <div className="text-right">
                      <div className="font-bold text-emerald-600 dark:text-emerald-400">
                        {Math.round((estudo.questoesCorretas / estudo.questoesRealizadas) * 100)}%
                      </div>
                      <div className="text-xs text-muted-foreground">acerto</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ResponsiveAd />
      
      <RankingResumo />
    </div>
  );
}

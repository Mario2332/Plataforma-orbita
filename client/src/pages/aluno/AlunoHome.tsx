import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getEstudosDirect, getSimuladosDirect, getMetasDirect } from "@/lib/firestore-direct";
import { 
  Activity, 
  BookOpen, 
  Calendar, 
  FileText, 
  Target, 
  TrendingUp, 
  Clock,
  CheckCircle2,
  BarChart3,
  PlayCircle,
  Plus,
  ArrowRight,
  Flame,
  Trophy,
  Zap,
  Star,
  Award,
  TrendingDown,
  Heart,
  Brain,
  Sparkles,
  Rocket,
  ChevronRight,
  CircleDot
} from "lucide-react";
import { useLocation } from "wouter";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { RankingModal, RankingResumo } from "@/components/RankingModal";
import { InContentAd, ResponsiveAd } from "@/components/ads";

// Função auxiliar para formatar data no fuso horário brasileiro (GMT-3)
const formatarDataBrasil = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Matérias padronizadas do ENEM
const MATERIAS_ENEM = [
  "Matemática",
  "Biologia",
  "Física",
  "Química",
  "História",
  "Geografia",
  "Filosofia",
  "Sociologia",
  "Linguagens",
] as const;

export default function AlunoHome() {
  const [, setLocation] = useLocation();
  const { userData } = useAuthContext();
  const [estudos, setEstudos] = useState<any[]>([]);
  const [simulados, setSimulados] = useState<any[]>([]);
  const [metas, setMetas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rankingModalOpen, setRankingModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [estudosData, simuladosData, metasData] = await Promise.all([
        getEstudosDirect(),
        getSimuladosDirect(),
        getMetasDirect(),
      ]);
      setEstudos(estudosData as any[]);
      setSimulados(simuladosData as any[]);
      setMetas(metasData as any[]);
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-primary"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Zap className="h-5 w-5 text-primary animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Calcular métricas
  const tempoTotal = estudos?.reduce((acc, e) => acc + e.tempoMinutos, 0) || 0;
  const questoesTotal = estudos?.reduce((acc, e) => acc + e.questoesFeitas, 0) || 0;
  const acertosTotal = estudos?.reduce((acc, e) => acc + e.questoesAcertadas, 0) || 0;
  const percentualAcerto = questoesTotal > 0 ? Math.round((acertosTotal / questoesTotal) * 100) : 0;

  // Último simulado
  const ultimoSimulado = simulados?.[0];
  const acertosUltimoSimulado = ultimoSimulado
    ? ultimoSimulado.linguagensAcertos +
      ultimoSimulado.humanasAcertos +
      ultimoSimulado.naturezaAcertos +
      ultimoSimulado.matematicaAcertos
    : 0;

  // Calcular streak (dias consecutivos de estudo)
  const calcularStreak = () => {
    if (!estudos || estudos.length === 0) return 0;
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const datasEstudo = estudos
      .map(e => {
        try {
          let data: Date;
          
          if (e.data?.seconds || e.data?._seconds) {
            const seconds = e.data.seconds || e.data._seconds;
            data = new Date(seconds * 1000);
          } else if (e.data?.toDate) {
            data = e.data.toDate();
          } else {
            data = new Date(e.data);
          }
          
          if (isNaN(data.getTime())) {
            return null;
          }
          
          data.setHours(0, 0, 0, 0);
          return data.getTime();
        } catch (error) {
          return null;
        }
      })
      .filter((v): v is number => v !== null)
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => b - a);
    
    let streak = 0;
    let dataEsperada = hoje.getTime();
    
    const ontem = hoje.getTime() - 24 * 60 * 60 * 1000;
    const estudouHoje = datasEstudo.includes(hoje.getTime());
    const estudouOntem = datasEstudo.includes(ontem);
    
    if (!estudouHoje && !estudouOntem) {
      return 0;
    }
    
    if (!estudouHoje) {
      dataEsperada = ontem;
    }
    
    for (const data of datasEstudo) {
      if (data === dataEsperada) {
        streak++;
        dataEsperada -= 24 * 60 * 60 * 1000;
      } else if (data < dataEsperada) {
        break;
      }
    }
    
    return streak;
  };

  const streak = calcularStreak();

  // Análise por matéria
  const calcularAnalisePorMateria = () => {
    if (!estudos || estudos.length === 0) {
      return { pontosFortes: [], pontosFracos: [], todas: [] };
    }
    
    const porMateria: Record<string, { questoes: number; acertos: number; tempo: number }> = {};
    
    for (const estudo of estudos) {
      const materia = estudo.materia;
      if (!porMateria[materia]) {
        porMateria[materia] = { questoes: 0, acertos: 0, tempo: 0 };
      }
      porMateria[materia].questoes += estudo.questoesFeitas || 0;
      porMateria[materia].acertos += estudo.questoesAcertadas || 0;
      porMateria[materia].tempo += estudo.tempoMinutos || 0;
    }
    
    const pontosFortes: Array<{ materia: string; percentual: number; acertos: number; questoes: number }> = [];
    const pontosFracos: Array<{ materia: string; percentual: number; acertos: number; questoes: number }> = [];
    const todas: Array<{ materia: string; percentual: number; tempo: number; questoes: number }> = [];
    
    for (const [materia, dados] of Object.entries(porMateria)) {
      const percentual = dados.questoes > 0 ? Math.round((dados.acertos / dados.questoes) * 100) : 0;
      const item = { materia, percentual, acertos: dados.acertos, questoes: dados.questoes, tempo: dados.tempo };
      
      todas.push(item);
      
      if (dados.questoes >= 5) {
        if (percentual >= 80) {
          pontosFortes.push(item);
        } else if (percentual < 60) {
          pontosFracos.push(item);
        }
      }
    }
    
    todas.sort((a, b) => b.tempo - a.tempo);
    
    return { pontosFortes, pontosFracos, todas: todas.slice(0, 5) };
  };
  
  const analisePorMateria = calcularAnalisePorMateria();

  // Últimos estudos (timeline)
  const ultimosEstudos = estudos
    .slice(0, 5)
    .map(e => {
      try {
        let data: Date;
        if (e.data?.seconds || e.data?._seconds) {
          const seconds = e.data.seconds || e.data._seconds;
          data = new Date(seconds * 1000);
        } else if (e.data?.toDate) {
          data = e.data.toDate();
        } else {
          data = new Date(e.data);
        }
        return { ...e, dataFormatada: data };
      } catch {
        return { ...e, dataFormatada: new Date() };
      }
    });

  // Metas ativas
  const metasAtivas = metas.filter(m => m.status === 'ativa').slice(0, 3);

  return (
    <div className="space-y-6 pb-6">
      
      {/* Hero Section - Banner Grande com Estatísticas Principais */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-400/20 rounded-full -ml-48 -mb-48 blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="h-8 w-8" />
                <h1 className="text-4xl font-bold">
                  Olá, {userData?.name?.split(' ')[0] || "Aluno"}!
                </h1>
              </div>
              <p className="text-emerald-100 text-lg">
                Seu progresso está incrível. Continue assim!
              </p>
            </div>
            
            {/* Streak Badge */}
            {streak > 0 && (
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center min-w-[120px]">
                <Flame className="h-8 w-8 mx-auto mb-2 text-orange-300" />
                <div className="text-3xl font-bold">{streak}</div>
                <div className="text-sm text-emerald-100">dias seguidos</div>
              </div>
            )}
          </div>

          {/* Estatísticas Principais em Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-5 w-5 text-emerald-200" />
                <span className="text-sm text-emerald-100">Tempo Total</span>
              </div>
              <div className="text-3xl font-bold">
                {Math.floor(tempoTotal / 60)}h {tempoTotal % 60}min
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-200" />
                <span className="text-sm text-emerald-100">Questões Resolvidas</span>
              </div>
              <div className="text-3xl font-bold">{questoesTotal}</div>
              <div className="text-sm text-emerald-200 mt-1">{percentualAcerto}% de acerto</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="h-5 w-5 text-emerald-200" />
                <span className="text-sm text-emerald-100">Último Simulado</span>
              </div>
              <div className="text-3xl font-bold">{acertosUltimoSimulado}/180</div>
              <div className="text-sm text-emerald-200 mt-1">
                {Math.round((acertosUltimoSimulado / 180) * 100)}% de aproveitamento
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ranking para mobile */}
      <div className="md:hidden">
        <RankingResumo onClick={() => setRankingModalOpen(true)} />
      </div>

      {/* Layout Assimétrico - 2 Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna Esquerda (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Cards de Ação Rápida */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => setLocation('/aluno/estudos')}
              className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <BookOpen className="h-8 w-8 mb-3" />
              <div className="text-sm font-medium">Registrar</div>
              <div className="text-xs opacity-90">Estudo</div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            </button>

            <button
              onClick={() => setLocation('/aluno/simulados')}
              className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <FileText className="h-8 w-8 mb-3" />
              <div className="text-sm font-medium">Adicionar</div>
              <div className="text-xs opacity-90">Simulado</div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            </button>

            <button
              onClick={() => setLocation('/aluno/metas')}
              className="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <Target className="h-8 w-8 mb-3" />
              <div className="text-sm font-medium">Criar</div>
              <div className="text-xs opacity-90">Meta</div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            </button>

            <button
              onClick={() => setLocation('/aluno/diario')}
              className="group relative overflow-hidden bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <Heart className="h-8 w-8 mb-3" />
              <div className="text-sm font-medium">Abrir</div>
              <div className="text-xs opacity-90">Diário</div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            </button>
          </div>

          {/* Timeline de Últimos Estudos */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-600" />
                    Atividade Recente
                  </CardTitle>
                  <CardDescription>Seus últimos estudos registrados</CardDescription>
                </div>
                <button
                  onClick={() => setLocation('/aluno/estudos')}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                >
                  Ver todos
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {ultimosEstudos.length > 0 ? (
                <div className="space-y-4">
                  {ultimosEstudos.map((estudo, index) => (
                    <div key={index} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        {index < ultimosEstudos.length - 1 && (
                          <div className="absolute top-10 left-5 w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {estudo.materia}
                          </h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {estudo.dataFormatada.toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {estudo.tempoMinutos}min
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            {estudo.questoesFeitas} questões
                          </span>
                          {estudo.questoesFeitas > 0 && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                              {Math.round((estudo.questoesAcertadas / estudo.questoesFeitas) * 100)}% acerto
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum estudo registrado ainda</p>
                  <button
                    onClick={() => setLocation('/aluno/estudos')}
                    className="mt-3 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                  >
                    Registrar primeiro estudo
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance por Matéria */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-emerald-600" />
                Performance por Matéria
              </CardTitle>
              <CardDescription>Top 5 matérias mais estudadas</CardDescription>
            </CardHeader>
            <CardContent>
              {analisePorMateria.todas.length > 0 ? (
                <div className="space-y-4">
                  {analisePorMateria.todas.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 dark:text-white">{item.materia}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {Math.floor(item.tempo / 60)}h {item.tempo % 60}min
                          </span>
                          {item.questoes > 0 && (
                            <span className={`text-sm font-medium ${
                              item.percentual >= 80 ? 'text-emerald-600' :
                              item.percentual >= 60 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {item.percentual}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.percentual >= 80 ? 'bg-emerald-500' :
                            item.percentual >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${item.percentual}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Comece a estudar para ver sua performance</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Coluna Direita (1/3) */}
        <div className="space-y-6">
          
          {/* Ranking - Desktop */}
          <div className="hidden md:block">
            <RankingResumo onClick={() => setRankingModalOpen(true)} />
          </div>

          {/* Metas em Destaque */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-emerald-600" />
                  Metas Ativas
                </CardTitle>
                <button
                  onClick={() => setLocation('/aluno/metas')}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {metasAtivas.length > 0 ? (
                <div className="space-y-4">
                  {metasAtivas.map((meta, index) => (
                    <div key={index} className="p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {meta.titulo || meta.tipo}
                        </h4>
                        <Trophy className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                          <span>Progresso</span>
                          <span className="font-medium">
                            {meta.valorAtual || 0} / {meta.valorAlvo}
                          </span>
                        </div>
                        <div className="h-2 bg-white/50 dark:bg-gray-800/50 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${Math.min(((meta.valorAtual || 0) / meta.valorAlvo) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Nenhuma meta ativa</p>
                  <button
                    onClick={() => setLocation('/aluno/metas')}
                    className="mt-3 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                  >
                    Criar meta
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Conquistas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-emerald-600" />
                Conquistas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {/* Badge Streak */}
                <div className={`p-3 rounded-lg text-center ${
                  streak >= 7 ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  <Flame className={`h-6 w-6 mx-auto mb-1 ${
                    streak >= 7 ? 'text-orange-500' : 'text-gray-400'
                  }`} />
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {streak >= 7 ? 'Fogo!' : 'Streak'}
                  </div>
                </div>

                {/* Badge Questões */}
                <div className={`p-3 rounded-lg text-center ${
                  questoesTotal >= 100 ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  <CheckCircle2 className={`h-6 w-6 mx-auto mb-1 ${
                    questoesTotal >= 100 ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {questoesTotal >= 100 ? 'Expert' : 'Questões'}
                  </div>
                </div>

                {/* Badge Tempo */}
                <div className={`p-3 rounded-lg text-center ${
                  tempoTotal >= 600 ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  <Clock className={`h-6 w-6 mx-auto mb-1 ${
                    tempoTotal >= 600 ? 'text-purple-500' : 'text-gray-400'
                  }`} />
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {tempoTotal >= 600 ? 'Dedicado' : 'Tempo'}
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <Rocket className="h-4 w-4 text-emerald-600" />
                  <span className="font-medium">Continue assim!</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Você está no caminho certo para alcançar seus objetivos.
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Anúncio */}
      <InContentAd />

      {/* Modal de Ranking */}
      <RankingModal 
        open={rankingModalOpen} 
        onOpenChange={setRankingModalOpen}
      />
    </div>
  );
}

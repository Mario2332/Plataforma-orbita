import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAlunoApi } from "@/hooks/useAlunoApi";
import { Plus, Trash2, Edit2, TrendingUp, Award, FileText, Clock, Target, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, Cell, Legend } from "recharts";
import { db, auth } from "@/lib/firebase";
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, Timestamp } from "firebase/firestore";

// Valores fixos das notas do ENEM por competência
const NOTAS_COMPETENCIA = [0, 40, 80, 120, 160, 200];

// Cores para as competências
const CORES_COMPETENCIAS = {
  c1: "#3b82f6", // blue
  c2: "#10b981", // green
  c3: "#f59e0b", // amber
  c4: "#8b5cf6", // purple
  c5: "#ef4444", // red
};

// Nomes das competências
const NOMES_COMPETENCIAS = {
  c1: "C1 - Norma Culta",
  c2: "C2 - Tema/Estrutura",
  c3: "C3 - Argumentação",
  c4: "C4 - Coesão",
  c5: "C5 - Proposta",
};

interface Redacao {
  id: string;
  titulo: string;
  data: string;
  tempoHoras: number;
  tempoMinutos: number;
  c1: number;
  c2: number;
  c3: number;
  c4: number;
  c5: number;
  notaTotal: number;
  criadoEm: Date;
}

interface RedacaoForm {
  titulo: string;
  data: string;
  tempoHoras: string;
  tempoMinutos: string;
  c1: string;
  c2: string;
  c3: string;
  c4: string;
  c5: string;
}

const initialForm: RedacaoForm = {
  titulo: "",
  data: new Date().toISOString().split('T')[0],
  tempoHoras: "1",
  tempoMinutos: "30",
  c1: "",
  c2: "",
  c3: "",
  c4: "",
  c5: "",
};

export default function AlunoRedacoes() {
  const alunoApi = useAlunoApi();
  const [redacoes, setRedacoes] = useState<Redacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<RedacaoForm>(initialForm);
  const [metaNota, setMetaNota] = useState<number>(900);
  const [filtroPeriodo, setFiltroPeriodo] = useState<string>("todo");
  const [showHistorico, setShowHistorico] = useState(false);

  // Carregar redações do Firestore
  useEffect(() => {
    loadRedacoes();
    loadMeta();
  }, []);

  const getAlunoId = () => {
    // Se estiver em modo mentor, pegar o alunoId da URL
    const urlParams = new URLSearchParams(window.location.search);
    const alunoIdFromUrl = urlParams.get('alunoId');
    if (alunoIdFromUrl) return alunoIdFromUrl;
    
    // Caso contrário, usar o usuário logado
    return auth.currentUser?.uid || "";
  };

  const loadRedacoes = async () => {
    try {
      setIsLoading(true);
      const alunoId = getAlunoId();
      if (!alunoId) return;

      const redacoesRef = collection(db, "alunos", alunoId, "redacoes");
      const q = query(redacoesRef, orderBy("data", "desc"));
      const snapshot = await getDocs(q);
      
      const redacoesData: Redacao[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          titulo: data.titulo || "",
          data: data.data || "",
          tempoHoras: data.tempoHoras || 0,
          tempoMinutos: data.tempoMinutos || 0,
          c1: data.c1 || 0,
          c2: data.c2 || 0,
          c3: data.c3 || 0,
          c4: data.c4 || 0,
          c5: data.c5 || 0,
          notaTotal: data.notaTotal || 0,
          criadoEm: data.criadoEm?.toDate() || new Date(),
        };
      });
      
      setRedacoes(redacoesData);
    } catch (error) {
      console.error("Erro ao carregar redações:", error);
      toast.error("Erro ao carregar redações");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMeta = async () => {
    try {
      const alunoId = getAlunoId();
      if (!alunoId) return;

      const metaRef = doc(db, "alunos", alunoId, "configuracoes", "redacoes");
      const snapshot = await getDocs(collection(db, "alunos", alunoId, "configuracoes"));
      const metaDoc = snapshot.docs.find(d => d.id === "redacoes");
      if (metaDoc) {
        setMetaNota(metaDoc.data().metaNota || 900);
      }
    } catch (error) {
      console.error("Erro ao carregar meta:", error);
    }
  };

  const saveMeta = async (novaMeta: number) => {
    try {
      const alunoId = getAlunoId();
      if (!alunoId) return;

      const metaRef = doc(db, "alunos", alunoId, "configuracoes", "redacoes");
      await updateDoc(metaRef, { metaNota: novaMeta }).catch(async () => {
        // Se não existir, criar
        await addDoc(collection(db, "alunos", alunoId, "configuracoes"), { 
          id: "redacoes",
          metaNota: novaMeta 
        });
      });
      setMetaNota(novaMeta);
      toast.success("Meta atualizada!");
    } catch (error) {
      console.error("Erro ao salvar meta:", error);
    }
  };

  const calcularNotaTotal = (c1: number, c2: number, c3: number, c4: number, c5: number) => {
    return c1 + c2 + c3 + c4 + c5;
  };

  const handleSubmit = async () => {
    // Validações
    if (!form.titulo.trim()) {
      toast.error("Informe o título/tema da redação");
      return;
    }
    if (!form.data) {
      toast.error("Informe a data de realização");
      return;
    }
    if (!form.c1 || !form.c2 || !form.c3 || !form.c4 || !form.c5) {
      toast.error("Informe todas as notas por competência");
      return;
    }

    try {
      setIsSaving(true);
      const alunoId = getAlunoId();
      if (!alunoId) {
        toast.error("Usuário não identificado");
        return;
      }

      const notaTotal = calcularNotaTotal(
        parseInt(form.c1),
        parseInt(form.c2),
        parseInt(form.c3),
        parseInt(form.c4),
        parseInt(form.c5)
      );

      const redacaoData = {
        titulo: form.titulo.trim(),
        data: form.data,
        tempoHoras: parseInt(form.tempoHoras) || 0,
        tempoMinutos: parseInt(form.tempoMinutos) || 0,
        c1: parseInt(form.c1),
        c2: parseInt(form.c2),
        c3: parseInt(form.c3),
        c4: parseInt(form.c4),
        c5: parseInt(form.c5),
        notaTotal,
        criadoEm: Timestamp.now(),
      };

      if (editandoId) {
        // Atualizar redação existente
        const redacaoRef = doc(db, "alunos", alunoId, "redacoes", editandoId);
        await updateDoc(redacaoRef, redacaoData);
        toast.success("Redação atualizada com sucesso!");
      } else {
        // Criar nova redação
        await addDoc(collection(db, "alunos", alunoId, "redacoes"), redacaoData);
        toast.success("Redação registrada com sucesso!");
      }

      setForm(initialForm);
      setEditandoId(null);
      setIsDialogOpen(false);
      loadRedacoes();
    } catch (error) {
      console.error("Erro ao salvar redação:", error);
      toast.error("Erro ao salvar redação");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (redacao: Redacao) => {
    setForm({
      titulo: redacao.titulo,
      data: redacao.data,
      tempoHoras: redacao.tempoHoras.toString(),
      tempoMinutos: redacao.tempoMinutos.toString(),
      c1: redacao.c1.toString(),
      c2: redacao.c2.toString(),
      c3: redacao.c3.toString(),
      c4: redacao.c4.toString(),
      c5: redacao.c5.toString(),
    });
    setEditandoId(redacao.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta redação?")) return;

    try {
      const alunoId = getAlunoId();
      if (!alunoId) return;

      await deleteDoc(doc(db, "alunos", alunoId, "redacoes", id));
      toast.success("Redação excluída com sucesso!");
      loadRedacoes();
    } catch (error) {
      console.error("Erro ao excluir redação:", error);
      toast.error("Erro ao excluir redação");
    }
  };

  // Filtrar redações por período
  const redacoesFiltradas = useMemo(() => {
    if (filtroPeriodo === "todo") return redacoes;
    
    const hoje = new Date();
    const dataLimite = new Date();
    
    switch (filtroPeriodo) {
      case "30dias":
        dataLimite.setDate(hoje.getDate() - 30);
        break;
      case "90dias":
        dataLimite.setDate(hoje.getDate() - 90);
        break;
      case "6meses":
        dataLimite.setMonth(hoje.getMonth() - 6);
        break;
      case "1ano":
        dataLimite.setFullYear(hoje.getFullYear() - 1);
        break;
      default:
        return redacoes;
    }
    
    return redacoes.filter(r => new Date(r.data) >= dataLimite);
  }, [redacoes, filtroPeriodo]);

  // Estatísticas calculadas
  const estatisticas = useMemo(() => {
    if (redacoesFiltradas.length === 0) {
      return {
        mediaGeral: 0,
        melhorNota: 0,
        totalRedacoes: 0,
        tempoMedio: { horas: 0, minutos: 0 },
        tempoExcessivo: false,
        tempoAlerta: false,
        mediasCompetencias: { c1: 0, c2: 0, c3: 0, c4: 0, c5: 0 },
        pontoFraco: null as string | null,
      };
    }

    // Usar últimas 5 redações para média mais realista
    const ultimasRedacoes = redacoesFiltradas.slice(0, 5);
    const mediaGeral = Math.round(ultimasRedacoes.reduce((acc, r) => acc + r.notaTotal, 0) / ultimasRedacoes.length);
    const melhorNota = Math.max(...redacoesFiltradas.map(r => r.notaTotal));
    
    // Tempo médio
    const totalMinutos = redacoesFiltradas.reduce((acc, r) => acc + (r.tempoHoras * 60) + r.tempoMinutos, 0);
    const mediaMinutos = totalMinutos / redacoesFiltradas.length;
    const tempoMedio = {
      horas: Math.floor(mediaMinutos / 60),
      minutos: Math.round(mediaMinutos % 60),
    };
    
    // Alertas de tempo
    const tempoAlerta = mediaMinutos > 90 && mediaMinutos <= 120; // > 1h30 e <= 2h
    const tempoExcessivo = mediaMinutos > 120; // > 2h

    // Médias por competência
    const mediasCompetencias = {
      c1: Math.round(redacoesFiltradas.reduce((acc, r) => acc + r.c1, 0) / redacoesFiltradas.length),
      c2: Math.round(redacoesFiltradas.reduce((acc, r) => acc + r.c2, 0) / redacoesFiltradas.length),
      c3: Math.round(redacoesFiltradas.reduce((acc, r) => acc + r.c3, 0) / redacoesFiltradas.length),
      c4: Math.round(redacoesFiltradas.reduce((acc, r) => acc + r.c4, 0) / redacoesFiltradas.length),
      c5: Math.round(redacoesFiltradas.reduce((acc, r) => acc + r.c5, 0) / redacoesFiltradas.length),
    };

    // Identificar ponto fraco (menor média)
    const menorMedia = Math.min(...Object.values(mediasCompetencias));
    const pontoFraco = Object.entries(mediasCompetencias).find(([_, v]) => v === menorMedia)?.[0] || null;

    return {
      mediaGeral,
      melhorNota,
      totalRedacoes: redacoesFiltradas.length,
      tempoMedio,
      tempoExcessivo,
      tempoAlerta,
      mediasCompetencias,
      pontoFraco,
    };
  }, [redacoesFiltradas]);

  // Dados para o gráfico de evolução
  const dadosEvolucao = useMemo(() => {
    return [...redacoesFiltradas]
      .reverse()
      .map((r, index) => ({
        nome: `#${index + 1}`,
        data: new Date(r.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        nota: r.notaTotal,
        titulo: r.titulo,
      }));
  }, [redacoesFiltradas]);

  // Dados para o gráfico de radar
  const dadosRadar = useMemo(() => {
    return [
      { competencia: "C1", valor: estatisticas.mediasCompetencias.c1, fullMark: 200 },
      { competencia: "C2", valor: estatisticas.mediasCompetencias.c2, fullMark: 200 },
      { competencia: "C3", valor: estatisticas.mediasCompetencias.c3, fullMark: 200 },
      { competencia: "C4", valor: estatisticas.mediasCompetencias.c4, fullMark: 200 },
      { competencia: "C5", valor: estatisticas.mediasCompetencias.c5, fullMark: 200 },
    ];
  }, [estatisticas.mediasCompetencias]);

  // Dados para o gráfico de barras
  const dadosBarras = useMemo(() => {
    return [
      { nome: "C1", media: estatisticas.mediasCompetencias.c1, cor: CORES_COMPETENCIAS.c1, descricao: "Norma Culta" },
      { nome: "C2", media: estatisticas.mediasCompetencias.c2, cor: CORES_COMPETENCIAS.c2, descricao: "Tema/Estrutura" },
      { nome: "C3", media: estatisticas.mediasCompetencias.c3, cor: CORES_COMPETENCIAS.c3, descricao: "Argumentação" },
      { nome: "C4", media: estatisticas.mediasCompetencias.c4, cor: CORES_COMPETENCIAS.c4, descricao: "Coesão" },
      { nome: "C5", media: estatisticas.mediasCompetencias.c5, cor: CORES_COMPETENCIAS.c5, descricao: "Proposta" },
    ];
  }, [estatisticas.mediasCompetencias]);

  // Nota total calculada no formulário
  const notaTotalForm = useMemo(() => {
    const c1 = parseInt(form.c1) || 0;
    const c2 = parseInt(form.c2) || 0;
    const c3 = parseInt(form.c3) || 0;
    const c4 = parseInt(form.c4) || 0;
    const c5 = parseInt(form.c5) || 0;
    return c1 + c2 + c3 + c4 + c5;
  }, [form]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-gray-200 rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Redações
          </h1>
          <p className="text-muted-foreground">
            Acompanhe sua evolução nas redações do ENEM
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filtroPeriodo} onValueChange={setFiltroPeriodo}>
            <SelectTrigger className="w-[180px] border-2">
              <SelectValue placeholder="Filtrar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">Todo o período</SelectItem>
              <SelectItem value="30dias">Últimos 30 dias</SelectItem>
              <SelectItem value="90dias">Últimos 90 dias</SelectItem>
              <SelectItem value="6meses">Últimos 6 meses</SelectItem>
              <SelectItem value="1ano">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setForm(initialForm);
              setEditandoId(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                <Plus className="h-4 w-4 mr-2" />
                Registrar Nova Redação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  {editandoId ? "Editar Redação" : "Registrar Nova Redação"}
                </DialogTitle>
                <DialogDescription>
                  Preencha as informações da sua redação para acompanhar sua evolução
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Título/Tema */}
                <div className="space-y-2">
                  <Label className="font-semibold">Título/Tema da Redação *</Label>
                  <Input
                    placeholder="Ex: A persistência da violência contra a mulher na sociedade brasileira"
                    value={form.titulo}
                    onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                    className="border-2"
                  />
                </div>

                {/* Data e Tempo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="font-semibold">Data de Realização *</Label>
                    <Input
                      type="date"
                      value={form.data}
                      onChange={(e) => setForm({ ...form, data: e.target.value })}
                      className="border-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">Tempo (Horas)</Label>
                    <Select value={form.tempoHoras} onValueChange={(v) => setForm({ ...form, tempoHoras: v })}>
                      <SelectTrigger className="border-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 1, 2, 3, 4].map(h => (
                          <SelectItem key={h} value={h.toString()}>{h}h</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">Tempo (Minutos)</Label>
                    <Select value={form.tempoMinutos} onValueChange={(v) => setForm({ ...form, tempoMinutos: v })}>
                      <SelectTrigger className="border-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 15, 30, 45].map(m => (
                          <SelectItem key={m} value={m.toString()}>{m}min</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Notas por Competência */}
                <div className="space-y-4">
                  <Label className="font-semibold text-lg">Notas por Competência *</Label>
                  <p className="text-sm text-muted-foreground">
                    Selecione a nota de cada competência conforme a correção da sua redação
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* C1 */}
                    <div className="space-y-2 p-3 rounded-lg border-2 border-blue-200 bg-blue-50/50">
                      <Label className="font-semibold text-blue-700">C1 - Norma Culta</Label>
                      <Select value={form.c1} onValueChange={(v) => setForm({ ...form, c1: v })}>
                        <SelectTrigger className="border-2 border-blue-300">
                          <SelectValue placeholder="Selecione a nota" />
                        </SelectTrigger>
                        <SelectContent>
                          {NOTAS_COMPETENCIA.map(nota => (
                            <SelectItem key={nota} value={nota.toString()}>{nota}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* C2 */}
                    <div className="space-y-2 p-3 rounded-lg border-2 border-green-200 bg-green-50/50">
                      <Label className="font-semibold text-green-700">C2 - Tema/Estrutura</Label>
                      <Select value={form.c2} onValueChange={(v) => setForm({ ...form, c2: v })}>
                        <SelectTrigger className="border-2 border-green-300">
                          <SelectValue placeholder="Selecione a nota" />
                        </SelectTrigger>
                        <SelectContent>
                          {NOTAS_COMPETENCIA.map(nota => (
                            <SelectItem key={nota} value={nota.toString()}>{nota}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* C3 */}
                    <div className="space-y-2 p-3 rounded-lg border-2 border-amber-200 bg-amber-50/50">
                      <Label className="font-semibold text-amber-700">C3 - Argumentação</Label>
                      <Select value={form.c3} onValueChange={(v) => setForm({ ...form, c3: v })}>
                        <SelectTrigger className="border-2 border-amber-300">
                          <SelectValue placeholder="Selecione a nota" />
                        </SelectTrigger>
                        <SelectContent>
                          {NOTAS_COMPETENCIA.map(nota => (
                            <SelectItem key={nota} value={nota.toString()}>{nota}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* C4 */}
                    <div className="space-y-2 p-3 rounded-lg border-2 border-purple-200 bg-purple-50/50">
                      <Label className="font-semibold text-purple-700">C4 - Coesão</Label>
                      <Select value={form.c4} onValueChange={(v) => setForm({ ...form, c4: v })}>
                        <SelectTrigger className="border-2 border-purple-300">
                          <SelectValue placeholder="Selecione a nota" />
                        </SelectTrigger>
                        <SelectContent>
                          {NOTAS_COMPETENCIA.map(nota => (
                            <SelectItem key={nota} value={nota.toString()}>{nota}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* C5 */}
                    <div className="space-y-2 p-3 rounded-lg border-2 border-red-200 bg-red-50/50 md:col-span-2">
                      <Label className="font-semibold text-red-700">C5 - Proposta de Intervenção</Label>
                      <Select value={form.c5} onValueChange={(v) => setForm({ ...form, c5: v })}>
                        <SelectTrigger className="border-2 border-red-300">
                          <SelectValue placeholder="Selecione a nota" />
                        </SelectTrigger>
                        <SelectContent>
                          {NOTAS_COMPETENCIA.map(nota => (
                            <SelectItem key={nota} value={nota.toString()}>{nota}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Nota Total Calculada */}
                  <div className="p-4 rounded-lg bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-300">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-orange-800">Nota Total (calculada automaticamente)</span>
                      <span className="text-3xl font-black text-orange-600">{notaTotalForm}</span>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSaving}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  {isSaving ? "Salvando..." : editandoId ? "Atualizar" : "Registrar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Dashboard - Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Média Geral */}
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Média Geral (últimas 5)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {estatisticas.mediaGeral}
            </div>
            <p className="text-xs text-muted-foreground mt-1">pontos</p>
          </CardContent>
        </Card>

        {/* Melhor Nota */}
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4" />
              Melhor Nota
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              {estatisticas.melhorNota}
            </div>
            <p className="text-xs text-muted-foreground mt-1">recorde pessoal</p>
          </CardContent>
        </Card>

        {/* Total de Redações */}
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Redações Produzidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {estatisticas.totalRedacoes}
            </div>
            <p className="text-xs text-muted-foreground mt-1">no período</p>
          </CardContent>
        </Card>

        {/* Tempo Médio */}
        <Card className={`border-2 hover:shadow-lg transition-shadow ${
          estatisticas.tempoExcessivo ? "border-red-300 bg-red-50" : 
          estatisticas.tempoAlerta ? "border-yellow-300 bg-yellow-50" : ""
        }`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium flex items-center gap-2 ${
              estatisticas.tempoExcessivo ? "text-red-600" : 
              estatisticas.tempoAlerta ? "text-yellow-600" : "text-muted-foreground"
            }`}>
              <Clock className="h-4 w-4" />
              Tempo Médio
              {(estatisticas.tempoExcessivo || estatisticas.tempoAlerta) && (
                <AlertTriangle className="h-4 w-4" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-black ${
              estatisticas.tempoExcessivo ? "text-red-600" : 
              estatisticas.tempoAlerta ? "text-yellow-600" : 
              "bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
            }`}>
              {estatisticas.tempoMedio.horas}h {estatisticas.tempoMedio.minutos}min
            </div>
            <p className={`text-xs mt-1 ${
              estatisticas.tempoExcessivo ? "text-red-500" : 
              estatisticas.tempoAlerta ? "text-yellow-500" : "text-muted-foreground"
            }`}>
              {estatisticas.tempoExcessivo ? "Tempo excessivo!" : 
               estatisticas.tempoAlerta ? "Atenção ao tempo" : "por redação"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Meta de Nota */}
      <Card className="border-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-500" />
            Minha Meta
          </CardTitle>
          <CardDescription>
            Defina sua meta de nota para acompanhar no gráfico de evolução
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              min={0}
              max={1000}
              step={20}
              value={metaNota}
              onChange={(e) => setMetaNota(parseInt(e.target.value) || 0)}
              className="w-32 border-2"
            />
            <Button 
              variant="outline" 
              onClick={() => saveMeta(metaNota)}
              className="border-2"
            >
              Salvar Meta
            </Button>
            <span className="text-sm text-muted-foreground">
              Meta atual: <strong>{metaNota}</strong> pontos
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Evolução */}
      {redacoesFiltradas.length > 0 && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Evolução das Notas
            </CardTitle>
            <CardDescription>
              Acompanhe sua trajetória ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={dadosEvolucao}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="data" stroke="#6b7280" fontSize={12} />
                <YAxis domain={[0, 1000]} stroke="#6b7280" fontSize={12} />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '2px solid #f97316', 
                    borderRadius: '12px', 
                    fontWeight: 'bold' 
                  }}
                  formatter={(value: number, name: string) => [value, "Nota"]}
                  labelFormatter={(label) => `Data: ${label}`}
                />
                <ReferenceLine 
                  y={metaNota} 
                  stroke="#ef4444" 
                  strokeDasharray="5 5" 
                  label={{ value: `Meta: ${metaNota}`, position: 'right', fill: '#ef4444', fontSize: 12 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="nota" 
                  stroke="#f97316" 
                  strokeWidth={3}
                  dot={{ fill: '#f97316', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, fill: '#ea580c' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Diagnóstico por Competência */}
      {redacoesFiltradas.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Radar */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Equilíbrio entre Competências</CardTitle>
              <CardDescription>
                Visualize o equilíbrio das suas notas nas 5 competências
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={dadosRadar}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="competencia" stroke="#6b7280" fontSize={12} />
                  <PolarRadiusAxis angle={30} domain={[0, 200]} stroke="#6b7280" fontSize={10} />
                  <Radar
                    name="Média"
                    dataKey="valor"
                    stroke="#f97316"
                    fill="#f97316"
                    fillOpacity={0.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Barras */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Média por Competência</CardTitle>
              <CardDescription>
                Compare suas médias históricas em cada competência
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosBarras}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="nome" stroke="#6b7280" fontSize={12} />
                  <YAxis domain={[0, 200]} stroke="#6b7280" fontSize={12} />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '2px solid #6b7280', 
                      borderRadius: '12px' 
                    }}
                    formatter={(value: number, name: string, props: any) => [
                      value, 
                      props.payload.descricao
                    ]}
                  />
                  <Bar dataKey="media" radius={[8, 8, 0, 0]}>
                    {dadosBarras.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.cor}
                        opacity={estatisticas.pontoFraco === `c${index + 1}` ? 1 : 0.7}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              
              {/* Tabela de Médias */}
              <div className="mt-4 space-y-2">
                {dadosBarras.map((item, index) => {
                  const isPontoFraco = estatisticas.pontoFraco === `c${index + 1}`;
                  return (
                    <div 
                      key={item.nome}
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        isPontoFraco ? "bg-red-50 border border-red-200" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.cor }}
                        />
                        <span className={`text-sm ${isPontoFraco ? "font-bold text-red-600" : ""}`}>
                          {item.nome} - {item.descricao}
                        </span>
                        {isPontoFraco && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">
                            Ponto Fraco
                          </span>
                        )}
                      </div>
                      <span className={`font-bold ${isPontoFraco ? "text-red-600" : ""}`}>
                        {item.media}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Histórico Detalhado */}
      <Card className="border-2">
        <CardHeader 
          className="cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setShowHistorico(!showHistorico)}
        >
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-500" />
                Histórico Detalhado
              </CardTitle>
              <CardDescription>
                {redacoesFiltradas.length} redação(ões) registrada(s)
              </CardDescription>
            </div>
            {showHistorico ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </CardHeader>
        {showHistorico && (
          <CardContent>
            {redacoesFiltradas.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma redação registrada ainda.</p>
                <p className="text-sm">Clique em "Registrar Nova Redação" para começar!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {redacoesFiltradas.map((redacao) => (
                  <div 
                    key={redacao.id}
                    className="p-4 rounded-lg border-2 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">{redacao.titulo}</h4>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                          <span>
                            📅 {new Date(redacao.data).toLocaleDateString('pt-BR')}
                          </span>
                          <span>
                            ⏱️ {redacao.tempoHoras}h {redacao.tempoMinutos}min
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                            C1: {redacao.c1}
                          </span>
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">
                            C2: {redacao.c2}
                          </span>
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-amber-100 text-amber-700">
                            C3: {redacao.c3}
                          </span>
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-purple-100 text-purple-700">
                            C4: {redacao.c4}
                          </span>
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">
                            C5: {redacao.c5}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-3xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                            {redacao.notaTotal}
                          </div>
                          <div className="text-xs text-muted-foreground">pontos</div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(redacao)}
                            className="border-2"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(redacao.id)}
                            className="border-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Mensagem quando não há redações */}
      {redacoes.length === 0 && !isLoading && (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-orange-300" />
              <h3 className="text-xl font-bold mb-2">Comece a registrar suas redações!</h3>
              <p className="text-muted-foreground mb-4">
                Acompanhe sua evolução nas redações do ENEM registrando suas notas por competência.
              </p>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Registrar Primeira Redação
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

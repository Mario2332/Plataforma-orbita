import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAlunoApi } from "@/hooks/useAlunoApi";
import { FileText, Plus, Trash2, TrendingUp, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AlunoAutodiagnostico from "./AlunoAutodiagnostico";

type AreaFiltro = "total" | "linguagens" | "humanas" | "natureza" | "matematica";
type MetricaFiltro = "acertos" | "tempo";

const DIFICULDADES = [
  { value: "", label: "Não informado" },
  { value: "muito_facil", label: "Muito Fácil" },
  { value: "facil", label: "Fácil" },
  { value: "media", label: "Média" },
  { value: "dificil", label: "Difícil" },
  { value: "muito_dificil", label: "Muito Difícil" },
];

export default function AlunoSimulados() {
  const api = useAlunoApi();
  const [activeTab, setActiveTab] = useState("simulados");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [simulados, setSimulados] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  
  // Filtros do gráfico
  const [areaFiltro, setAreaFiltro] = useState<AreaFiltro>("total");
  const [metricaFiltro, setMetricaFiltro] = useState<MetricaFiltro>("acertos");

  const [formData, setFormData] = useState({
    nome: "",
    data: new Date().toISOString().split("T")[0],
    linguagensAcertos: 0,
    linguagensTempo: 0,
    humanasAcertos: 0,
    humanasTempo: 0,
    naturezaAcertos: 0,
    naturezaTempo: 0,
    matematicaAcertos: 0,
    matematicaTempo: 0,
    redacaoNota: 0,
    redacaoTempo: 0,
    dificuldadeDia1: "", // Linguagens + Humanas
    dificuldadeDia2: "", // Natureza + Matemática
  });

  const resetForm = () => {
    setFormData({
      nome: "",
      data: new Date().toISOString().split("T")[0],
      linguagensAcertos: 0,
      linguagensTempo: 0,
      humanasAcertos: 0,
      humanasTempo: 0,
      naturezaAcertos: 0,
      naturezaTempo: 0,
      matematicaAcertos: 0,
      matematicaTempo: 0,
      redacaoNota: 0,
      redacaoTempo: 0,
      dificuldadeDia1: "",
      dificuldadeDia2: "",
    });
    setEditandoId(null);
  };

  const loadSimulados = async () => {
    try {
      setIsLoading(true);
      const data = await api.getSimulados();
      setSimulados(data as any[]);
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar simulados");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSimulados();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar apenas nome obrigatório
    if (!formData.nome.trim()) {
      toast.error("Nome do simulado é obrigatório");
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Criar data no timezone local
      const [ano, mes, dia] = formData.data.split('-').map(Number);
      const dataLocal = new Date(ano, mes - 1, dia, 12, 0, 0);
      
      if (editandoId) {
        // Editar simulado existente
        await api.updateSimulado({
          simuladoId: editandoId,
          ...formData,
          data: dataLocal,
        });
        toast.success("Simulado atualizado!");
      } else {
        // Criar novo simulado
        await api.createSimulado({
          ...formData,
          data: dataLocal,
        });
        toast.success("Simulado registrado!");
      }
      
      setDialogOpen(false);
      resetForm();
      await loadSimulados();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar simulado");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (simulado: any) => {
    // Converter data
    let data: Date;
    try {
      if (simulado.data?.seconds || simulado.data?._seconds) {
        const seconds = simulado.data.seconds || simulado.data._seconds;
        data = new Date(seconds * 1000);
      } else if (simulado.data?.toDate) {
        data = simulado.data.toDate();
      } else {
        data = new Date(simulado.data);
      }
    } catch {
      data = new Date();
    }
    
    setFormData({
      nome: simulado.nome || "",
      data: data.toISOString().split("T")[0],
      linguagensAcertos: simulado.linguagensAcertos || 0,
      linguagensTempo: simulado.linguagensTempo || 0,
      humanasAcertos: simulado.humanasAcertos || 0,
      humanasTempo: simulado.humanasTempo || 0,
      naturezaAcertos: simulado.naturezaAcertos || 0,
      naturezaTempo: simulado.naturezaTempo || 0,
      matematicaAcertos: simulado.matematicaAcertos || 0,
      matematicaTempo: simulado.matematicaTempo || 0,
      redacaoNota: simulado.redacaoNota || 0,
      redacaoTempo: simulado.redacaoTempo || 0,
      dificuldadeDia1: simulado.dificuldadeDia1 || "",
      dificuldadeDia2: simulado.dificuldadeDia2 || "",
    });
    setEditandoId(simulado.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este simulado?")) {
      try {
        await api.deleteSimulado(id);
        toast.success("Simulado excluído!");
        await loadSimulados();
      } catch (error: any) {
        toast.error(error.message || "Erro ao excluir simulado");
      }
    }
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  // Preparar dados para o gráfico de evolução
  const prepararDadosGrafico = () => {
    if (!simulados || simulados.length === 0) return [];
    
    return simulados
      .map(s => {
        // Converter data
        let data: Date;
        try {
          if (s.data?.seconds || s.data?._seconds) {
            const seconds = s.data.seconds || s.data._seconds;
            data = new Date(seconds * 1000);
          } else if (s.data?.toDate) {
            data = s.data.toDate();
          } else {
            data = new Date(s.data);
          }
        } catch {
          return null;
        }
        
        const dataFormatada = data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        
        // Calcular valores baseado no filtro
        let valor: number;
        let label: string;
        
        if (metricaFiltro === "acertos") {
          switch (areaFiltro) {
            case "linguagens":
              valor = s.linguagensAcertos || 0;
              label = "Linguagens";
              break;
            case "humanas":
              valor = s.humanasAcertos || 0;
              label = "Humanas";
              break;
            case "natureza":
              valor = s.naturezaAcertos || 0;
              label = "Natureza";
              break;
            case "matematica":
              valor = s.matematicaAcertos || 0;
              label = "Matemática";
              break;
            default: // total
              valor = (s.linguagensAcertos || 0) + (s.humanasAcertos || 0) + 
                      (s.naturezaAcertos || 0) + (s.matematicaAcertos || 0);
              label = "Total";
          }
        } else { // tempo
          switch (areaFiltro) {
            case "linguagens":
              valor = s.linguagensTempo || 0;
              label = "Linguagens";
              break;
            case "humanas":
              valor = s.humanasTempo || 0;
              label = "Humanas";
              break;
            case "natureza":
              valor = s.naturezaTempo || 0;
              label = "Natureza";
              break;
            case "matematica":
              valor = s.matematicaTempo || 0;
              label = "Matemática";
              break;
            default: // total
              valor = (s.linguagensTempo || 0) + (s.humanasTempo || 0) + 
                      (s.naturezaTempo || 0) + (s.matematicaTempo || 0);
              label = "Total";
          }
        }
        
        return {
          data: dataFormatada,
          [label]: valor,
          nome: s.nome,
        };
      })
      .filter(Boolean)
      .reverse(); // Mais antigo para mais recente
  };
  
  const dadosGrafico = prepararDadosGrafico();
  const labelGrafico = areaFiltro === "total" ? "Total" : 
                       areaFiltro === "linguagens" ? "Linguagens" :
                       areaFiltro === "humanas" ? "Humanas" :
                       areaFiltro === "natureza" ? "Natureza" : "Matemática";

  const getDificuldadeLabel = (value: string) => {
    const dif = DIFICULDADES.find(d => d.value === value);
    return dif ? dif.label : "Não informado";
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Simulados</h1>
        <p className="text-muted-foreground mt-2">Registre e acompanhe seus simulados do ENEM</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="simulados">Simulados</TabsTrigger>
          <TabsTrigger value="autodiagnostico">Autodiagnóstico</TabsTrigger>
        </TabsList>

        <TabsContent value="simulados" className="space-y-6 mt-6">
          {/* Botão Registrar Simulado */}
          <div className="flex items-center justify-end">
            <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Registrar Simulado</Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editandoId ? "Editar Simulado" : "Registrar Simulado"}</DialogTitle>
                  <DialogDescription>
                    {editandoId ? "Atualize os dados do simulado" : "Preencha os resultados do seu simulado (apenas o nome é obrigatório)"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    {/* Nome e Data */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nome do Simulado *</Label>
                        <Input 
                          value={formData.nome} 
                          onChange={(e) => setFormData({...formData, nome: e.target.value})} 
                          placeholder="Ex: ENEM 2023"
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Data</Label>
                        <Input 
                          type="date" 
                          value={formData.data} 
                          onChange={(e) => setFormData({...formData, data: e.target.value})} 
                        />
                      </div>
                    </div>

                    {/* Dificuldades */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Dificuldade 1º Dia (Linguagens + Humanas)</Label>
                        <Select 
                          value={formData.dificuldadeDia1} 
                          onValueChange={(value) => setFormData({...formData, dificuldadeDia1: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {DIFICULDADES.map(dif => (
                              <SelectItem key={dif.value} value={dif.value}>{dif.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Dificuldade 2º Dia (Natureza + Matemática)</Label>
                        <Select 
                          value={formData.dificuldadeDia2} 
                          onValueChange={(value) => setFormData({...formData, dificuldadeDia2: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {DIFICULDADES.map(dif => (
                              <SelectItem key={dif.value} value={dif.value}>{dif.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Linguagens */}
                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-3">Linguagens, Códigos e suas Tecnologias</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Acertos (máx. 45)</Label>
                          <Input 
                            type="number" 
                            min="0" 
                            max="45"
                            value={formData.linguagensAcertos} 
                            onChange={(e) => setFormData({...formData, linguagensAcertos: parseInt(e.target.value) || 0})} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tempo (minutos)</Label>
                          <Input 
                            type="number" 
                            min="0"
                            value={formData.linguagensTempo} 
                            onChange={(e) => setFormData({...formData, linguagensTempo: parseInt(e.target.value) || 0})} 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Humanas */}
                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-3">Ciências Humanas e suas Tecnologias</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Acertos (máx. 45)</Label>
                          <Input 
                            type="number" 
                            min="0" 
                            max="45"
                            value={formData.humanasAcertos} 
                            onChange={(e) => setFormData({...formData, humanasAcertos: parseInt(e.target.value) || 0})} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tempo (minutos)</Label>
                          <Input 
                            type="number" 
                            min="0"
                            value={formData.humanasTempo} 
                            onChange={(e) => setFormData({...formData, humanasTempo: parseInt(e.target.value) || 0})} 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Natureza */}
                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-3">Ciências da Natureza e suas Tecnologias</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Acertos (máx. 45)</Label>
                          <Input 
                            type="number" 
                            min="0" 
                            max="45"
                            value={formData.naturezaAcertos} 
                            onChange={(e) => setFormData({...formData, naturezaAcertos: parseInt(e.target.value) || 0})} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tempo (minutos)</Label>
                          <Input 
                            type="number" 
                            min="0"
                            value={formData.naturezaTempo} 
                            onChange={(e) => setFormData({...formData, naturezaTempo: parseInt(e.target.value) || 0})} 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Matemática */}
                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-3">Matemática e suas Tecnologias</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Acertos (máx. 45)</Label>
                          <Input 
                            type="number" 
                            min="0" 
                            max="45"
                            value={formData.matematicaAcertos} 
                            onChange={(e) => setFormData({...formData, matematicaAcertos: parseInt(e.target.value) || 0})} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tempo (minutos)</Label>
                          <Input 
                            type="number" 
                            min="0"
                            value={formData.matematicaTempo} 
                            onChange={(e) => setFormData({...formData, matematicaTempo: parseInt(e.target.value) || 0})} 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Redação */}
                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-3">Redação</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nota (máx. 1000)</Label>
                          <Input 
                            type="number" 
                            min="0" 
                            max="1000"
                            value={formData.redacaoNota} 
                            onChange={(e) => setFormData({...formData, redacaoNota: parseInt(e.target.value) || 0})} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tempo (minutos)</Label>
                          <Input 
                            type="number" 
                            min="0"
                            value={formData.redacaoTempo} 
                            onChange={(e) => setFormData({...formData, redacaoTempo: parseInt(e.target.value) || 0})} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? "Salvando..." : editandoId ? "Atualizar" : "Registrar"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Gráfico de Evolução */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Evolução de Desempenho
                  </CardTitle>
                  <CardDescription>Acompanhe seu progresso ao longo do tempo</CardDescription>
                </div>
                <div className="flex gap-2">
                  {/* Filtro de Área */}
                  <Select value={areaFiltro} onValueChange={(value: AreaFiltro) => setAreaFiltro(value)}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="total">Total</SelectItem>
                      <SelectItem value="linguagens">Linguagens</SelectItem>
                      <SelectItem value="humanas">Humanas</SelectItem>
                      <SelectItem value="natureza">Natureza</SelectItem>
                      <SelectItem value="matematica">Matemática</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Filtro de Métrica */}
                  <Select value={metricaFiltro} onValueChange={(value: MetricaFiltro) => setMetricaFiltro(value)}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="acertos">Acertos</SelectItem>
                      <SelectItem value="tempo">Tempo (min)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {dadosGrafico.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                  <FileText className="h-12 w-12 mb-4 opacity-50" />
                  <p>Nenhum simulado registrado ainda</p>
                  <p className="text-sm">Registre seu primeiro simulado para ver o gráfico</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dadosGrafico}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey={labelGrafico} 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Tabela de Histórico */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Simulados</CardTitle>
              <CardDescription>Todos os seus simulados registrados</CardDescription>
            </CardHeader>
            <CardContent>
              {simulados.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                  <FileText className="h-12 w-12 mb-4 opacity-50" />
                  <p>Nenhum simulado registrado</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Ling.</TableHead>
                        <TableHead>Hum.</TableHead>
                        <TableHead>Nat.</TableHead>
                        <TableHead>Mat.</TableHead>
                        <TableHead>1º Dia</TableHead>
                        <TableHead>Tempo 1º</TableHead>
                        <TableHead>Dif. 1º</TableHead>
                        <TableHead>2º Dia</TableHead>
                        <TableHead>Tempo 2º</TableHead>
                        <TableHead>Dif. 2º</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Redação</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {simulados.map((simulado) => {
                        // Converter data
                        let data: Date;
                        try {
                          if (simulado.data?.seconds || simulado.data?._seconds) {
                            const seconds = simulado.data.seconds || simulado.data._seconds;
                            data = new Date(seconds * 1000);
                          } else if (simulado.data?.toDate) {
                            data = simulado.data.toDate();
                          } else {
                            data = new Date(simulado.data);
                          }
                        } catch {
                          data = new Date();
                        }

                        // Cálculos
                        const linguagens = simulado.linguagensAcertos || 0;
                        const humanas = simulado.humanasAcertos || 0;
                        const natureza = simulado.naturezaAcertos || 0;
                        const matematica = simulado.matematicaAcertos || 0;
                        
                        const dia1Acertos = linguagens + humanas;
                        const dia2Acertos = natureza + matematica;
                        const total = dia1Acertos + dia2Acertos;
                        
                        const tempoDia1 = (simulado.linguagensTempo || 0) + (simulado.humanasTempo || 0) + (simulado.redacaoTempo || 0);
                        const tempoDia2 = (simulado.naturezaTempo || 0) + (simulado.matematicaTempo || 0);

                        return (
                          <TableRow key={simulado.id}>
                            <TableCell className="font-medium">{simulado.nome}</TableCell>
                            <TableCell>{data.toLocaleDateString('pt-BR')}</TableCell>
                            <TableCell>{linguagens}/45</TableCell>
                            <TableCell>{humanas}/45</TableCell>
                            <TableCell>{natureza}/45</TableCell>
                            <TableCell>{matematica}/45</TableCell>
                            <TableCell className="font-semibold">{dia1Acertos}/90</TableCell>
                            <TableCell>{tempoDia1 > 0 ? `${tempoDia1} min` : "-"}</TableCell>
                            <TableCell className="text-sm">{getDificuldadeLabel(simulado.dificuldadeDia1)}</TableCell>
                            <TableCell className="font-semibold">{dia2Acertos}/90</TableCell>
                            <TableCell>{tempoDia2 > 0 ? `${tempoDia2} min` : "-"}</TableCell>
                            <TableCell className="text-sm">{getDificuldadeLabel(simulado.dificuldadeDia2)}</TableCell>
                            <TableCell className="font-bold">{total}/180</TableCell>
                            <TableCell>{simulado.redacaoNota > 0 ? simulado.redacaoNota : "-"}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(simulado)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(simulado.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="autodiagnostico">
          <AlunoAutodiagnostico />
        </TabsContent>
      </Tabs>
    </div>
  );
}

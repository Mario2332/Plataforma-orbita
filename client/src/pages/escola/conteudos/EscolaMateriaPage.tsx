import { useState, useMemo, useEffect } from "react";
import { escolaConteudosApi } from "@/lib/api-escola-conteudos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ArrowUpDown, ArrowUp, ArrowDown, Filter, Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Topic {
  id: string;
  name: string;
  incidenceValue: number;
  incidenceLevel: string;
}

interface EscolaMateriaPageProps {
  materiaKey: string;
}

const INCIDENCE_OPTIONS = [
  { value: "Muito alta!", label: "Muito alta!", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  { value: "Alta!", label: "Alta!", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  { value: "Média", label: "Média", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  { value: "Baixa", label: "Baixa", color: "bg-emerald-500" },
  { value: "Muito baixa", label: "Muito baixa", color: "bg-gray-400" },
];

export default function EscolaMateriaPage({ materiaKey }: EscolaMateriaPageProps) {
  const [materia, setMateria] = useState<any>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados de ordenação e filtro
  const [sortColumn, setSortColumn] = useState<"name" | "incidence">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterIncidence, setFilterIncidence] = useState<string>("todos");

  // Estados de diálogos
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  // Estados de formulários
  const [formName, setFormName] = useState("");
  const [formIncidence, setFormIncidence] = useState("");

  const loadConteudos = async () => {
    try {
      setIsLoading(true);
      const data = await escolaConteudosApi.getConteudos(materiaKey);
      setMateria(data);
      setTopics(data.topics || []);
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar conteúdos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConteudos();
  }, [materiaKey]);

  const handleSort = (column: "name" | "incidence") => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-4 h-4 opacity-50" />;
    }
    return sortDirection === "asc" 
      ? <ArrowUp className="w-4 h-4" />
      : <ArrowDown className="w-4 h-4" />;
  };

  const filteredAndSortedTopics = useMemo(() => {
    let filtered = [...topics];

    if (filterIncidence !== "todos") {
      filtered = filtered.filter(topic => topic.incidenceLevel === filterIncidence);
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortColumn === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortColumn === "incidence") {
        comparison = a.incidenceValue - b.incidenceValue;
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });
    
    return filtered;
  }, [topics, sortColumn, sortDirection, filterIncidence]);

  const getIncidenceBadgeColor = (level: string) => {
    switch (level) {
      case "Muito alta!": return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 text-white hover:bg-red-600";
      case "Alta!": return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 text-white hover:bg-orange-600";
      case "Média": return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 text-black hover:bg-yellow-600";
      case "Baixa": return "bg-emerald-500 text-white hover:bg-emerald-600";
      case "Muito baixa": return "bg-gray-400 text-white hover:bg-gray-500";
      default: return "bg-gray-300 text-black hover:bg-gray-400";
    }
  };

  const handleCreateTopic = async () => {
    if (!formName.trim() || !formIncidence) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      await escolaConteudosApi.createTopico({
        materiaKey,
        name: formName.trim(),
        incidenceLevel: formIncidence,
      });
      toast.success("Tópico criado com sucesso!");
      setCreateDialogOpen(false);
      setFormName("");
      setFormIncidence("");
      await loadConteudos();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar tópico");
    }
  };

  const handleEditTopic = async () => {
    if (!selectedTopic || !formName.trim() || !formIncidence) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      await escolaConteudosApi.updateTopico({
        materiaKey,
        topicoId: selectedTopic.id,
        name: formName.trim(),
        incidenceLevel: formIncidence,
      });
      toast.success("Tópico atualizado com sucesso!");
      setEditDialogOpen(false);
      setSelectedTopic(null);
      setFormName("");
      setFormIncidence("");
      await loadConteudos();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar tópico");
    }
  };

  const handleDeleteTopic = async () => {
    if (!selectedTopic) return;

    try {
      await escolaConteudosApi.deleteTopico({
        materiaKey,
        topicoId: selectedTopic.id,
      });
      toast.success("Tópico excluído com sucesso!");
      setDeleteDialogOpen(false);
      setSelectedTopic(null);
      await loadConteudos();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir tópico");
    }
  };

  const openEditDialog = (topic: Topic) => {
    setSelectedTopic(topic);
    setFormName(topic.name);
    setFormIncidence(topic.incidenceLevel);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (topic: Topic) => {
    setSelectedTopic(topic);
    setDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl">{materia?.displayName}</CardTitle>
              <p className="text-muted-foreground mt-2">
                {topics.length} tópicos • {filteredAndSortedTopics.length} exibidos • Gerencie os conteúdos desta matéria
              </p>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Novo Tópico
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Tópico</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nome do Tópico</label>
                    <Input
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Ex: Análise combinatória"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Incidência</label>
                    <Select value={formIncidence} onValueChange={setFormIncidence}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a incidência" />
                      </SelectTrigger>
                      <SelectContent>
                        {INCIDENCE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateTopic}>Criar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seção de Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>
            
            <div className="flex-1 flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Select value={filterIncidence} onValueChange={setFilterIncidence}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Incidência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas as incidências</SelectItem>
                    {INCIDENCE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {filterIncidence !== "todos" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilterIncidence("todos")}
                  className="whitespace-nowrap"
                >
                  Limpar filtros
                </Button>
              )}
            </div>
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-3 font-semibold">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("name")}
                      className="flex items-center gap-1 hover:bg-muted"
                    >
                      Conteúdo
                      {getSortIcon("name")}
                    </Button>
                  </th>
                  <th className="text-center p-3 font-semibold">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("incidence")}
                      className="flex items-center gap-1 mx-auto hover:bg-muted"
                    >
                      Incidência
                      {getSortIcon("incidence")}
                    </Button>
                  </th>
                  <th className="text-center p-3 font-semibold w-48">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedTopics.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-muted-foreground">
                      Nenhum tópico encontrado com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedTopics.map((topic) => (
                    <tr key={topic.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-3">{topic.name}</td>
                      <td className="p-3 text-center">
                        <Badge className={getIncidenceBadgeColor(topic.incidenceLevel)}>
                          {topic.incidenceLevel}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(topic)}
                            className="gap-1"
                          >
                            <Pencil className="w-3 h-3" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(topic)}
                            className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                            Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tópico</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome do Tópico</label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ex: Análise combinatória"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Incidência</label>
              <Select value={formIncidence} onValueChange={setFormIncidence}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a incidência" />
                </SelectTrigger>
                <SelectContent>
                  {INCIDENCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditTopic}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o tópico <strong>{selectedTopic?.name}</strong>?
              <br /><br />
              Esta ação não afetará o progresso dos alunos que já estudaram este tópico,
              mas ele não aparecerá mais na lista de conteúdos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTopic} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

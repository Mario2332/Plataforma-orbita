import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { alunoApi } from "@/lib/api";
import { BookOpen, Clock, Edit, Play, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function AlunoEstudos() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cronometroAtivo, setCronometroAtivo] = useState(false);
  const [tempoDecorrido, setTempoDecorrido] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [estudos, setEstudos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    data: new Date().toISOString().split("T")[0],
    materia: "",
    conteudo: "",
    tempoMinutos: 0,
    questoesFeitas: 0,
    questoesAcertadas: 0,
    flashcardsRevisados: 0,
  });

  const loadEstudos = async () => {
    try {
      setIsLoading(true);
      const data = await alunoApi.getEstudos();
      setEstudos(data as any[]);
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar estudos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEstudos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await alunoApi.createEstudo({
        ...formData,
        data: new Date(formData.data),
      });
      toast.success("Estudo registrado com sucesso!");
      setDialogOpen(false);
      await loadEstudos();
    } catch (error: any) {
      toast.error(error.message || "Erro ao registrar estudo");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este registro?")) {
      try {
        await alunoApi.deleteEstudo(id);
        toast.success("Estudo excluído com sucesso!");
        await loadEstudos();
      } catch (error: any) {
        toast.error(error.message || "Erro ao excluir estudo");
      }
    }
  };

  // Cronômetro
  const iniciarCronometro = () => {
    setCronometroAtivo(true);
    const id = setInterval(() => {
      setTempoDecorrido((prev) => prev + 1);
    }, 1000);
    setIntervalId(id);
  };

  const pausarCronometro = () => {
    setCronometroAtivo(false);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  const resetarCronometro = () => {
    pausarCronometro();
    setTempoDecorrido(0);
  };

  const salvarCronometro = () => {
    setFormData({
      ...formData,
      tempoMinutos: Math.floor(tempoDecorrido / 60),
    });
    setDialogOpen(true);
    resetarCronometro();
  };

  const formatarTempo = (segundos: number) => {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;
    return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}:${String(segs).padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className=\"flex items-center justify-center min-h-[400px]\">
        <div className=\"animate-spin rounded-full h-12 w-12 border-b-2 border-primary\"></div>
      </div>
    );
  }

  return (
    <div className=\"space-y-6\">
      <div className=\"flex items-center justify-between\">
        <div>
          <h1 className=\"text-3xl font-bold tracking-tight\">Estudos</h1>
          <p className=\"text-muted-foreground mt-2\">Registre e acompanhe suas sessões de estudo</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className=\"h-4 w-4 mr-2\" />
              Registrar Estudo
            </Button>
          </DialogTrigger>
          <DialogContent className=\"max-w-2xl max-h-[90vh] overflow-y-auto\">
            <DialogHeader>
              <DialogTitle>Registrar Sessão de Estudo</DialogTitle>
              <DialogDescription>Preencha os detalhes da sua sessão de estudo</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className=\"grid gap-4 py-4\">
                <div className=\"grid grid-cols-2 gap-4\">
                  <div className=\"space-y-2\">
                    <Label htmlFor=\"data\">Data</Label>
                    <Input
                      id=\"data\"
                      type=\"date\"
                      value={formData.data}
                      onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                      required
                    />
                  </div>
                  <div className=\"space-y-2\">
                    <Label htmlFor=\"tempoMinutos\">Tempo (minutos)</Label>
                    <Input
                      id=\"tempoMinutos\"
                      type=\"number\"
                      value={formData.tempoMinutos}
                      onChange={(e) => setFormData({ ...formData, tempoMinutos: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>
                <div className=\"space-y-2\">
                  <Label htmlFor=\"materia\">Matéria</Label>
                  <Input
                    id=\"materia\"
                    placeholder=\"Ex: Matemática, Português, Física...\"
                    value={formData.materia}
                    onChange={(e) => setFormData({ ...formData, materia: e.target.value })}
                    required
                  />
                </div>
                <div className=\"space-y-2\">
                  <Label htmlFor=\"conteudo\">Conteúdo Específico</Label>
                  <Input
                    id=\"conteudo\"
                    placeholder=\"Ex: Geometria Plana, Sintaxe, Cinemática...\"
                    value={formData.conteudo}
                    onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                    required
                  />
                </div>
                <div className=\"grid grid-cols-3 gap-4\">
                  <div className=\"space-y-2\">
                    <Label htmlFor=\"questoesFeitas\">Questões Feitas</Label>
                    <Input
                      id=\"questoesFeitas\"
                      type=\"number\"
                      value={formData.questoesFeitas}
                      onChange={(e) => setFormData({ ...formData, questoesFeitas: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className=\"space-y-2\">
                    <Label htmlFor=\"questoesAcertadas\">Acertos</Label>
                    <Input
                      id=\"questoesAcertadas\"
                      type=\"number\"
                      value={formData.questoesAcertadas}
                      onChange={(e) => setFormData({ ...formData, questoesAcertadas: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className=\"space-y-2\">
                    <Label htmlFor=\"flashcardsRevisados\">Flashcards</Label>
                    <Input
                      id=\"flashcardsRevisados\"
                      type=\"number\"
                      value={formData.flashcardsRevisados}
                      onChange={(e) => setFormData({ ...formData, flashcardsRevisados: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type=\"submit\" disabled={isSaving}>
                  {isSaving ? \"Salvando...\" : \"Salvar\"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cronômetro */}
      <Card>
        <CardHeader>
          <CardTitle className=\"flex items-center gap-2\">
            <Clock className=\"h-5 w-5\" />
            Cronômetro de Estudos
          </CardTitle>
          <CardDescription>Use o cronômetro para medir o tempo de estudo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className=\"flex flex-col items-center gap-4\">
            <div className=\"text-6xl font-bold font-mono\">{formatarTempo(tempoDecorrido)}</div>
            <div className=\"flex gap-2\">
              {!cronometroAtivo ? (
                <Button onClick={iniciarCronometro} size=\"lg\">
                  <Play className=\"h-5 w-5 mr-2\" />
                  Iniciar
                </Button>
              ) : (
                <Button onClick={pausarCronometro} variant=\"secondary\" size=\"lg\">
                  Pausar
                </Button>
              )}
              <Button onClick={resetarCronometro} variant=\"outline\" size=\"lg\">
                Resetar
              </Button>
              {tempoDecorrido > 0 && (
                <Button onClick={salvarCronometro} variant=\"default\" size=\"lg\">
                  <BookOpen className=\"h-5 w-5 mr-2\" />
                  Salvar Sessão
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Estudos */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Estudos</CardTitle>
          <CardDescription>Todos os seus registros de estudo</CardDescription>
        </CardHeader>
        <CardContent>
          {estudos && estudos.length > 0 ? (
            <div className=\"rounded-md border\">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Matéria</TableHead>
                    <TableHead>Conteúdo</TableHead>
                    <TableHead>Tempo</TableHead>
                    <TableHead>Questões</TableHead>
                    <TableHead>Acertos</TableHead>
                    <TableHead>Flashcards</TableHead>
                    <TableHead className=\"text-right\">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {estudos.map((estudo) => (
                    <TableRow key={estudo.id}>
                      <TableCell>{new Date(estudo.data).toLocaleDateString(\"pt-BR\")}</TableCell>
                      <TableCell className=\"font-medium\">{estudo.materia}</TableCell>
                      <TableCell>{estudo.conteudo}</TableCell>
                      <TableCell>{estudo.tempoMinutos}min</TableCell>
                      <TableCell>{estudo.questoesFeitas}</TableCell>
                      <TableCell>{estudo.questoesAcertadas}</TableCell>
                      <TableCell>{estudo.flashcardsRevisados}</TableCell>
                      <TableCell className=\"text-right\">
                        <div className=\"flex justify-end gap-2\">
                          <Button variant=\"ghost\" size=\"icon\" disabled>
                            <Edit className=\"h-4 w-4\" />
                          </Button>
                          <Button
                            variant=\"ghost\"
                            size=\"icon\"
                            onClick={() => handleDelete(estudo.id)}
                            disabled={isSaving}
                          >
                            <Trash2 className=\"h-4 w-4\" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className=\"text-center py-12 text-muted-foreground\">
              <BookOpen className=\"h-12 w-12 mx-auto mb-4 opacity-50\" />
              <p>Nenhum estudo registrado ainda.</p>
              <p className=\"text-sm mt-2\">Comece registrando sua primeira sessão de estudos!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

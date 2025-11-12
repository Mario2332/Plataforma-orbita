import { useState, useEffect } from "react";
import { gestorApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Users, Edit, Trash2, Search } from "lucide-react";

export default function GestorAlunos() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAluno, setEditingAluno] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMentorId, setSelectedMentorId] = useState<string>("all");
  const [alunos, setAlunos] = useState<any[]>([]);
  const [mentores, setMentores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    mentorId: "",
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [alunosData, mentoresData] = await Promise.all([
        gestorApi.getAllAlunos(),
        gestorApi.getMentores(),
      ]);
      setAlunos(alunosData as any[]);
      setMentores(mentoresData as any[]);
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setFormData({
      nome: "",
      email: "",
      mentorId: "",
    });
  };

  const handleOpenDialog = (aluno: any) => {
    setEditingAluno(aluno);
    setFormData({
      nome: aluno.nome,
      email: aluno.email,
      mentorId: aluno.mentorId,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome || !formData.email || !formData.mentorId) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      setIsSaving(true);
      await gestorApi.updateAluno({
        alunoId: editingAluno.id,
        ...formData,
      });
      toast.success("Aluno atualizado com sucesso!");
      setDialogOpen(false);
      setEditingAluno(null);
      resetForm();
      await loadData();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar aluno");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (window.confirm(`Tem certeza que deseja remover o aluno "${nome}"?`)) {
      try {
        await gestorApi.deleteAluno(id);
        toast.success("Aluno removido com sucesso!");
        await loadData();
      } catch (error: any) {
        toast.error(error.message || "Erro ao remover aluno");
      }
    }
  };

  const getMentorNome = (mentorId: string) => {
    const mentor = mentores?.find((m) => m.id === mentorId);
    return mentor?.nome || "Sem mentor";
  };

  const filteredAlunos = alunos?.filter((aluno: any) => {
    const matchesSearch = aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aluno.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMentor = selectedMentorId === "all" || aluno.mentorId === selectedMentorId;
    return matchesSearch && matchesMentor;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Alunos</h1>
          <p className="text-muted-foreground mt-1">
            Visualize e gerencie todos os alunos da plataforma
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={selectedMentorId} onValueChange={setSelectedMentorId}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Filtrar por mentor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os mentores</SelectItem>
                {mentores?.map((mentor: any) => (
                  <SelectItem key={mentor.id} value={mentor.id}>
                    {mentor.nome} - {mentor.nomePlataforma}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!filteredAlunos || filteredAlunos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>
                {searchTerm
                  ? "Nenhum aluno encontrado com esse termo"
                  : "Nenhum aluno cadastrado ainda"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Mentor</TableHead>
                    <TableHead>Data de Cadastro</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlunos.map((aluno: any) => (
                    <TableRow key={aluno.id}>
                      <TableCell className="font-medium">{aluno.nome}</TableCell>
                      <TableCell>{aluno.email}</TableCell>
                      <TableCell>{getMentorNome(aluno.mentorId)}</TableCell>
                      <TableCell>
                        {(() => {
                          let date: Date;
                          if (aluno.createdAt?.toDate) {
                            date = aluno.createdAt.toDate();
                          } else if (aluno.createdAt?.seconds || aluno.createdAt?._seconds) {
                            const seconds = aluno.createdAt.seconds || aluno.createdAt._seconds;
                            date = new Date(seconds * 1000);
                          } else {
                            date = new Date(aluno.createdAt);
                          }
                          return date.toLocaleDateString("pt-BR");
                        })()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(aluno)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(aluno.id, aluno.nome)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Editar Aluno</DialogTitle>
              <DialogDescription>
                Atualize as informações do aluno ou altere o mentor vinculado
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome do aluno"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                  required
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  O email não pode ser alterado
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mentorId">Mentor *</Label>
                <Select
                  value={formData.mentorId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, mentorId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um mentor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mentores?.map((mentor) => (
                      <SelectItem key={mentor.id} value={mentor.id}>
                        {mentor.nome} - {mentor.nomePlataforma}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Altere o mentor vinculado a este aluno
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  setEditingAluno(null);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Salvando..." : "Atualizar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

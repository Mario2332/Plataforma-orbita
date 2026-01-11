import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { mentorApi } from "@/lib/api";
import { Plus, Users, ArrowUpDown, Edit, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

export default function MentorAlunos() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [alunos, setAlunos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedAluno, setSelectedAluno] = useState<any>(null);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    celular: "",
    plano: "",
  });
  const [editFormData, setEditFormData] = useState({
    nome: "",
    email: "",
    celular: "",
    plano: "",
    ativo: true,
  });

  const loadAlunos = async () => {
    try {
      setIsLoading(true);
      const data = await mentorApi.getAlunos();
      setAlunos(data as any[]);
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar alunos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlunos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      await mentorApi.createAluno(formData);
      toast.success("Aluno adicionado!");
      setDialogOpen(false);
      setFormData({
        nome: "",
        email: "",
        celular: "",
        plano: "",
      });
      await loadAlunos();
    } catch (error: any) {
      toast.error(error.message || "Erro ao adicionar aluno");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleOpenEditDialog = (aluno: any) => {
    setSelectedAluno(aluno);
    setEditFormData({
      nome: aluno.nome || "",
      email: aluno.email || "",
      celular: aluno.celular || "",
      plano: aluno.plano || "",
      ativo: aluno.ativo !== false,
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAluno) return;
    
    try {
      setIsSaving(true);
      await mentorApi.updateAluno({
        alunoId: selectedAluno.id,
        ...editFormData,
      });
      toast.success("Aluno atualizado!");
      setEditDialogOpen(false);
      setSelectedAluno(null);
      await loadAlunos();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar aluno");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDeleteDialog = (aluno: any) => {
    setSelectedAluno(aluno);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedAluno) return;
    
    try {
      setIsDeleting(true);
      await mentorApi.deleteAluno(selectedAluno.id);
      toast.success("Aluno excluído!");
      setDeleteDialogOpen(false);
      setSelectedAluno(null);
      await loadAlunos();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir aluno");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtrar e ordenar alunos
  const filteredAndSortedAlunos = () => {
    let result = [...alunos];
    
    // Filtrar por nome
    if (searchTerm) {
      result = result.filter(aluno => 
        aluno.nome?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Ordenar
    if (sortColumn) {
      result.sort((a, b) => {
        let aVal = a[sortColumn];
        let bVal = b[sortColumn];
        
        // Tratar valores nulos
        if (!aVal) aVal = "";
        if (!bVal) bVal = "";
        
        // Comparar strings
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDirection === 'asc' 
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        
        // Comparar outros tipos
        if (sortDirection === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }
    
    return result;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alunos</h1>
          <p className="text-muted-foreground mt-2">Gerencie seus alunos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Adicionar Aluno</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Aluno</DialogTitle>
              <DialogDescription>Preencha os dados do aluno</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Celular</Label>
                  <Input value={formData.celular} onChange={(e) => setFormData({...formData, celular: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Plano</Label>
                  <Input value={formData.plano} onChange={(e) => setFormData({...formData, plano: e.target.value})} />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Campo de Pesquisa */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar aluno por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Alunos</CardTitle>
          <CardDescription>Todos os alunos cadastrados</CardDescription>
        </CardHeader>
        <CardContent>
          {alunos && alunos.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button variant="ghost" size="sm" onClick={() => handleSort('nome')} className="h-8 px-2">
                        Nome
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" onClick={() => handleSort('email')} className="h-8 px-2">
                        Email
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Celular</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedAlunos().map((aluno) => (
                    <TableRow key={aluno.id}>
                      <TableCell className="font-medium">{aluno.nome}</TableCell>
                      <TableCell>{aluno.email}</TableCell>
                      <TableCell>{aluno.celular || "-"}</TableCell>
                      <TableCell>{aluno.plano || "-"}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${aluno.ativo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                          {aluno.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEditDialog(aluno)}
                            title="Editar aluno"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDeleteDialog(aluno)}
                            title="Excluir aluno"
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
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum aluno cadastrado ainda.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de Edição */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Aluno</DialogTitle>
            <DialogDescription>Atualize os dados do aluno</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input 
                  value={editFormData.nome} 
                  onChange={(e) => setEditFormData({...editFormData, nome: e.target.value})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  type="email" 
                  value={editFormData.email} 
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Celular</Label>
                <Input 
                  value={editFormData.celular} 
                  onChange={(e) => setEditFormData({...editFormData, celular: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Plano</Label>
                <Input 
                  value={editFormData.plano} 
                  onChange={(e) => setEditFormData({...editFormData, plano: e.target.value})} 
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={editFormData.ativo}
                  onChange={(e) => setEditFormData({...editFormData, ativo: e.target.checked})}
                  className="h-4 w-4"
                />
                <Label htmlFor="ativo" className="cursor-pointer">Aluno ativo</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O aluno <strong>{selectedAluno?.nome}</strong> será excluído permanentemente, incluindo todos os seus dados de estudos e simulados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

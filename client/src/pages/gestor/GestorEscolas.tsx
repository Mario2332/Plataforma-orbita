import { useState, useEffect } from "react";
import { gestorApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Users, Plus, Mail, Building, Palette, Image, Trash2, Edit } from "lucide-react";

export default function GestorEscolaes() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEscola, setEditingEscola] = useState<any>(null);
  const [escolas, setEscolaes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    nomePlataforma: "",
    logoUrl: "",
    corPrincipal: "#3b82f6",
  });

  const loadEscolaes = async () => {
    try {
      setIsLoading(true);
      const data = await gestorApi.getEscolaes();
      setEscolaes(data as any[]);
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar escolas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEscolaes();
  }, []);

  const resetForm = () => {
    setFormData({
      nome: "",
      email: "",
      senha: "",
      nomePlataforma: "",
      logoUrl: "",
      corPrincipal: "#3b82f6",
    });
  };

  const handleOpenDialog = (escola?: any) => {
    if (escola) {
      setEditingEscola(escola);
      setFormData({
        nome: escola.nome,
        email: escola.email,
        senha: "",
        nomePlataforma: escola.nomePlataforma,
        logoUrl: escola.logoUrl || "",
        corPrincipal: escola.corPrincipal || "#3b82f6",
      });
    } else {
      setEditingEscola(null);
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome || !formData.email || !formData.nomePlataforma) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (!editingEscola && !formData.senha) {
      toast.error("A senha é obrigatória para novos escolas");
      return;
    }

    if (!editingEscola && formData.senha.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    try {
      setIsSaving(true);
      
      if (editingEscola) {
        await gestorApi.updateEscola({
          escolaId: editingEscola.id,
          ...formData,
        });
        toast.success("Escola atualizado com sucesso!");
      } else {
        await gestorApi.createEscola({
          ...formData,
          password: formData.senha,
        });
        toast.success("Escola adicionado com sucesso!");
      }
      
      setDialogOpen(false);
      setEditingEscola(null);
      resetForm();
      await loadEscolaes();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar escola");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (window.confirm(`Tem certeza que deseja remover o escola "${nome}"?`)) {
      try {
        await gestorApi.deleteEscola(id);
        toast.success("Escola removido com sucesso!");
        await loadEscolaes();
      } catch (error: any) {
        toast.error(error.message || "Erro ao remover escola");
      }
    }
  };

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
          <h1 className="text-3xl font-bold">Gestão de Escolaes</h1>
          <p className="text-muted-foreground mt-1">
            Adicione e gerencie escolas/clientes da plataforma
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Escola
        </Button>
      </div>

      {!escolas || escolas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum escola cadastrado ainda</p>
            <Button onClick={() => handleOpenDialog()} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Escola
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {escolas.map((escola) => (
            <Card key={escola.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{escola.nome}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Mail className="h-3 w-3" />
                      {escola.email}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(escola)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(escola.id, escola.nome)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{escola.nomePlataforma}</span>
                </div>
                {escola.logoUrl && (
                  <div className="flex items-center gap-2 text-sm">
                    <Image className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground truncate">
                      {escola.logoUrl}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: escola.corPrincipal }}
                    />
                    <span className="text-xs font-mono">{escola.corPrincipal}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingEscola ? "Editar Escola" : "Adicionar Novo Escola"}
              </DialogTitle>
              <DialogDescription>
                {editingEscola
                  ? "Atualize as informações do escola"
                  : "Preencha os dados do novo escola/cliente"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Escola *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="João Silva"
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
                  placeholder="joao@exemplo.com"
                  required
                  disabled={!!editingEscola}
                />
                {editingEscola && (
                  <p className="text-xs text-muted-foreground">
                    O email não pode ser alterado
                  </p>
                )}
              </div>

              {!editingEscola && (
                <div className="space-y-2">
                  <Label htmlFor="senha">Senha Inicial *</Label>
                  <Input
                    id="senha"
                    type="password"
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    O escola poderá alterar esta senha nas configurações
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="nomePlataforma">Nome da Plataforma *</Label>
                <Input
                  id="nomePlataforma"
                  value={formData.nomePlataforma}
                  onChange={(e) =>
                    setFormData({ ...formData, nomePlataforma: e.target.value })
                  }
                  placeholder="Escolaia ENEM Pro"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Nome que aparecerá para os alunos deste escola
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoUrl">URL do Logo</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  placeholder="https://exemplo.com/logo.png"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="corPrincipal">Cor Principal</Label>
                <div className="flex gap-2">
                  <Input
                    id="corPrincipal"
                    type="color"
                    value={formData.corPrincipal}
                    onChange={(e) =>
                      setFormData({ ...formData, corPrincipal: e.target.value })
                    }
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={formData.corPrincipal}
                    onChange={(e) =>
                      setFormData({ ...formData, corPrincipal: e.target.value })
                    }
                    placeholder="#3b82f6"
                    className="flex-1 font-mono"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  setEditingEscola(null);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
              >
                {isSaving
                  ? "Salvando..."
                  : editingEscola
                  ? "Atualizar"
                  : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

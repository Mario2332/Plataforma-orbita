import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Plus, 
  Search, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Globe,
  Palette,
  Settings,
  Upload,
  RefreshCw,
  Check,
  X,
  Copy,
  ExternalLink,
  Image,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { adminDb, adminStorage } from "@/lib/firebase-admin";
import { TenantConfig } from "@/types/tenant";

interface ClienteForm {
  id: string;
  slug: string;
  dominios: string[];
  dominioPrincipal: string;
  plano: "white-label" | "premium" | "free";
  status: "ativo" | "inativo" | "pendente";
  branding: {
    logo: string;
    favicon?: string;
    corPrimaria: string;
    corPrimariaHover: string;
    corSecundaria: string;
    nomeExibicao: string;
  };
  features: {
    estudos: boolean;
    cronograma: boolean;
    cronogramaDinamico: boolean;
    metricas: boolean;
    metas: boolean;
    simulados: boolean;
    redacoes: boolean;
    diarioBordo: boolean;
    escolaia: boolean;
    relatoriosAvancados: boolean;
    exportacaoPdf: boolean;
    planoAcao: boolean;
    autodiagnostico: boolean;
  };
  ads: {
    exibirAnuncios: boolean;
    googleAdsClientId: string;
  };
}

const defaultForm: ClienteForm = {
  id: "",
  slug: "",
  dominios: [],
  dominioPrincipal: "",
  plano: "white-label",
  status: "pendente",
  branding: {
    logo: "",
    corPrimaria: "#10b981",
    corPrimariaHover: "#059669",
    corSecundaria: "#14b8a6",
    nomeExibicao: "",
  },
  features: {
    estudos: true,
    cronograma: true,
    cronogramaDinamico: true,
    metricas: true,
    metas: true,
    simulados: true,
    redacoes: true,
    diarioBordo: true,
    escolaia: true,
    relatoriosAvancados: true,
    exportacaoPdf: true,
    planoAcao: true,
    autodiagnostico: true,
  },
  ads: {
    exibirAnuncios: false,
    googleAdsClientId: "",
  },
};

const featureLabels: Record<string, string> = {
  estudos: "Estudos",
  cronograma: "Cronograma",
  cronogramaDinamico: "Cronograma Dinâmico",
  metricas: "Métricas",
  metas: "Metas",
  simulados: "Simulados",
  redacoes: "Redações",
  diarioBordo: "Diário de Bordo",
  escolaia: "Escolaia",
  relatoriosAvancados: "Relatórios Avançados",
  exportacaoPdf: "Exportação PDF",
  planoAcao: "Plano de Ação",
  autodiagnostico: "Autodiagnóstico",
};

export default function GestorClientes() {
  const [clientes, setClientes] = useState<TenantConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clienteParaDeletar, setClienteParaDeletar] = useState<TenantConfig | null>(null);
  const [editando, setEditando] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [form, setForm] = useState<ClienteForm>(defaultForm);
  const [novoDominio, setNovoDominio] = useState("");
  
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Carregar clientes
  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    setIsLoading(true);
    try {
      const tenantsRef = collection(adminDb, "tenants");
      const snapshot = await getDocs(tenantsRef);
      const lista: TenantConfig[] = [];
      
      snapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() } as TenantConfig);
      });
      
      setClientes(lista);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      toast.error("Erro ao carregar clientes");
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar clientes
  const clientesFiltrados = clientes.filter((cliente) => {
    const termo = searchTerm.toLowerCase();
    return (
      cliente.branding.nomeExibicao.toLowerCase().includes(termo) ||
      cliente.slug.toLowerCase().includes(termo) ||
      cliente.dominios.some((d) => d.toLowerCase().includes(termo))
    );
  });

  // Gerar slug a partir do nome
  const gerarSlug = (nome: string) => {
    return nome
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // Upload de logo
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB");
      return;
    }

    setUploadingLogo(true);
    try {
      const slug = form.slug || `temp-${Date.now()}`;
      const storageRef = ref(adminStorage, `tenants/${slug}/logo-${Date.now()}.${file.name.split('.').pop()}`);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      setForm(prev => ({ 
        ...prev, 
        branding: { ...prev.branding, logo: downloadURL } 
      }));
      toast.success("Logo enviado com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar logo:", error);
      toast.error("Erro ao enviar logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  // Adicionar domínio
  const handleAddDominio = () => {
    if (!novoDominio.trim()) return;
    
    const dominioLimpo = novoDominio.trim().toLowerCase();
    
    if (form.dominios.includes(dominioLimpo)) {
      toast.error("Este domínio já foi adicionado");
      return;
    }

    setForm(prev => ({
      ...prev,
      dominios: [...prev.dominios, dominioLimpo],
      dominioPrincipal: prev.dominioPrincipal || dominioLimpo,
    }));
    setNovoDominio("");
  };

  // Remover domínio
  const handleRemoveDominio = (dominio: string) => {
    setForm(prev => ({
      ...prev,
      dominios: prev.dominios.filter(d => d !== dominio),
      dominioPrincipal: prev.dominioPrincipal === dominio 
        ? prev.dominios.filter(d => d !== dominio)[0] || ""
        : prev.dominioPrincipal,
    }));
  };

  // Abrir dialog para novo cliente
  const handleNovoCliente = () => {
    setForm(defaultForm);
    setEditando(false);
    setDialogOpen(true);
  };

  // Abrir dialog para editar cliente
  const handleEditarCliente = (cliente: TenantConfig) => {
    setForm({
      id: cliente.id,
      slug: cliente.slug,
      dominios: cliente.dominios,
      dominioPrincipal: cliente.dominioPrincipal,
      plano: cliente.plano as "white-label" | "premium" | "free",
      status: cliente.status as "ativo" | "inativo" | "pendente",
      branding: cliente.branding,
      features: cliente.features,
      ads: {
        exibirAnuncios: cliente.ads.exibirAnuncios,
        googleAdsClientId: cliente.ads.googleAdsClientId || "",
      },
    });
    setEditando(true);
    setDialogOpen(true);
  };

  // Salvar cliente
  const handleSalvar = async () => {
    // Validações
    if (!form.branding.nomeExibicao.trim()) {
      toast.error("Nome do cliente é obrigatório");
      return;
    }

    if (form.dominios.length === 0) {
      toast.error("Adicione pelo menos um domínio");
      return;
    }

    setIsSaving(true);
    try {
      const slug = form.slug || gerarSlug(form.branding.nomeExibicao);
      const docId = editando ? form.id : slug;
      
      const tenantData = {
        slug,
        dominios: form.dominios,
        dominioPrincipal: form.dominioPrincipal || form.dominios[0],
        plano: form.plano,
        status: form.status,
        branding: form.branding,
        features: form.features,
        ads: {
          exibirAnuncios: form.ads.exibirAnuncios,
          googleAdsClientId: form.ads.googleAdsClientId,
          slots: {
            header: "",
            sidebar: "",
            inContent: "",
            footer: "",
          },
        },
      };

      // Usar Cloud Functions em vez de escrever diretamente
      const { httpsCallable } = await import("firebase/functions");
      const { adminFunctions } = await import("@/lib/firebase-admin");
      
      if (editando) {
        const updateTenant = httpsCallable(adminFunctions, "updateTenant");
        await updateTenant({ tenantId: docId, data: tenantData });
        toast.success("Cliente atualizado com sucesso!");
      } else {
        const createTenant = httpsCallable(adminFunctions, "createTenant");
        await createTenant(tenantData);
        toast.success("Cliente criado com sucesso!");
      }

      setDialogOpen(false);
      carregarClientes();
    } catch (error: any) {
      console.error("Erro ao salvar cliente:", error);
      const errorMessage = error?.message || "Erro ao salvar cliente";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Confirmar exclusão
  const handleConfirmarExclusao = async () => {
    if (!clienteParaDeletar) return;

    try {
      // Usar Cloud Function em vez de deletar diretamente
      const { httpsCallable } = await import("firebase/functions");
      const { adminFunctions } = await import("@/lib/firebase-admin");
      const deleteTenant = httpsCallable(adminFunctions, "deleteTenant");
      await deleteTenant({ tenantId: clienteParaDeletar.id });
      
      toast.success("Cliente excluído com sucesso!");
      setDeleteDialogOpen(false);
      setClienteParaDeletar(null);
      carregarClientes();
    } catch (error: any) {
      console.error("Erro ao excluir cliente:", error);
      const errorMessage = error?.message || "Erro ao excluir cliente";
      toast.error(errorMessage);
    }
  };

  // Alternar status
  const handleToggleStatus = async (cliente: TenantConfig) => {
    try {
      // Usar Cloud Function em vez de atualizar diretamente
      const { httpsCallable } = await import("firebase/functions");
      const { adminFunctions } = await import("@/lib/firebase-admin");
      const toggleTenantStatus = httpsCallable(adminFunctions, "toggleTenantStatus");
      const result: any = await toggleTenantStatus({ tenantId: cliente.id });
      
      const novoStatus = result.data.newStatus;
      toast.success(`Cliente ${novoStatus === "ativo" ? "ativado" : "desativado"}!`);
      carregarClientes();
    } catch (error: any) {
      console.error("Erro ao alterar status:", error);
      const errorMessage = error?.message || "Erro ao alterar status";
      toast.error(errorMessage);
    }
  };

  // Copiar para clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência!");
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500 p-3 rounded-xl">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Clientes White-label
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gerencie os clientes e suas configurações personalizadas
              </p>
            </div>
          </div>
          <Button onClick={handleNovoCliente} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </div>
      </div>

      {/* Busca e Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, slug ou domínio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={carregarClientes}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Clientes Cadastrados</CardTitle>
          <CardDescription>
            {clientesFiltrados.length} cliente(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          ) : clientesFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Nenhum cliente encontrado</p>
              <Button onClick={handleNovoCliente} variant="outline" className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar primeiro cliente
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Domínio</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientesFiltrados.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden"
                          style={{ backgroundColor: cliente.branding.corPrimaria + "20" }}
                        >
                          {cliente.branding.logo ? (
                            <img 
                              src={cliente.branding.logo} 
                              alt={cliente.branding.nomeExibicao}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Building2 
                              className="h-5 w-5" 
                              style={{ color: cliente.branding.corPrimaria }}
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{cliente.branding.nomeExibicao}</p>
                          <p className="text-sm text-gray-500">{cliente.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <span className="font-mono text-sm">{cliente.dominioPrincipal}</span>
                        {cliente.dominios.length > 1 && (
                          <Badge variant="secondary">+{cliente.dominios.length - 1}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={cliente.plano === "white-label" ? "default" : "secondary"}
                        className={cliente.plano === "white-label" ? "bg-emerald-500" : ""}
                      >
                        {cliente.plano}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={cliente.status === "ativo" ? "default" : "secondary"}
                        className={
                          cliente.status === "ativo" 
                            ? "bg-green-500" 
                            : cliente.status === "pendente"
                            ? "bg-yellow-500"
                            : "bg-gray-500"
                        }
                      >
                        {cliente.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditarCliente(cliente)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(cliente)}>
                            {cliente.status === "ativo" ? (
                              <>
                                <X className="h-4 w-4 mr-2" />
                                Desativar
                              </>
                            ) : (
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                Ativar
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => window.open(`https://${cliente.dominioPrincipal}`, "_blank")}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Visitar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => copyToClipboard(cliente.dominioPrincipal)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copiar domínio
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              setClienteParaDeletar(cliente);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Criação/Edição */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editando ? "Editar Cliente" : "Novo Cliente White-label"}
            </DialogTitle>
            <DialogDescription>
              {editando 
                ? "Atualize as configurações do cliente"
                : "Configure um novo cliente com sua identidade visual personalizada"
              }
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="geral" className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="geral">Geral</TabsTrigger>
              <TabsTrigger value="branding">Branding</TabsTrigger>
              <TabsTrigger value="dominios">Domínios</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
            </TabsList>

            {/* Tab: Geral */}
            <TabsContent value="geral" className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nomeExibicao">Nome do Cliente *</Label>
                  <Input
                    id="nomeExibicao"
                    value={form.branding.nomeExibicao}
                    onChange={(e) => {
                      const nome = e.target.value;
                      setForm(prev => ({
                        ...prev,
                        slug: prev.slug || gerarSlug(nome),
                        branding: { ...prev.branding, nomeExibicao: nome }
                      }));
                    }}
                    placeholder="Nome da escola ou empresa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (identificador único)</Label>
                  <Input
                    id="slug"
                    value={form.slug}
                    onChange={(e) => setForm(prev => ({ ...prev, slug: gerarSlug(e.target.value) }))}
                    placeholder="nome-do-cliente"
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="plano">Plano</Label>
                  <select
                    id="plano"
                    value={form.plano}
                    onChange={(e) => setForm(prev => ({ ...prev, plano: e.target.value as any }))}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="white-label">White-label</option>
                    <option value="premium">Premium</option>
                    <option value="free">Gratuito</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={form.status}
                    onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Exibir Anúncios</Label>
                  <p className="text-sm text-gray-500">
                    Ative para mostrar anúncios do Google AdSense
                  </p>
                </div>
                <Switch
                  checked={form.ads.exibirAnuncios}
                  onCheckedChange={(checked) => setForm(prev => ({ 
                    ...prev, 
                    ads: { ...prev.ads, exibirAnuncios: checked } 
                  }))}
                />
              </div>
            </TabsContent>

            {/* Tab: Branding */}
            <TabsContent value="branding" className="space-y-4 mt-4">
              {/* Logo */}
              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex items-center gap-4">
                  <div 
                    className="w-24 h-24 rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed"
                    style={{ 
                      borderColor: form.branding.corPrimaria,
                      backgroundColor: form.branding.corPrimaria + "10"
                    }}
                  >
                    {form.branding.logo ? (
                      <img 
                        src={form.branding.logo} 
                        alt="Logo" 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Image className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploadingLogo}
                    >
                      {uploadingLogo ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Enviar Logo
                    </Button>
                    <p className="text-xs text-gray-500">PNG, JPG ou SVG. Máx 2MB.</p>
                  </div>
                </div>
              </div>

              {/* Cores */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Cor Primária</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.branding.corPrimaria}
                      onChange={(e) => setForm(prev => ({ 
                        ...prev, 
                        branding: { ...prev.branding, corPrimaria: e.target.value } 
                      }))}
                      className="w-12 h-10 rounded cursor-pointer border-0"
                    />
                    <Input
                      value={form.branding.corPrimaria}
                      onChange={(e) => setForm(prev => ({ 
                        ...prev, 
                        branding: { ...prev.branding, corPrimaria: e.target.value } 
                      }))}
                      className="font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cor Primária (Hover)</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.branding.corPrimariaHover}
                      onChange={(e) => setForm(prev => ({ 
                        ...prev, 
                        branding: { ...prev.branding, corPrimariaHover: e.target.value } 
                      }))}
                      className="w-12 h-10 rounded cursor-pointer border-0"
                    />
                    <Input
                      value={form.branding.corPrimariaHover}
                      onChange={(e) => setForm(prev => ({ 
                        ...prev, 
                        branding: { ...prev.branding, corPrimariaHover: e.target.value } 
                      }))}
                      className="font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cor Secundária</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.branding.corSecundaria}
                      onChange={(e) => setForm(prev => ({ 
                        ...prev, 
                        branding: { ...prev.branding, corSecundaria: e.target.value } 
                      }))}
                      className="w-12 h-10 rounded cursor-pointer border-0"
                    />
                    <Input
                      value={form.branding.corSecundaria}
                      onChange={(e) => setForm(prev => ({ 
                        ...prev, 
                        branding: { ...prev.branding, corSecundaria: e.target.value } 
                      }))}
                      className="font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Preview</p>
                <div className="flex items-center gap-4">
                  <button
                    className="px-4 py-2 rounded-lg text-white font-medium transition-colors"
                    style={{ backgroundColor: form.branding.corPrimaria }}
                  >
                    Botão Primário
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg text-white font-medium"
                    style={{ backgroundColor: form.branding.corSecundaria }}
                  >
                    Botão Secundário
                  </button>
                  <span 
                    className="font-semibold"
                    style={{ color: form.branding.corPrimaria }}
                  >
                    {form.branding.nomeExibicao || "Nome do Cliente"}
                  </span>
                </div>
              </div>
            </TabsContent>

            {/* Tab: Domínios */}
            <TabsContent value="dominios" className="space-y-4 mt-4">
              <div className="flex gap-2">
                <Input
                  value={novoDominio}
                  onChange={(e) => setNovoDominio(e.target.value)}
                  placeholder="exemplo.com.br"
                  onKeyDown={(e) => e.key === "Enter" && handleAddDominio()}
                />
                <Button onClick={handleAddDominio}>
                  Adicionar
                </Button>
              </div>

              <div className="space-y-2">
                {form.dominios.map((dominio) => (
                  <div
                    key={dominio}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <span className="font-mono text-sm">{dominio}</span>
                      {dominio === form.dominioPrincipal && (
                        <Badge variant="secondary">Principal</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {dominio !== form.dominioPrincipal && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setForm(prev => ({ ...prev, dominioPrincipal: dominio }))}
                        >
                          Tornar principal
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDominio(dominio)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {form.dominios.length > 0 && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-700 dark:text-amber-300">
                      <p className="font-medium mb-1">Configuração de DNS necessária</p>
                      <p>
                        Para cada domínio, o cliente precisa configurar o DNS apontando para o Firebase Hosting.
                        Adicione o domínio no Firebase Console → Hosting → Adicionar domínio personalizado.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Tab: Features */}
            <TabsContent value="features" className="space-y-4 mt-4">
              <div className="grid gap-3 md:grid-cols-2">
                {Object.entries(featureLabels).map(([key, label]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <Label htmlFor={key} className="cursor-pointer">{label}</Label>
                    <Switch
                      id={key}
                      checked={form.features[key as keyof typeof form.features]}
                      onCheckedChange={(checked) => setForm(prev => ({
                        ...prev,
                        features: { ...prev.features, [key]: checked }
                      }))}
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setForm(prev => ({
                    ...prev,
                    features: Object.fromEntries(
                      Object.keys(prev.features).map(k => [k, true])
                    ) as typeof prev.features
                  }))}
                >
                  Ativar todas
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setForm(prev => ({
                    ...prev,
                    features: Object.fromEntries(
                      Object.keys(prev.features).map(k => [k, false])
                    ) as typeof prev.features
                  }))}
                >
                  Desativar todas
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSalvar} 
              disabled={isSaving}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSaving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              {editando ? "Salvar Alterações" : "Criar Cliente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o cliente{" "}
              <strong>{clienteParaDeletar?.branding.nomeExibicao}</strong>?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmarExclusao}>
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

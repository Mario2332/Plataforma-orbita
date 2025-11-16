import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import studyData from "@shared/study-content-data.json";
import { collection, getDocs, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Topic {
  id: string;
  name: string;
  incidenceValue: number;
  incidenceLevel: string;
  isCustom?: boolean;
}

interface MentorMateriaPageProps {
  materiaKey: string;
}

const INCIDENCE_OPTIONS = [
  { value: "Muito baixa", numericValue: 0.01 },
  { value: "Baixa", numericValue: 0.02 },
  { value: "Média", numericValue: 0.04 },
  { value: "Alta!", numericValue: 0.06 },
  { value: "Muito alta!", numericValue: 0.08 },
];

export default function MentorMateriaPage({ materiaKey }: MentorMateriaPageProps) {
  const materia = (studyData as any)[materiaKey];
  
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addDialog, setAddDialog] = useState(false);
  const [editDialog, setEditDialog] = useState<{ open: boolean; topic: Topic | null }>({ open: false, topic: null });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; topic: Topic | null }>({ open: false, topic: null });
  
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicIncidence, setNewTopicIncidence] = useState("Média");

  const loadTopics = async () => {
    try {
      setIsLoading(true);
      
      // Carregar tópicos base do JSON
      let topicsBase: Topic[] = materia?.topics || [];
      
      // Carregar customizações do Firestore
      const customTopicsSnapshot = await getDocs(collection(db, "conteudos"));
      const customTopics: Record<string, any> = {};
      
      customTopicsSnapshot.forEach((doc) => {
        customTopics[doc.id] = doc.data();
      });
      
      // Mesclar dados
      let finalTopics = [...topicsBase];
      
      Object.entries(customTopics).forEach(([topicId, topicData]: [string, any]) => {
        if (topicData.materiaKey === materiaKey) {
          if (topicData.deleted) {
            // Remover tópico deletado
            finalTopics = finalTopics.filter(t => t.id !== topicId);
          } else {
            // Atualizar ou adicionar tópico
            const existingIndex = finalTopics.findIndex(t => t.id === topicId);
            if (existingIndex >= 0) {
              finalTopics[existingIndex] = {
                ...finalTopics[existingIndex],
                name: topicData.name,
                incidenceLevel: topicData.incidenceLevel,
                incidenceValue: topicData.incidenceValue,
                isCustom: topicData.isCustom
              };
            } else {
              finalTopics.push({
                id: topicId,
                name: topicData.name,
                incidenceValue: topicData.incidenceValue,
                incidenceLevel: topicData.incidenceLevel,
                isCustom: topicData.isCustom
              });
            }
          }
        }
      });
      
      setTopics(finalTopics);
    } catch (error: any) {
      console.error("Erro ao carregar tópicos:", error);
      toast.error("Erro ao carregar tópicos: " + error.message);
      // Em caso de erro, usar apenas dados do JSON
      setTopics(materia?.topics || []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTopics();
  }, [materiaKey]);

  const handleAddTopic = async () => {
    if (!newTopicName.trim()) {
      toast.error("Nome do tópico é obrigatório");
      return;
    }

    try {
      const incidenceOption = INCIDENCE_OPTIONS.find(opt => opt.value === newTopicIncidence);
      const topicId = `${materiaKey}-custom-${Date.now()}`;
      
      await setDoc(doc(db, "conteudos", topicId), {
        id: topicId,
        name: newTopicName.trim(),
        incidenceLevel: newTopicIncidence,
        incidenceValue: incidenceOption?.numericValue || 0.04,
        materiaKey,
        isCustom: true,
        deleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      toast.success("Tópico adicionado com sucesso!");
      setAddDialog(false);
      setNewTopicName("");
      setNewTopicIncidence("Média");
      await loadTopics();
    } catch (error: any) {
      console.error("Erro ao adicionar tópico:", error);
      toast.error("Erro ao adicionar tópico: " + error.message);
    }
  };

  const handleEditTopic = async () => {
    if (!editDialog.topic || !newTopicName.trim()) {
      toast.error("Nome do tópico é obrigatório");
      return;
    }

    try {
      const incidenceOption = INCIDENCE_OPTIONS.find(opt => opt.value === newTopicIncidence);
      
      await setDoc(doc(db, "conteudos", editDialog.topic.id), {
        id: editDialog.topic.id,
        name: newTopicName.trim(),
        incidenceLevel: newTopicIncidence,
        incidenceValue: incidenceOption?.numericValue || 0.04,
        materiaKey,
        isCustom: editDialog.topic.isCustom || false,
        deleted: false,
        updatedAt: serverTimestamp()
      }, { merge: true });

      toast.success("Tópico atualizado com sucesso!");
      setEditDialog({ open: false, topic: null });
      setNewTopicName("");
      setNewTopicIncidence("Média");
      await loadTopics();
    } catch (error: any) {
      console.error("Erro ao editar tópico:", error);
      toast.error("Erro ao editar tópico: " + error.message);
    }
  };

  const handleDeleteTopic = async () => {
    if (!deleteDialog.topic) return;

    try {
      await setDoc(doc(db, "conteudos", deleteDialog.topic.id), {
        deleted: true,
        updatedAt: serverTimestamp()
      }, { merge: true });

      toast.success("Tópico excluído com sucesso!");
      setDeleteDialog({ open: false, topic: null });
      await loadTopics();
    } catch (error: any) {
      console.error("Erro ao excluir tópico:", error);
      toast.error("Erro ao excluir tópico: " + error.message);
    }
  };

  const openEditDialog = (topic: Topic) => {
    setNewTopicName(topic.name);
    setNewTopicIncidence(topic.incidenceLevel);
    setEditDialog({ open: true, topic });
  };

  const getIncidenceBadgeColor = (level: string) => {
    switch (level) {
      case "Muito alta!": return "bg-red-500 text-white hover:bg-red-600";
      case "Alta!": return "bg-orange-500 text-white hover:bg-orange-600";
      case "Média": return "bg-yellow-500 text-black hover:bg-yellow-600";
      case "Baixa": return "bg-blue-500 text-white hover:bg-blue-600";
      case "Muito baixa": return "bg-gray-400 text-white hover:bg-gray-500";
      default: return "bg-gray-300 text-black hover:bg-gray-400";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{materia?.displayName || "Matéria"}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">{topics.length} tópicos cadastrados</p>
          </div>
          <Dialog open={addDialog} onOpenChange={setAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Tópico
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Tópico</DialogTitle>
                <DialogDescription>
                  Adicione um novo tópico à matéria {materia?.displayName}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Tópico</Label>
                  <Input
                    id="name"
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    placeholder="Ex: Trigonometria"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="incidence">Incidência no ENEM</Label>
                  <Select value={newTopicIncidence} onValueChange={setNewTopicIncidence}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INCIDENCE_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddDialog(false)}>Cancelar</Button>
                <Button onClick={handleAddTopic}>Adicionar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tópico</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Incidência</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {topics.map((topic) => (
                  <tr key={topic.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      {topic.name}
                      {topic.isCustom && (
                        <Badge variant="outline" className="ml-2 text-xs">Customizado</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={getIncidenceBadgeColor(topic.incidenceLevel)}>
                        {topic.incidenceLevel}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditDialog(topic)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteDialog({ open: true, topic })}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Editar */}
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ open, topic: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tópico</DialogTitle>
            <DialogDescription>
              Edite as informações do tópico
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome do Tópico</Label>
              <Input
                id="edit-name"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-incidence">Incidência no ENEM</Label>
              <Select value={newTopicIncidence} onValueChange={setNewTopicIncidence}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INCIDENCE_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, topic: null })}>Cancelar</Button>
            <Button onClick={handleEditTopic}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Excluir */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, topic: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Tópico</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o tópico <strong>{deleteDialog.topic?.name}</strong>?
              <br />
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, topic: null })}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteTopic}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

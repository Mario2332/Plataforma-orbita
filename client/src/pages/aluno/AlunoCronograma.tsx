import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Save, Copy, Palette, Download, Upload, Trash2, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { alunoApi } from "@/lib/api";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type TimeSlot = {
  day: number; // 0 = Domingo, 6 = Sábado
  hour: number; // 0-23
  minute: number; // 0 ou 30
  activity: string;
  color: string;
};

type Template = {
  id: string;
  name: string;
  schedule: TimeSlot[];
  createdAt: Date;
};

const DAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 30];

const COLORS = [
  { name: "Laranja", value: "#FFA500" },
  { name: "Azul", value: "#4A90E2" },
  { name: "Verde", value: "#50C878" },
  { name: "Rosa", value: "#FF69B4" },
  { name: "Roxo", value: "#9B59B6" },
  { name: "Amarelo", value: "#FFD700" },
  { name: "Vermelho", value: "#E74C3C" },
  { name: "Cinza", value: "#95A5A6" },
  { name: "Branco", value: "#FFFFFF" },
];

export default function AlunoCronograma() {
  const [schedule, setSchedule] = useState<TimeSlot[]>([]);
  const [copiedCell, setCopiedCell] = useState<TimeSlot | null>(null);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [draggedCell, setDraggedCell] = useState<{ day: number; hour: number; minute: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Templates
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [templateName, setTemplateName] = useState("");

  // Carregar dados ao montar componente
  useEffect(() => {
    loadSchedule();
    loadTemplates();
  }, []);

  // Carregar cronograma do backend
  const loadSchedule = async () => {
    try {
      setIsLoading(true);
      const horarios = await alunoApi.getHorarios();
      
      // Converter horários do backend para TimeSlots
      const slots: TimeSlot[] = [];
      horarios.forEach((h: any) => {
        const [horaInicio, minutoInicio] = h.horaInicio.split(':').map(Number);
        const [horaFim, minutoFim] = h.horaFim.split(':').map(Number);
        
        // Criar slots para cada período de 30 minutos
        let currentHour = horaInicio;
        let currentMinute = minutoInicio;
        
        while (currentHour < horaFim || (currentHour === horaFim && currentMinute < minutoFim)) {
          slots.push({
            day: h.diaSemana,
            hour: currentHour,
            minute: currentMinute,
            activity: h.materia + (h.descricao ? ` - ${h.descricao}` : ''),
            color: h.cor || "#FFFFFF",
          });
          
          // Avançar 30 minutos
          currentMinute += 30;
          if (currentMinute >= 60) {
            currentMinute = 0;
            currentHour++;
          }
        }
      });
      
      setSchedule(slots);
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar cronograma");
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar templates
  const loadTemplates = async () => {
    try {
      const data = await alunoApi.getTemplates();
      setTemplates(data.map((t: any) => ({
        id: t.id,
        name: t.nome,
        schedule: t.horarios || [],
        createdAt: t.createdAt?.toDate ? t.createdAt.toDate() : new Date(t.createdAt),
      })));
    } catch (error: any) {
      console.error("Erro ao carregar templates:", error);
    }
  };

  const getCellKey = (day: number, hour: number, minute: number) => 
    `${day}-${hour}-${minute}`;

  const getSlot = (day: number, hour: number, minute: number): TimeSlot => {
    const existing = schedule.find(
      s => s.day === day && s.hour === hour && s.minute === minute
    );
    return existing || { day, hour, minute, activity: "", color: "#FFFFFF" };
  };

  const updateSlot = (day: number, hour: number, minute: number, updates: Partial<TimeSlot>) => {
    const existing = schedule.find(
      s => s.day === day && s.hour === hour && s.minute === minute
    );

    if (existing) {
      setSchedule(schedule.map(s => 
        s.day === day && s.hour === hour && s.minute === minute
          ? { ...s, ...updates }
          : s
      ));
    } else {
      setSchedule([...schedule, { day, hour, minute, activity: "", color: "#FFFFFF", ...updates }]);
    }
  };

  const handleCopy = (day: number, hour: number, minute: number) => {
    const slot = getSlot(day, hour, minute);
    setCopiedCell(slot);
    toast.success("Célula copiada!");
  };

  const handlePaste = (day: number, hour: number, minute: number) => {
    if (!copiedCell) {
      toast.error("Nenhuma célula copiada");
      return;
    }
    updateSlot(day, hour, minute, {
      activity: copiedCell.activity,
      color: copiedCell.color,
    });
    toast.success("Célula colada!");
  };

  // Drag and Drop
  const handleDragStart = (day: number, hour: number, minute: number) => {
    setDraggedCell({ day, hour, minute });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetDay: number, targetHour: number, targetMinute: number) => {
    if (!draggedCell) return;

    const sourceSlot = getSlot(draggedCell.day, draggedCell.hour, draggedCell.minute);
    const targetSlot = getSlot(targetDay, targetHour, targetMinute);

    // Trocar conteúdo das células
    updateSlot(targetDay, targetHour, targetMinute, {
      activity: sourceSlot.activity,
      color: sourceSlot.color,
    });

    updateSlot(draggedCell.day, draggedCell.hour, draggedCell.minute, {
      activity: targetSlot.activity,
      color: targetSlot.color,
    });

    setDraggedCell(null);
    toast.success("Atividade movida!");
  };

  // Templates
  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast.error("Digite um nome para o template");
      return;
    }

    try {
      setIsSaving(true);
      
      // Converter schedule atual para formato do backend
      const horarios = schedule
        .filter(s => s.activity) // Apenas slots com atividade
        .map(s => ({
          diaSemana: s.day,
          horaInicio: `${String(s.hour).padStart(2, '0')}:${String(s.minute).padStart(2, '0')}`,
          horaFim: `${String(s.hour).padStart(2, '0')}:${String(s.minute + 30).padStart(2, '0')}`,
          materia: s.activity.split(' - ')[0].trim(),
          descricao: s.activity.split(' - ').slice(1).join(' - ').trim() || undefined,
          cor: s.color,
        }));
      
      await alunoApi.saveTemplate({
        nome: templateName,
        horarios,
      });
      
      setTemplateName("");
      setShowSaveDialog(false);
      toast.success(`Template "${templateName}" salvo com sucesso!`);
      await loadTemplates(); // Recarregar lista de templates
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar template");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadTemplate = async (template: Template) => {
    try {
      setIsSaving(true);
      await alunoApi.loadTemplate(template.id);
      setShowLoadDialog(false);
      toast.success(`Template "${template.name}" carregado!`);
      await loadSchedule(); // Recarregar cronograma
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar template");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (confirm(`Deseja realmente excluir o template "${template?.name}"?`)) {
      try {
        await alunoApi.deleteTemplate(templateId);
        toast.success("Template excluído!");
        await loadTemplates(); // Recarregar lista
      } catch (error: any) {
        toast.error(error.message || "Erro ao excluir template");
      }
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Agrupar slots consecutivos do mesmo dia, atividade e cor
      const groupedSlots: Map<string, { day: number; startHour: number; startMinute: number; endHour: number; endMinute: number; activity: string; color: string }> = new Map();
      
      schedule.forEach(slot => {
        if (!slot.activity) return; // Ignorar slots vazios
        
        const key = `${slot.day}-${slot.activity}-${slot.color}`;
        const existing = groupedSlots.get(key);
        
        if (existing) {
          // Atualizar hora final se for consecutivo
          const currentTime = slot.hour * 60 + slot.minute;
          const existingEndTime = existing.endHour * 60 + existing.endMinute;
          
          if (currentTime === existingEndTime) {
            existing.endHour = slot.hour;
            existing.endMinute = slot.minute + 30;
            if (existing.endMinute >= 60) {
              existing.endMinute = 0;
              existing.endHour++;
            }
          }
        } else {
          // Novo grupo
          groupedSlots.set(key, {
            day: slot.day,
            startHour: slot.hour,
            startMinute: slot.minute,
            endHour: slot.hour,
            endMinute: slot.minute + 30,
            activity: slot.activity,
            color: slot.color,
          });
          
          if (groupedSlots.get(key)!.endMinute >= 60) {
            groupedSlots.get(key)!.endMinute = 0;
            groupedSlots.get(key)!.endHour++;
          }
        }
      });
      
      // Primeiro, deletar todos os horários existentes
      const existingHorarios = await alunoApi.getHorarios();
      await Promise.all(existingHorarios.map((h: any) => alunoApi.deleteHorario(h.id)));
      
      // Criar novos horários
      const promises = Array.from(groupedSlots.values()).map(group => {
        const [materia, ...descricaoParts] = group.activity.split(' - ');
        return alunoApi.createHorario({
          diaSemana: group.day,
          horaInicio: `${String(group.startHour).padStart(2, '0')}:${String(group.startMinute).padStart(2, '0')}`,
          horaFim: `${String(group.endHour).padStart(2, '0')}:${String(group.endMinute).padStart(2, '0')}`,
          materia: materia.trim(),
          descricao: descricaoParts.join(' - ').trim() || undefined,
          cor: group.color,
        });
      });
      
      await Promise.all(promises);
      
      toast.success("Cronograma salvo com sucesso!");
      await loadSchedule(); // Recarregar para sincronizar
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar cronograma");
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
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
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Cronograma Semanal</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowLoadDialog(true)} disabled={isSaving}>
              <FolderOpen className="mr-2 h-4 w-4" />
              Templates
            </Button>
            <Button variant="outline" onClick={() => setShowSaveDialog(true)} disabled={isSaving}>
              <Download className="mr-2 h-4 w-4" />
              Salvar Template
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground">
          Organize sua rotina semanal com cores, drag and drop e templates salvos.
        </p>
      </div>

      {/* Instruções - MOVIDO PARA CIMA */}
      <Card>
        <CardHeader>
          <CardTitle>Instruções</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• <strong>Editar:</strong> Clique em uma célula para digitar a atividade</p>
          <p>• <strong>Cor:</strong> Clique no ícone de paleta para escolher a cor da célula</p>
          <p>• <strong>Copiar:</strong> Clique no ícone de copiar ou clique com botão direito</p>
          <p>• <strong>Colar:</strong> Após copiar, clique com botão direito na célula de destino</p>
          <p>• <strong>Mover:</strong> Arraste e solte células para reorganizar atividades</p>
          <p>• <strong>Templates:</strong> Salve e carregue diferentes modelos de cronograma</p>
        </CardContent>
      </Card>

      {/* Grade Semanal */}
      <Card>
        <CardHeader>
          <CardTitle>Grade Semanal</CardTitle>
          <CardDescription>
            Intervalos de 30 minutos • Clique para editar • Arraste para mover • Clique direito para copiar/colar
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="min-w-[900px]">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-border bg-muted p-2 text-sm font-semibold sticky left-0 z-10">
                    Horário
                  </th>
                  {DAYS.map((day, index) => (
                    <th key={index} className="border border-border bg-muted p-2 text-sm font-semibold">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOURS.map(hour =>
                  MINUTES.map(minute => {
                    const timeKey = `${hour}-${minute}`;
                    return (
                      <tr key={timeKey}>
                        <td className="border border-border bg-muted p-2 text-xs font-mono sticky left-0 z-10">
                          {formatTime(hour, minute)}
                        </td>
                        {DAYS.map((_, dayIndex) => {
                          const slot = getSlot(dayIndex, hour, minute);
                          const cellKey = getCellKey(dayIndex, hour, minute);
                          const isEditing = editingCell === cellKey;

                          return (
                            <td
                              key={cellKey}
                              className="border border-border p-0 h-10 relative group"
                              style={{ backgroundColor: slot.color }}
                              draggable={!isEditing && slot.activity !== ""}
                              onDragStart={() => handleDragStart(dayIndex, hour, minute)}
                              onDragOver={handleDragOver}
                              onDrop={() => handleDrop(dayIndex, hour, minute)}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                if (copiedCell) {
                                  handlePaste(dayIndex, hour, minute);
                                } else {
                                  handleCopy(dayIndex, hour, minute);
                                }
                              }}
                            >
                              {isEditing ? (
                                <Input
                                  autoFocus
                                  value={slot.activity}
                                  onChange={(e) => updateSlot(dayIndex, hour, minute, { activity: e.target.value })}
                                  onBlur={() => setEditingCell(null)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") setEditingCell(null);
                                    if (e.key === "Escape") setEditingCell(null);
                                  }}
                                  className="h-full border-0 text-xs p-1"
                                  style={{ backgroundColor: slot.color }}
                                />
                              ) : (
                                <div
                                  onClick={() => setEditingCell(cellKey)}
                                  className="h-full w-full p-1 text-xs cursor-pointer flex items-center justify-between"
                                >
                                  <span className="truncate flex-1">{slot.activity}</span>
                                  <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                          }}
                                          className="p-0.5 hover:bg-black/10 rounded"
                                        >
                                          <Palette className="h-3 w-3" />
                                        </button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-2">
                                        <div className="grid grid-cols-3 gap-2">
                                          {COLORS.map((color) => (
                                            <button
                                              key={color.value}
                                              onClick={() => {
                                                updateSlot(dayIndex, hour, minute, { color: color.value });
                                              }}
                                              className="w-8 h-8 rounded border-2 border-border hover:scale-110 transition-transform"
                                              style={{ backgroundColor: color.value }}
                                              title={color.name}
                                            />
                                          ))}
                                        </div>
                                      </PopoverContent>
                                    </Popover>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopy(dayIndex, hour, minute);
                                      }}
                                      className="p-0.5 hover:bg-black/10 rounded"
                                      title="Copiar"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Salvar Template */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar como Template</DialogTitle>
            <DialogDescription>
              Salve o cronograma atual como um template reutilizável
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="templateName">Nome do Template</Label>
              <Input
                id="templateName"
                placeholder="Ex: Semana de Provas, Rotina Normal..."
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveTemplate}>
              <Save className="mr-2 h-4 w-4" />
              Salvar Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Carregar Template */}
      <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Meus Templates</DialogTitle>
            <DialogDescription>
              Carregue um template salvo ou exclua templates antigos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {templates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>Nenhum template salvo ainda</p>
              </div>
            ) : (
              templates.map((template) => (
                <Card key={template.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{template.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {template.schedule.filter(s => s.activity).length} atividades • 
                        Criado em {new Date(template.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleLoadTemplate(template)}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Carregar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

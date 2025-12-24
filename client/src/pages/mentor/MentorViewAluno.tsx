import { useState, useEffect, createContext, useContext } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mentorApi } from "@/lib/api";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Importar componentes originais do aluno
import AlunoHome from "../aluno/AlunoHome";
import AlunoEstudos from "../aluno/AlunoEstudos";
import AlunoSimulados from "../aluno/AlunoSimulados";
import AlunoMetricas from "../aluno/AlunoMetricas";
import AlunoCronograma from "../aluno/AlunoCronograma";
import AlunoDiario from "../aluno/AlunoDiario";

// Contexto para passar o alunoId para os componentes filhos
interface MentorViewContextType {
  alunoId: string;
  isMentorView: boolean;
}

const MentorViewContext = createContext<MentorViewContextType | null>(null);

export const useMentorView = () => {
  const context = useContext(MentorViewContext);
  return context;
};

export default function MentorViewAluno() {
  const [match, params] = useRoute("/mentor/alunos/:alunoId");
  const [, setLocation] = useLocation();
  const alunoId = params?.alunoId;
  const [isLoading, setIsLoading] = useState(true);
  const [alunoData, setAlunoData] = useState<any>(null);

  useEffect(() => {
    loadAlunoData();
  }, [alunoId]);

  const loadAlunoData = async () => {
    if (!alunoId) {
      toast.error("ID do aluno não fornecido");
      setLocation("/mentor/alunos");
      return;
    }

    try {
      setIsLoading(true);
      const data = await mentorApi.getAlunoAreaCompleta(alunoId);
      setAlunoData(data);
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar dados do aluno");
      setLocation("/mentor/alunos");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!alunoData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground mb-4">Aluno não encontrado</p>
        <Button onClick={() => setLocation("/mentor/alunos")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <MentorViewContext.Provider value={{ alunoId: alunoId!, isMentorView: true }}>
      <div className="space-y-6">
        {/* Header com informações do aluno */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/mentor/alunos")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </div>
            <h1 className="text-3xl font-bold">{alunoData.aluno.nome}</h1>
            <p className="text-muted-foreground mt-1">
              Visualizando e editando como mentor • {alunoData.aluno.email}
            </p>
          </div>
        </div>

        {/* Alerta informativo */}
        <Card className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950 dark:border-emerald-800">
          <CardContent className="pt-6">
            <p className="text-sm text-emerald-800 dark:text-emerald-200">
              ℹ️ Você está visualizando e pode editar a área do aluno. 
              Todas as alterações serão salvas na conta do aluno.
            </p>
          </CardContent>
        </Card>

        {/* Tabs com as áreas do aluno */}
        <Tabs defaultValue="inicio" className="space-y-4">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="inicio">Início</TabsTrigger>
            <TabsTrigger value="estudos">Estudos</TabsTrigger>
            <TabsTrigger value="cronograma">Cronograma</TabsTrigger>
            <TabsTrigger value="metricas">Métricas</TabsTrigger>
            <TabsTrigger value="simulados">Simulados</TabsTrigger>
            <TabsTrigger value="diario">Diário de Bordo</TabsTrigger>
          </TabsList>

          <TabsContent value="inicio">
            <AlunoHome />
          </TabsContent>

          <TabsContent value="estudos">
            <AlunoEstudos />
          </TabsContent>

          <TabsContent value="cronograma">
            <AlunoCronograma />
          </TabsContent>

          <TabsContent value="metricas">
            <AlunoMetricas />
          </TabsContent>

          <TabsContent value="simulados">
            <AlunoSimulados />
          </TabsContent>

          <TabsContent value="diario">
            <AlunoDiario />
          </TabsContent>
        </Tabs>
      </div>
    </MentorViewContext.Provider>
  );
}

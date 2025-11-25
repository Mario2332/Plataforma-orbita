import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, Target, Calendar } from "lucide-react";

interface Meta {
  id: string;
  tipo: string;
  nome: string;
  valorAtual: number;
  valorAlvo: number;
  unidade: string;
  dataFim: any;
  status: string;
}

interface CardsProgressoMetasAtivasProps {
  metas: Meta[];
}

export function CardsProgressoMetasAtivas({ metas }: CardsProgressoMetasAtivasProps) {
  const metasAtivas = metas.filter(m => m.status === 'ativa');
  
  if (metasAtivas.length === 0) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Progresso das Metas Ativas
          </CardTitle>
          <CardDescription>
            Acompanhe o progresso das suas metas em andamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Nenhuma meta ativa no momento. Crie uma nova meta para começar!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Progresso das Metas Ativas
        </CardTitle>
        <CardDescription>
          Acompanhe o progresso das suas metas em andamento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {metasAtivas.map((meta) => {
            const progresso = Math.min(100, Math.round((meta.valorAtual / meta.valorAlvo) * 100));
            
            let diasRestantes = 0;
            try {
              if (meta.dataFim) {
                const dataFim = meta.dataFim?.toDate ? meta.dataFim.toDate() : new Date(meta.dataFim);
                if (!isNaN(dataFim.getTime())) {
                  const hoje = new Date();
                  diasRestantes = Math.ceil((dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
                }
              }
            } catch {
              diasRestantes = 0;
            }
            
            // Cor da barra de progresso
            let progressColor = "bg-gray-500";
            if (progresso >= 90) progressColor = "bg-green-500";
            else if (progresso >= 75) progressColor = "bg-blue-500";
            else if (progresso >= 50) progressColor = "bg-yellow-500";
            else if (progresso >= 25) progressColor = "bg-orange-500";
            
            // Cor do badge de dias restantes
            let badgeVariant: "default" | "destructive" | "secondary" = "default";
            let badgeClass = "";
            if (diasRestantes <= 1) {
              badgeVariant = "destructive";
            } else if (diasRestantes <= 3) {
              badgeClass = "bg-orange-500 hover:bg-orange-600";
            } else if (diasRestantes <= 7) {
              badgeClass = "bg-yellow-500 hover:bg-yellow-600";
            }

            return (
              <div key={meta.id} className="space-y-2 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-base truncate">{meta.nome}</h4>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Target className="h-3.5 w-3.5" />
                        {meta.valorAtual} / {meta.valorAlvo} {meta.unidade}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {diasRestantes > 0 ? `${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'}` : 'Último dia!'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={badgeVariant} className={badgeClass}>
                      {progresso}%
                    </Badge>
                    {diasRestantes <= 3 && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        Urgente
                      </Badge>
                    )}
                  </div>
                </div>
                <Progress value={progresso} className="h-2" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

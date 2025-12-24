import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Zap } from "lucide-react";
import AlunoCronograma from "./AlunoCronograma";
import CronogramaDinamico from "./CronogramaDinamico";

export default function AlunoCronogramaPage() {
  const [activeTab, setActiveTab] = useState("semanal");

  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      {/* Elementos decorativos */}
      <div className="fixed top-20 right-10 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="fixed bottom-20 left-10 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl animate-float-delayed pointer-events-none" />

      {/* Header Premium */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500/20 via-teal-500/10 to-emerald-500/10 p-8 border-2 border-white/20 dark:border-white/10 backdrop-blur-xl shadow-2xl animate-slide-up">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-indigo-500/30 to-teal-500/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-gradient-to-br from-teal-500/30 to-emerald-500/30 rounded-full blur-2xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-teal-500 shadow-lg shadow-indigo-500/25">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
                Cronograma de Estudos
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Organize sua rotina e maximize seu aprendizado
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs para alternar entre Semanal e Anual Dinâmico */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="semanal" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Semanal
          </TabsTrigger>
          <TabsTrigger value="anual-dinamico" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Anual - Dinâmico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="semanal" className="mt-0">
          <AlunoCronograma />
        </TabsContent>

        <TabsContent value="anual-dinamico" className="mt-0">
          <CronogramaDinamico />
        </TabsContent>
      </Tabs>
    </div>
  );
}

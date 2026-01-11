import { useEscolaView } from "@/pages/escola/EscolaViewAluno";
import { escolaApi } from "@/lib/api";
import { cachedAlunoApi, cachedEscolaApi } from "@/lib/cachedApi";
import { cache, CACHE_KEYS, CACHE_TTL } from "@/lib/cache";

/**
 * Hook que retorna a API correta dependendo se está em modo escola ou aluno
 * Usa cache em memória para melhorar performance
 */
export function useAlunoApi() {
  const escolaView = useEscolaView();
  
  if (escolaView?.isEscolaView && escolaView?.alunoId) {
    const alunoId = escolaView.alunoId;
    
    // Modo escola: usar funções do escola com alunoId e cache
    return {
      // Estudos
      getEstudos: () => cache.getOrFetch(
        CACHE_KEYS.ESCOLA_ALUNO_DATA(alunoId, "estudos"),
        () => escolaApi.getAlunoData({ alunoId, collection: "estudos" }),
        CACHE_TTL.MEDIUM
      ),
      createEstudo: async (data: any) => {
        const result = await escolaApi.createAlunoEstudo({ ...data, alunoId });
        cache.delete(CACHE_KEYS.ESCOLA_ALUNO_DATA(alunoId, "estudos"));
        return result;
      },
      updateEstudo: async (estudoId: string, data: any) => {
        const result = await escolaApi.updateAlunoEstudo({ ...data, alunoId, estudoId });
        cache.delete(CACHE_KEYS.ESCOLA_ALUNO_DATA(alunoId, "estudos"));
        return result;
      },
      deleteEstudo: async (estudoId: string) => {
        const result = await escolaApi.deleteAlunoEstudo({ alunoId, estudoId });
        cache.delete(CACHE_KEYS.ESCOLA_ALUNO_DATA(alunoId, "estudos"));
        return result;
      },
      
      // Simulados
      getSimulados: () => cache.getOrFetch(
        CACHE_KEYS.ESCOLA_ALUNO_DATA(alunoId, "simulados"),
        () => escolaApi.getAlunoData({ alunoId, collection: "simulados" }),
        CACHE_TTL.MEDIUM
      ),
      createSimulado: async (data: any) => {
        const result = await escolaApi.createAlunoSimulado({ ...data, alunoId });
        cache.delete(CACHE_KEYS.ESCOLA_ALUNO_DATA(alunoId, "simulados"));
        return result;
      },
      updateSimulado: async (data: any) => {
        const result = await escolaApi.updateAlunoSimulado({ ...data, alunoId });
        cache.delete(CACHE_KEYS.ESCOLA_ALUNO_DATA(alunoId, "simulados"));
        return result;
      },
      deleteSimulado: async (simuladoId: string) => {
        const result = await escolaApi.deleteAlunoSimulado({ alunoId, simuladoId });
        cache.delete(CACHE_KEYS.ESCOLA_ALUNO_DATA(alunoId, "simulados"));
        return result;
      },
      
      // Métricas
      getMetricas: () => cache.getOrFetch(
        CACHE_KEYS.ESCOLA_ALUNO_DATA(alunoId, "metricas"),
        () => escolaApi.getAlunoData({ alunoId, collection: "metricas" }),
        CACHE_TTL.MEDIUM
      ),
      
      // Cronograma
      getCronograma: () => cache.getOrFetch(
        CACHE_KEYS.ESCOLA_ALUNO_DATA(alunoId, "cronogramas"),
        () => escolaApi.getAlunoData({ alunoId, collection: "cronogramas" }),
        CACHE_TTL.MEDIUM
      ),
      createCronograma: (data: any) => escolaApi.createAlunoCronograma({ ...data, alunoId }),
      updateCronograma: (data: any) => escolaApi.updateAlunoCronograma({ ...data, alunoId }),
      deleteCronograma: (cronogramaId: string) => escolaApi.deleteAlunoCronograma({ alunoId, cronogramaId }),
      
      // Tarefas
      getTarefas: (cronogramaId: string) => {
        return Promise.resolve([]);
      },
      createTarefa: (data: any) => escolaApi.createAlunoTarefa({ ...data, alunoId }),
      updateTarefa: (data: any) => escolaApi.updateAlunoTarefa({ ...data, alunoId }),
      deleteTarefa: (tarefaId: string, cronogramaId: string) => escolaApi.deleteAlunoTarefa({ alunoId, cronogramaId, tarefaId }),
      
      // Horários
      getHorarios: () => cache.getOrFetch(
        CACHE_KEYS.ESCOLA_ALUNO_DATA(alunoId, "horarios"),
        () => escolaApi.getAlunoData({ alunoId, collection: "horarios" }),
        CACHE_TTL.MEDIUM
      ),
      createHorario: async (data: any) => {
        const result = await escolaApi.createAlunoHorario({ ...data, alunoId });
        cache.delete(CACHE_KEYS.ESCOLA_ALUNO_DATA(alunoId, "horarios"));
        return result;
      },
      updateHorario: async (data: any) => {
        const result = await escolaApi.updateAlunoHorario({ ...data, alunoId });
        cache.delete(CACHE_KEYS.ESCOLA_ALUNO_DATA(alunoId, "horarios"));
        return result;
      },
      deleteHorario: async (horarioId: string) => {
        const result = await escolaApi.deleteAlunoHorario({ alunoId, horarioId });
        cache.delete(CACHE_KEYS.ESCOLA_ALUNO_DATA(alunoId, "horarios"));
        return result;
      },
      clearAllHorarios: async () => {
        const result = await escolaApi.clearAlunoHorarios({ alunoId });
        cache.delete(CACHE_KEYS.ESCOLA_ALUNO_DATA(alunoId, "horarios"));
        return result;
      },
      
      // Templates
      getTemplates: () => cache.getOrFetch(
        CACHE_KEYS.ESCOLA_ALUNO_DATA(alunoId, "templates"),
        () => escolaApi.getAlunoData({ alunoId, collection: "templates" }),
        CACHE_TTL.LONG
      ),
      saveTemplate: async (data: any) => {
        const result = await escolaApi.saveAlunoTemplate({ ...data, alunoId });
        cache.delete(CACHE_KEYS.ESCOLA_ALUNO_DATA(alunoId, "templates"));
        return result;
      },
      loadTemplate: (templateId: string) => escolaApi.loadAlunoTemplate({ alunoId, templateId }),
      deleteTemplate: async (templateId: string) => {
        const result = await escolaApi.deleteAlunoTemplate({ alunoId, templateId });
        cache.delete(CACHE_KEYS.ESCOLA_ALUNO_DATA(alunoId, "templates"));
        return result;
      },
      
      // Diário Emocional
      getDiarioEmocional: (data?: any) => cache.getOrFetch(
        CACHE_KEYS.ESCOLA_ALUNO_DATA(alunoId, "diario_emocional"),
        () => escolaApi.getAlunoData({ alunoId, collection: "diario_emocional" }),
        CACHE_TTL.MEDIUM
      ),
      createDiarioEmocional: async (data: any) => {
        const result = await escolaApi.createAlunoDiarioEmocional({ ...data, alunoId });
        cache.delete(CACHE_KEYS.ESCOLA_ALUNO_DATA(alunoId, "diario_emocional"));
        return result;
      },
      deleteDiarioEmocional: async (registroId: string) => {
        const result = await escolaApi.deleteAlunoDiarioEmocional({ alunoId, registroId });
        cache.delete(CACHE_KEYS.ESCOLA_ALUNO_DATA(alunoId, "diario_emocional"));
        return result;
      },
      
      // Autodiagnóstico
      getAutodiagnosticos: () => cache.getOrFetch(
        CACHE_KEYS.ESCOLA_ALUNO_DATA(alunoId, "autodiagnosticos"),
        () => escolaApi.getAlunoData({ alunoId, collection: "autodiagnosticos" }),
        CACHE_TTL.MEDIUM
      ),
      createAutodiagnostico: async (data: any) => {
        const result = await escolaApi.createAlunoAutodiagnostico({ ...data, alunoId });
        cache.delete(CACHE_KEYS.ESCOLA_ALUNO_DATA(alunoId, "autodiagnosticos"));
        return result;
      },
      deleteAutodiagnostico: async (autodiagnosticoId: string) => {
        const result = await escolaApi.deleteAlunoAutodiagnostico({ alunoId, autodiagnosticoId });
        cache.delete(CACHE_KEYS.ESCOLA_ALUNO_DATA(alunoId, "autodiagnosticos"));
        return result;
      },
      
      // Progresso (conteúdos ENEM)
      getProgresso: (materia?: string) => cache.getOrFetch(
        CACHE_KEYS.ESCOLA_ALUNO_DATA(alunoId, `progresso:${materia || 'all'}`),
        () => escolaApi.getAlunoData({ alunoId, collection: "progresso" }),
        CACHE_TTL.MEDIUM
      ),
      updateProgresso: async (data: any) => {
        const result = await escolaApi.updateAlunoProgresso({ ...data, alunoId });
        cache.deleteByPrefix(CACHE_KEYS.ESCOLA_ALUNO_DATA(alunoId, "progresso"));
        return result;
      },
      
      // Profile
      getMe: () => cache.getOrFetch(
        CACHE_KEYS.ESCOLA_ALUNO_DATA(alunoId, "profile"),
        () => escolaApi.getAlunoById(alunoId),
        CACHE_TTL.LONG
      ),
      updateProfile: async (data: any) => {
        const result = await escolaApi.updateAlunoProfile({ ...data, alunoId });
        cache.delete(CACHE_KEYS.ESCOLA_ALUNO_DATA(alunoId, "profile"));
        return result;
      },
    };
  }
  
  // Modo aluno: usar API com cache
  return cachedAlunoApi;
}

import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

/**
 * API para gerenciar cronograma anual
 */

export const cronogramaAnualApi = {
  /**
   * Obter cronograma anual (extensivo ou intensivo)
   */
  getCronograma: async (tipo: "extensive" | "intensive") => {
    const getCronogramaAnual = httpsCallable(functions, "getCronogramaAnual");
    const result = await getCronogramaAnual({ tipo });
    return result.data as {
      cronograma: {
        cycles: Array<{
          cycle: number;
          subjects: Array<{
            name: string;
            topics: string[];
          }>;
        }>;
      };
      completedTopics: Record<string, boolean>;
      activeSchedule: string;
    };
  },

  /**
   * Marcar/desmarcar tópico como concluído
   */
  toggleTopico: async (topicoId: string, completed: boolean) => {
    const toggleTopicoCompleto = httpsCallable(functions, "toggleTopicoCompleto");
    const result = await toggleTopicoCompleto({ topicoId, completed });
    return result.data as { success: boolean };
  },

  /**
   * Definir cronograma ativo
   */
  setActiveSchedule: async (tipo: "extensive" | "intensive") => {
    const setActiveSchedule = httpsCallable(functions, "setActiveSchedule");
    const result = await setActiveSchedule({ tipo });
    return result.data as { success: boolean };
  },
};

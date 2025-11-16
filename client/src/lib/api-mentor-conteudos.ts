import { functions } from "./firebase";
import { httpsCallable } from "firebase/functions";

export const mentorConteudosApi = {
  /**
   * Obter conteúdos mesclados de uma matéria
   */
  getConteudos: async (materiaKey?: string) => {
    const callable = httpsCallable(functions, "getConteudos");
    const result = await callable({ materiaKey });
    return result.data;
  },

  /**
   * Criar novo tópico
   */
  createTopico: async (data: {
    materiaKey: string;
    name: string;
    incidenceLevel: string;
  }) => {
    const callable = httpsCallable(functions, "createTopico");
    const result = await callable(data);
    return result.data;
  },

  /**
   * Atualizar tópico existente
   */
  updateTopico: async (data: {
    materiaKey: string;
    topicoId: string;
    name?: string;
    incidenceLevel?: string;
  }) => {
    const callable = httpsCallable(functions, "updateTopico");
    const result = await callable(data);
    return result.data;
  },

  /**
   * Deletar tópico (soft delete)
   */
  deleteTopico: async (data: {
    materiaKey: string;
    topicoId: string;
  }) => {
    const callable = httpsCallable(functions, "deleteTopico");
    const result = await callable(data);
    return result.data;
  },
};

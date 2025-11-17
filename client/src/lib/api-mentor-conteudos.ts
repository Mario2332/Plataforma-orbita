import { functions, auth } from "./firebase";
import { httpsCallable } from "firebase/functions";

/**
 * Helper para garantir que o usuário está autenticado
 */
async function ensureAuthenticated() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Você precisa estar autenticado para acessar este recurso");
  }
  
  // Forçar refresh do token se necessário
  try {
    await user.getIdToken(true);
  } catch (error) {
    console.error("Erro ao renovar token:", error);
    throw new Error("Sessão expirada. Por favor, faça login novamente.");
  }
  
  return user;
}

/**
 * Helper para chamar funções com retry automático
 */
async function callWithRetry<T>(
  functionName: string,
  data: any,
  maxRetries = 2
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Garantir autenticação antes de cada tentativa
      await ensureAuthenticated();
      
      const callable = httpsCallable(functions, functionName);
      const result = await callable(data);
      return result.data as T;
    } catch (error: any) {
      lastError = error;
      
      // Log do erro
      console.error(`Tentativa ${attempt + 1} falhou:`, {
        function: functionName,
        error: error.message,
        code: error.code,
      });
      
      // Se for erro de autenticação, não tentar novamente
      if (error.code === "functions/unauthenticated") {
        throw new Error("Sessão expirada. Por favor, faça login novamente.");
      }
      
      // Se for erro de permissão, não tentar novamente
      if (error.code === "functions/permission-denied") {
        throw new Error("Você não tem permissão para realizar esta ação.");
      }
      
      // Se for o último retry, lançar o erro
      if (attempt === maxRetries) {
        break;
      }
      
      // Aguardar antes de tentar novamente (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  // Se chegou aqui, todas as tentativas falharam
  const errorMessage = lastError?.message || "Erro desconhecido ao chamar função";
  throw new Error(errorMessage);
}

export const mentorConteudosApi = {
  /**
   * Obter conteúdos mesclados de uma matéria
   */
  getConteudos: async (materiaKey?: string) => {
    return callWithRetry("getConteudos", { materiaKey });
  },

  /**
   * Criar novo tópico
   */
  createTopico: async (data: {
    materiaKey: string;
    name: string;
    incidenceLevel: string;
  }) => {
    return callWithRetry("createTopico", data);
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
    return callWithRetry("updateTopico", data);
  },

  /**
   * Deletar tópico (soft delete)
   */
  deleteTopico: async (data: {
    materiaKey: string;
    topicoId: string;
  }) => {
    return callWithRetry("deleteTopico", data);
  },
};

/**
 * Acesso direto ao Firestore (sem Cloud Functions)
 * 
 * Isso elimina o cold start das Cloud Functions, reduzindo
 * o tempo de carregamento de ~20-30s para ~1-3s.
 * 
 * As regras de segurança do Firestore garantem que apenas
 * usuários autenticados podem acessar seus próprios dados.
 */

import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  writeBatch,
  Timestamp
} from "firebase/firestore";
import { db, auth } from "./firebase";

// ============================================
// HORÁRIOS (Cronograma Semanal)
// ============================================

export interface Horario {
  id?: string;
  diaSemana: number;
  horaInicio: string;
  horaFim: string;
  materia: string;
  descricao?: string;
  cor?: string;
  createdAt?: Date;
}

/**
 * Buscar todos os horários do aluno logado
 * Acesso direto ao Firestore - sem cold start!
 */
export async function getHorariosDirect(): Promise<Horario[]> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Usuário não autenticado");

  const horariosRef = collection(db, "alunos", userId, "horarios");
  const q = query(horariosRef, orderBy("diaSemana"), orderBy("horaInicio"));
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Horario[];
}

/**
 * Criar um novo horário
 */
export async function createHorarioDirect(horario: Omit<Horario, 'id'>): Promise<string> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Usuário não autenticado");

  const horariosRef = collection(db, "alunos", userId, "horarios");
  const docRef = await addDoc(horariosRef, {
    ...horario,
    createdAt: Timestamp.now()
  });
  
  return docRef.id;
}

/**
 * Atualizar um horário existente
 */
export async function updateHorarioDirect(horarioId: string, updates: Partial<Horario>): Promise<void> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Usuário não autenticado");

  const horarioRef = doc(db, "alunos", userId, "horarios", horarioId);
  await updateDoc(horarioRef, updates);
}

/**
 * Deletar um horário
 */
export async function deleteHorarioDirect(horarioId: string): Promise<void> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Usuário não autenticado");

  const horarioRef = doc(db, "alunos", userId, "horarios", horarioId);
  await deleteDoc(horarioRef);
}

/**
 * Limpar todos os horários do aluno
 * Usa batch para melhor performance
 */
export async function clearAllHorariosDirect(): Promise<void> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Usuário não autenticado");

  const horariosRef = collection(db, "alunos", userId, "horarios");
  const snapshot = await getDocs(horariosRef);
  
  if (snapshot.empty) return;

  // Firestore tem limite de 500 operações por batch
  const BATCH_SIZE = 500;
  const docs = snapshot.docs;
  
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const chunk = docs.slice(i, i + BATCH_SIZE);
    chunk.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  }
}

/**
 * Salvar múltiplos horários de uma vez (batch)
 * Muito mais rápido que salvar um por um
 */
export async function saveHorariosBatch(horarios: Omit<Horario, 'id'>[]): Promise<void> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Usuário não autenticado");

  if (horarios.length === 0) return;

  const horariosRef = collection(db, "alunos", userId, "horarios");
  
  // Firestore tem limite de 500 operações por batch
  const BATCH_SIZE = 500;
  
  for (let i = 0; i < horarios.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const chunk = horarios.slice(i, i + BATCH_SIZE);
    
    chunk.forEach(horario => {
      const newDocRef = doc(horariosRef);
      batch.set(newDocRef, {
        ...horario,
        createdAt: Timestamp.now()
      });
    });
    
    await batch.commit();
  }
}

/**
 * Limpar e salvar horários em uma única operação otimizada
 * Combina delete + create para minimizar round-trips
 */
export async function replaceAllHorarios(horarios: Omit<Horario, 'id'>[]): Promise<void> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Usuário não autenticado");

  const horariosRef = collection(db, "alunos", userId, "horarios");
  
  // Buscar documentos existentes para deletar
  const snapshot = await getDocs(horariosRef);
  const existingDocs = snapshot.docs;
  
  // Firestore tem limite de 500 operações por batch
  const BATCH_SIZE = 500;
  const allOperations: Array<{ type: 'delete' | 'set', ref: any, data?: any }> = [];
  
  // Adicionar operações de delete
  existingDocs.forEach(doc => {
    allOperations.push({ type: 'delete', ref: doc.ref });
  });
  
  // Adicionar operações de create
  horarios.forEach(horario => {
    const newDocRef = doc(horariosRef);
    allOperations.push({ 
      type: 'set', 
      ref: newDocRef, 
      data: { ...horario, createdAt: Timestamp.now() } 
    });
  });
  
  // Executar em batches
  for (let i = 0; i < allOperations.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const chunk = allOperations.slice(i, i + BATCH_SIZE);
    
    chunk.forEach(op => {
      if (op.type === 'delete') {
        batch.delete(op.ref);
      } else {
        batch.set(op.ref, op.data);
      }
    });
    
    await batch.commit();
  }
}

// ============================================
// TEMPLATES
// ============================================

export interface Template {
  id?: string;
  nome: string;
  horarios: Horario[];
  createdAt?: Date;
}

/**
 * Buscar todos os templates do aluno
 */
export async function getTemplatesDirect(): Promise<Template[]> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Usuário não autenticado");

  const templatesRef = collection(db, "alunos", userId, "templates");
  const q = query(templatesRef, orderBy("createdAt", "desc"));
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Template[];
}

/**
 * Salvar um novo template
 */
export async function saveTemplateDirect(template: { nome: string; horarios: any[] }): Promise<string> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Usuário não autenticado");

  const templatesRef = collection(db, "alunos", userId, "templates");
  const docRef = await addDoc(templatesRef, {
    ...template,
    createdAt: Timestamp.now()
  });
  
  return docRef.id;
}

/**
 * Carregar um template específico
 */
export async function loadTemplateDirect(templateId: string): Promise<Template | null> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Usuário não autenticado");

  const templatesRef = collection(db, "alunos", userId, "templates");
  const snapshot = await getDocs(templatesRef);
  
  const templateDoc = snapshot.docs.find(doc => doc.id === templateId);
  if (!templateDoc) return null;
  
  return {
    id: templateDoc.id,
    ...templateDoc.data()
  } as Template;
}

/**
 * Deletar um template
 */
export async function deleteTemplateDirect(templateId: string): Promise<void> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Usuário não autenticado");

  const templateRef = doc(db, "alunos", userId, "templates", templateId);
  await deleteDoc(templateRef);
}


// ============================================
// ESTUDOS
// ============================================

export interface Estudo {
  id?: string;
  data: Date;
  materia: string;
  assunto?: string;
  tempoMinutos: number;
  questoesFeitas: number;
  questoesAcertadas: number;
  anotacoes?: string;
  createdAt?: Date;
}

/**
 * Buscar todos os estudos do aluno
 * Limitado aos 200 mais recentes para performance
 */
export async function getEstudosDirect(): Promise<Estudo[]> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Usuário não autenticado");

  const estudosRef = collection(db, "alunos", userId, "estudos");
  const q = query(estudosRef, orderBy("data", "desc"));
  
  const snapshot = await getDocs(q);
  return snapshot.docs.slice(0, 200).map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Estudo[];
}

// ============================================
// SIMULADOS
// ============================================

export interface Simulado {
  id?: string;
  data: Date;
  tipo: string;
  linguagensAcertos: number;
  linguagensTotal: number;
  humanasAcertos: number;
  humanasTotal: number;
  naturezaAcertos: number;
  naturezaTotal: number;
  matematicaAcertos: number;
  matematicaTotal: number;
  redacaoNota?: number;
  anotacoes?: string;
  createdAt?: Date;
}

/**
 * Buscar todos os simulados do aluno
 * Limitado aos 100 mais recentes para performance
 */
export async function getSimuladosDirect(): Promise<Simulado[]> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Usuário não autenticado");

  const simuladosRef = collection(db, "alunos", userId, "simulados");
  const q = query(simuladosRef, orderBy("data", "desc"));
  
  const snapshot = await getDocs(q);
  return snapshot.docs.slice(0, 100).map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Simulado[];
}

// ============================================
// METAS
// ============================================

export interface Meta {
  id?: string;
  titulo: string;
  descricao?: string;
  tipo: string;
  valorAlvo: number;
  valorAtual: number;
  unidade: string;
  dataInicio: Date;
  dataFim: Date;
  concluida: boolean;
  createdAt?: Date;
}

/**
 * Buscar todas as metas do aluno
 */
export async function getMetasDirect(): Promise<Meta[]> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Usuário não autenticado");

  const metasRef = collection(db, "alunos", userId, "metas");
  const q = query(metasRef, orderBy("dataFim", "asc"));
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Meta[];
}


// ============================================
// PLANOS DE AÇÃO (Pendências de Estudo)
// ============================================

export interface PlanoAcao {
  id?: string;
  prova: string;              // Nome da prova (ex: "ENEM 2024")
  macroassunto: string;
  microassunto: string;
  motivoErro: "interpretacao" | "lacuna_teorica";
  quantidadeErros: number;    // Contagem de erros do mesmo tipo
  conduta: string;            // Texto da conduta recomendada
  resolvido: boolean;
  resolvidoEm?: Date;
  criadoManualmente: boolean; // true se foi adicionado manualmente pelo aluno
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Buscar todos os planos de ação do aluno
 */
export async function getPlanosAcaoDirect(): Promise<PlanoAcao[]> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Usuário não autenticado");

  const planosRef = collection(db, "alunos", userId, "planosAcao");
  // Não usar orderBy para evitar necessidade de índice composto
  const snapshot = await getDocs(planosRef);
  
  // Ordenar no cliente por data de criação (criadoEm ou createdAt)
  const planos = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      // Normalizar campo de data
      createdAt: data.createdAt || data.criadoEm || null
    };
  }) as PlanoAcao[];
  
  // Ordenar por data decrescente (mais recentes primeiro)
  return planos.sort((a, b) => {
    const dateA = a.createdAt?.toDate?.() || new Date(0);
    const dateB = b.createdAt?.toDate?.() || new Date(0);
    return dateB.getTime() - dateA.getTime();
  });
}

/**
 * Criar um novo plano de ação
 */
export async function createPlanoAcaoDirect(plano: Omit<PlanoAcao, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Usuário não autenticado");

  const planosRef = collection(db, "alunos", userId, "planosAcao");
  const docRef = await addDoc(planosRef, {
    ...plano,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  
  return docRef.id;
}

/**
 * Atualizar um plano de ação existente
 */
export async function updatePlanoAcaoDirect(planoId: string, updates: Partial<PlanoAcao>): Promise<void> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Usuário não autenticado");

  const planoRef = doc(db, "alunos", userId, "planosAcao", planoId);
  await updateDoc(planoRef, {
    ...updates,
    updatedAt: Timestamp.now()
  });
}

/**
 * Marcar plano de ação como resolvido
 */
export async function resolverPlanoAcaoDirect(planoId: string): Promise<void> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Usuário não autenticado");

  const planoRef = doc(db, "alunos", userId, "planosAcao", planoId);
  await updateDoc(planoRef, {
    resolvido: true,
    resolvidoEm: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
}

/**
 * Reabrir plano de ação (desmarcar como resolvido)
 */
export async function reabrirPlanoAcaoDirect(planoId: string): Promise<void> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Usuário não autenticado");

  const planoRef = doc(db, "alunos", userId, "planosAcao", planoId);
  await updateDoc(planoRef, {
    resolvido: false,
    resolvidoEm: null,
    updatedAt: Timestamp.now()
  });
}

/**
 * Deletar um plano de ação
 */
export async function deletePlanoAcaoDirect(planoId: string): Promise<void> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Usuário não autenticado");

  const planoRef = doc(db, "alunos", userId, "planosAcao", planoId);
  await deleteDoc(planoRef);
}

/**
 * Gerar conduta baseada no motivo do erro e quantidade de erros
 */
export function gerarConduta(motivoErro: "interpretacao" | "lacuna_teorica", quantidadeErros: number): string {
  const dobrar = quantidadeErros >= 3;
  
  if (motivoErro === "interpretacao") {
    const questoes = dobrar ? 10 : 5;
    return `Fazer ${questoes} questões contextualizadas para praticar o conteúdo.`;
  } else {
    const questoes = dobrar ? 20 : 10;
    return `Revisar a teoria com foco na lacuna identificada e, depois, fazer ${questoes} questões.`;
  }
}

/**
 * Criar ou atualizar planos de ação a partir de um autodiagnóstico
 * Chamado automaticamente quando um autodiagnóstico é salvo
 */
export async function criarPlanosDeAutodiagnostico(
  prova: string, 
  questoes: Array<{ macroassunto: string; microassunto: string; motivoErro: string }>
): Promise<void> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Usuário não autenticado");

  // Filtrar apenas erros por interpretação ou lacuna teórica
  const questoesRelevantes = questoes.filter(
    q => q.motivoErro === "interpretacao" || q.motivoErro === "lacuna_teorica"
  );

  if (questoesRelevantes.length === 0) return;

  // Buscar planos existentes para esta prova
  const planosRef = collection(db, "alunos", userId, "planosAcao");
  const snapshot = await getDocs(planosRef);
  const planosExistentes = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as PlanoAcao[];

  // Agrupar questões por microassunto + motivo
  const agrupados: Record<string, { macroassunto: string; microassunto: string; motivoErro: "interpretacao" | "lacuna_teorica"; count: number }> = {};
  
  questoesRelevantes.forEach(q => {
    const key = `${prova}-${q.microassunto}-${q.motivoErro}`;
    if (!agrupados[key]) {
      agrupados[key] = {
        macroassunto: q.macroassunto,
        microassunto: q.microassunto,
        motivoErro: q.motivoErro as "interpretacao" | "lacuna_teorica",
        count: 0
      };
    }
    agrupados[key].count++;
  });

  // Criar ou atualizar planos
  const batch = writeBatch(db);
  
  Object.entries(agrupados).forEach(([key, dados]) => {
    // Verificar se já existe um plano para este microassunto + motivo + prova
    const planoExistente = planosExistentes.find(
      p => p.prova === prova && 
           p.microassunto === dados.microassunto && 
           p.motivoErro === dados.motivoErro &&
           !p.resolvido
    );

    if (planoExistente && planoExistente.id) {
      // Atualizar quantidade de erros
      const novaQuantidade = planoExistente.quantidadeErros + dados.count;
      const planoRef = doc(db, "alunos", userId, "planosAcao", planoExistente.id);
      batch.update(planoRef, {
        quantidadeErros: novaQuantidade,
        conduta: gerarConduta(dados.motivoErro, novaQuantidade),
        updatedAt: Timestamp.now()
      });
    } else {
      // Criar novo plano
      const novoPlanoRef = doc(planosRef);
      batch.set(novoPlanoRef, {
        prova,
        macroassunto: dados.macroassunto,
        microassunto: dados.microassunto,
        motivoErro: dados.motivoErro,
        quantidadeErros: dados.count,
        conduta: gerarConduta(dados.motivoErro, dados.count),
        resolvido: false,
        criadoManualmente: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    }
  });

  await batch.commit();
}

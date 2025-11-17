import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

// Importar dados dos templates
const cronogramaExtensivo = require("../data/cronograma-extensivo.json");
const cronogramaIntensivo = require("../data/cronograma-intensivo.json");

/**
 * Função para inicializar templates de cronograma
 * Será chamada automaticamente quando necessário
 */
export async function initializeTemplatesIfNeeded() {
  try {
    // Verificar se templates já existem
    const extensiveRef = db.collection("templates_cronograma").doc("extensive");
    const intensiveRef = db.collection("templates_cronograma").doc("intensive");

    const [extensiveDoc, intensiveDoc] = await Promise.all([
      extensiveRef.get(),
      intensiveRef.get(),
    ]);

    const promises: Promise<any>[] = [];

    // Criar template extensivo se não existir
    if (!extensiveDoc.exists) {
      functions.logger.info("📦 Criando template extensivo...");
      promises.push(
        extensiveRef.set({
          cycles: cronogramaExtensivo,
          tipo: "extensive",
          nome: "Cronograma Extensivo",
          descricao: "Cronograma completo para preparação ao longo do ano",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })
      );
    }

    // Criar template intensivo se não existir
    if (!intensiveDoc.exists) {
      functions.logger.info("📦 Criando template intensivo...");
      promises.push(
        intensiveRef.set({
          cycles: cronogramaIntensivo,
          tipo: "intensive",
          nome: "Cronograma Intensivo",
          descricao: "Cronograma focado para preparação intensiva",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })
      );
    }

    if (promises.length > 0) {
      await Promise.all(promises);
      functions.logger.info("✅ Templates inicializados com sucesso!");
      return true;
    }

    return false; // Templates já existiam
  } catch (error: any) {
    functions.logger.error("❌ Erro ao inicializar templates:", error);
    throw error;
  }
}

/**
 * Função HTTP para forçar inicialização dos templates
 * Útil para debug e manutenção
 */
export const forceInitTemplates = functions
  .region("southamerica-east1")
  .runWith({
    memory: "512MB",
    timeoutSeconds: 60,
  })
  .https.onCall(async (data, context) => {
    try {
      // Apenas admin/mentor pode executar
      if (!context.auth) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "Você precisa estar autenticado"
        );
      }

      functions.logger.info("🔄 Forçando inicialização de templates...");

      // Sempre recriar os templates
      const extensiveRef = db.collection("templates_cronograma").doc("extensive");
      const intensiveRef = db.collection("templates_cronograma").doc("intensive");

      await Promise.all([
        extensiveRef.set({
          cycles: cronogramaExtensivo,
          tipo: "extensive",
          nome: "Cronograma Extensivo",
          descricao: "Cronograma completo para preparação ao longo do ano",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }),
        intensiveRef.set({
          cycles: cronogramaIntensivo,
          tipo: "intensive",
          nome: "Cronograma Intensivo",
          descricao: "Cronograma focado para preparação intensiva",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }),
      ]);

      functions.logger.info("✅ Templates recriados com sucesso!");

      return {
        success: true,
        message: "Templates inicializados com sucesso",
        extensiveCycles: cronogramaExtensivo.length,
        intensiveCycles: cronogramaIntensivo.length,
      };
    } catch (error: any) {
      functions.logger.error("❌ Erro ao forçar inicialização:", error);

      throw new functions.https.HttpsError(
        "internal",
        `Erro ao inicializar templates: ${error.message}`
      );
    }
  });

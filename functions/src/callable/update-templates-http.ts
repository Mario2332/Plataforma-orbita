import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

// Importar dados dos templates
const cronogramaExtensivo = require("../data/cronograma-extensivo.json");
const cronogramaIntensivo = require("../data/cronograma-intensivo.json");

/**
 * Função HTTP pública para atualizar templates
 * Acesse: https://southamerica-east1-plataforma-mentoria-mario.cloudfunctions.net/updateTemplatesNow
 */
export const updateTemplatesNow = functions
  .region("southamerica-east1")
  .runWith({
    memory: "512MB",
    timeoutSeconds: 60,
  })
  .https.onRequest(async (req, res) => {
    try {
      functions.logger.info("🔄 Iniciando atualização forçada de templates...");

      // Atualizar template extensivo
      functions.logger.info(`📝 Atualizando extensivo (${cronogramaExtensivo.length} ciclos)...`);
      await db.collection("templates_cronograma").doc("extensive").set({
        cycles: cronogramaExtensivo,
        tipo: "extensive",
        nome: "Cronograma Extensivo",
        descricao: "Cronograma completo para prepara\u00e7\u00e3o ao longo do ano",
        version: 3,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Atualizar template intensivo
      functions.logger.info(`📝 Atualizando intensivo (${cronogramaIntensivo.length} ciclos)...`);
      await db.collection("templates_cronograma").doc("intensive").set({
        cycles: cronogramaIntensivo,
        tipo: "intensive",
        nome: "Cronograma Intensivo",
        descricao: "Cronograma focado para prepara\u00e7\u00e3o intensiva",
        version: 3,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Verificar atualização
      const [extensiveDoc, intensiveDoc] = await Promise.all([
        db.collection("templates_cronograma").doc("extensive").get(),
        db.collection("templates_cronograma").doc("intensive").get(),
      ]);

      const extensiveData = extensiveDoc.data();
      const intensiveData = intensiveDoc.data();

      functions.logger.info("✅ Templates atualizados com sucesso!");

      res.status(200).json({
        success: true,
        message: "Templates atualizados com sucesso!",
        templates: {
          extensive: {
            cycles: extensiveData?.cycles.length || 0,
            version: extensiveData?.version || 0,
          },
          intensive: {
            cycles: intensiveData?.cycles.length || 0,
            version: intensiveData?.version || 0,
          },
        },
      });
    } catch (error: any) {
      functions.logger.error("❌ Erro ao atualizar templates:", error);

      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

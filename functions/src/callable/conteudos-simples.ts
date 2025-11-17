import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * Função SIMPLES para obter conteúdos
 * Retorna dados direto do Firestore sem complicações
 */
export const getConteudosSimples = functions
  .region("southamerica-east1")
  .runWith({
    memory: "256MB",
    timeoutSeconds: 30,
  })
  .https.onCall(async (data, context) => {
    try {
      functions.logger.info("🔵 getConteudosSimples chamada", { 
        materiaKey: data?.materiaKey,
        uid: context.auth?.uid 
      });

      // Verificar autenticação
      if (!context.auth) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "Você precisa estar autenticado"
        );
      }

      const { materiaKey } = data;

      if (materiaKey) {
        // Retornar apenas uma matéria
        const doc = await db.collection("conteudos_base").doc(materiaKey).get();
        
        if (!doc.exists) {
          throw new functions.https.HttpsError(
            "not-found",
            `Matéria ${materiaKey} não encontrada`
          );
        }

        const materiaData = doc.data();
        functions.logger.info("✅ Matéria carregada", { 
          materiaKey,
          topicsCount: materiaData?.topics?.length || 0
        });

        return materiaData;
      } else {
        // Retornar todas as matérias
        const snapshot = await db.collection("conteudos_base").get();
        
        const allData: Record<string, any> = {};
        snapshot.docs.forEach(doc => {
          allData[doc.id] = doc.data();
        });

        functions.logger.info("✅ Todas as matérias carregadas", {
          count: Object.keys(allData).length
        });

        return allData;
      }
    } catch (error: any) {
      functions.logger.error("❌ Erro em getConteudosSimples:", {
        message: error.message,
        code: error.code,
        stack: error.stack
      });

      // Se já for HttpsError, re-lançar
      if (error.code && error.code.startsWith('functions/')) {
        throw error;
      }

      throw new functions.https.HttpsError(
        "internal",
        `Erro ao carregar conteúdos: ${error.message}`
      );
    }
  });

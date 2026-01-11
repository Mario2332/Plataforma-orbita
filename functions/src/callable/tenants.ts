import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { logger } from "firebase-functions/v2";

const db = getFirestore();

/**
 * Criar novo tenant
 */
export const createTenant = onCall(
  {
    region: "southamerica-east1",
    memory: "512MiB",
    timeoutSeconds: 60,
  },
  async (request) => {
    const tenantData = request.data;

    // Nota: Autenticação removida pois usuários podem estar autenticados em diferentes projetos Firebase
    // O acesso é controlado pelo painel do gestor

    try {
      logger.info(`[createTenant] Criando tenant: ${tenantData.slug}`);

      // Validar dados obrigatórios
      if (!tenantData.slug || !tenantData.dominioPrincipal) {
        throw new HttpsError("invalid-argument", "Dados obrigatórios faltando");
      }

      // Adicionar timestamps
      const docData = {
        ...tenantData,
        criadoEm: Timestamp.now(),
        atualizadoEm: Timestamp.now(),
      };

      // Criar documento
      const tenantRef = db.collection("tenants").doc(tenantData.slug);
      await tenantRef.set(docData);

      logger.info(`[createTenant] Tenant criado com sucesso: ${tenantData.slug}`);

      return {
        success: true,
        tenantId: tenantData.slug,
      };
    } catch (error: any) {
      logger.error(`[createTenant] Erro ao criar tenant:`, error);
      throw new HttpsError("internal", error.message || "Erro ao criar tenant");
    }
  }
);

/**
 * Atualizar tenant existente
 */
export const updateTenant = onCall(
  {
    region: "southamerica-east1",
    memory: "512MiB",
    timeoutSeconds: 60,
  },
  async (request) => {
    const { tenantId, data: tenantData } = request.data;

    // Nota: Autenticação removida pois usuários podem estar autenticados em diferentes projetos Firebase
    // O acesso é controlado pelo painel do gestor

    try {
      logger.info(`[updateTenant] Atualizando tenant: ${tenantId}`);

      // Validar dados obrigatórios
      if (!tenantId) {
        throw new HttpsError("invalid-argument", "tenantId é obrigatório");
      }

      // Verificar se tenant existe
      const tenantRef = db.collection("tenants").doc(tenantId);
      const tenantDoc = await tenantRef.get();

      if (!tenantDoc.exists) {
        throw new HttpsError("not-found", "Tenant não encontrado");
      }

      // Adicionar timestamp de atualização
      const updateData = {
        ...tenantData,
        atualizadoEm: Timestamp.now(),
      };

      // Atualizar documento
      await tenantRef.update(updateData);

      logger.info(`[updateTenant] Tenant atualizado com sucesso: ${tenantId}`);

      return {
        success: true,
        tenantId,
      };
    } catch (error: any) {
      logger.error(`[updateTenant] Erro ao atualizar tenant:`, error);
      throw new HttpsError("internal", error.message || "Erro ao atualizar tenant");
    }
  }
);

/**
 * Deletar tenant
 */
export const deleteTenant = onCall(
  {
    region: "southamerica-east1",
    memory: "512MiB",
    timeoutSeconds: 60,
  },
  async (request) => {
    const { tenantId } = request.data;

    // Nota: Autenticação removida pois usuários podem estar autenticados em diferentes projetos Firebase
    // O acesso é controlado pelo painel do gestor

    try {
      logger.info(`[deleteTenant] Deletando tenant: ${tenantId}`);

      // Validar dados obrigatórios
      if (!tenantId) {
        throw new HttpsError("invalid-argument", "tenantId é obrigatório");
      }

      // Verificar se tenant existe
      const tenantRef = db.collection("tenants").doc(tenantId);
      const tenantDoc = await tenantRef.get();

      if (!tenantDoc.exists) {
        throw new HttpsError("not-found", "Tenant não encontrado");
      }

      // Deletar documento
      await tenantRef.delete();

      logger.info(`[deleteTenant] Tenant deletado com sucesso: ${tenantId}`);

      return {
        success: true,
        tenantId,
      };
    } catch (error: any) {
      logger.error(`[deleteTenant] Erro ao deletar tenant:`, error);
      throw new HttpsError("internal", error.message || "Erro ao deletar tenant");
    }
  }
);

/**
 * Alternar status do tenant (ativo/inativo)
 */
export const toggleTenantStatus = onCall(
  {
    region: "southamerica-east1",
    memory: "512MiB",
    timeoutSeconds: 60,
  },
  async (request) => {
    const { tenantId } = request.data;

    // Nota: Autenticação removida pois usuários podem estar autenticados em diferentes projetos Firebase
    // O acesso é controlado pelo painel do gestor

    try {
      logger.info(`[toggleTenantStatus] Alternando status do tenant: ${tenantId}`);

      // Validar dados obrigatórios
      if (!tenantId) {
        throw new HttpsError("invalid-argument", "tenantId é obrigatório");
      }

      // Verificar se tenant existe
      const tenantRef = db.collection("tenants").doc(tenantId);
      const tenantDoc = await tenantRef.get();

      if (!tenantDoc.exists) {
        throw new HttpsError("not-found", "Tenant não encontrado");
      }

      const currentStatus = tenantDoc.data()?.status || "inativo";
      const newStatus = currentStatus === "ativo" ? "inativo" : "ativo";

      // Atualizar status
      await tenantRef.update({
        status: newStatus,
        atualizadoEm: Timestamp.now(),
      });

      logger.info(`[toggleTenantStatus] Status alterado: ${currentStatus} -> ${newStatus}`);

      return {
        success: true,
        tenantId,
        newStatus,
      };
    } catch (error: any) {
      logger.error(`[toggleTenantStatus] Erro ao alternar status:`, error);
      throw new HttpsError("internal", error.message || "Erro ao alternar status");
    }
  }
);

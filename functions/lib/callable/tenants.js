"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleTenantStatus = exports.deleteTenant = exports.updateTenant = exports.createTenant = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const v2_1 = require("firebase-functions/v2");
const db = (0, firestore_1.getFirestore)();
/**
 * Criar novo tenant
 */
exports.createTenant = (0, https_1.onCall)({
    region: "southamerica-east1",
    memory: "512MiB",
    timeoutSeconds: 60,
}, async (request) => {
    const tenantData = request.data;
    // Nota: Autenticação removida pois usuários podem estar autenticados em diferentes projetos Firebase
    // O acesso é controlado pelo painel do gestor
    try {
        v2_1.logger.info(`[createTenant] Criando tenant: ${tenantData.slug}`);
        // Validar dados obrigatórios
        if (!tenantData.slug || !tenantData.dominioPrincipal) {
            throw new https_1.HttpsError("invalid-argument", "Dados obrigatórios faltando");
        }
        // Adicionar timestamps
        const docData = {
            ...tenantData,
            criadoEm: firestore_1.Timestamp.now(),
            atualizadoEm: firestore_1.Timestamp.now(),
        };
        // Criar documento
        const tenantRef = db.collection("tenants").doc(tenantData.slug);
        await tenantRef.set(docData);
        v2_1.logger.info(`[createTenant] Tenant criado com sucesso: ${tenantData.slug}`);
        return {
            success: true,
            tenantId: tenantData.slug,
        };
    }
    catch (error) {
        v2_1.logger.error(`[createTenant] Erro ao criar tenant:`, error);
        throw new https_1.HttpsError("internal", error.message || "Erro ao criar tenant");
    }
});
/**
 * Atualizar tenant existente
 */
exports.updateTenant = (0, https_1.onCall)({
    region: "southamerica-east1",
    memory: "512MiB",
    timeoutSeconds: 60,
}, async (request) => {
    const { tenantId, data: tenantData } = request.data;
    // Nota: Autenticação removida pois usuários podem estar autenticados em diferentes projetos Firebase
    // O acesso é controlado pelo painel do gestor
    try {
        v2_1.logger.info(`[updateTenant] Atualizando tenant: ${tenantId}`);
        // Validar dados obrigatórios
        if (!tenantId) {
            throw new https_1.HttpsError("invalid-argument", "tenantId é obrigatório");
        }
        // Verificar se tenant existe
        const tenantRef = db.collection("tenants").doc(tenantId);
        const tenantDoc = await tenantRef.get();
        if (!tenantDoc.exists) {
            throw new https_1.HttpsError("not-found", "Tenant não encontrado");
        }
        // Adicionar timestamp de atualização
        const updateData = {
            ...tenantData,
            atualizadoEm: firestore_1.Timestamp.now(),
        };
        // Atualizar documento
        await tenantRef.update(updateData);
        v2_1.logger.info(`[updateTenant] Tenant atualizado com sucesso: ${tenantId}`);
        return {
            success: true,
            tenantId,
        };
    }
    catch (error) {
        v2_1.logger.error(`[updateTenant] Erro ao atualizar tenant:`, error);
        throw new https_1.HttpsError("internal", error.message || "Erro ao atualizar tenant");
    }
});
/**
 * Deletar tenant
 */
exports.deleteTenant = (0, https_1.onCall)({
    region: "southamerica-east1",
    memory: "512MiB",
    timeoutSeconds: 60,
}, async (request) => {
    const { tenantId } = request.data;
    // Nota: Autenticação removida pois usuários podem estar autenticados em diferentes projetos Firebase
    // O acesso é controlado pelo painel do gestor
    try {
        v2_1.logger.info(`[deleteTenant] Deletando tenant: ${tenantId}`);
        // Validar dados obrigatórios
        if (!tenantId) {
            throw new https_1.HttpsError("invalid-argument", "tenantId é obrigatório");
        }
        // Verificar se tenant existe
        const tenantRef = db.collection("tenants").doc(tenantId);
        const tenantDoc = await tenantRef.get();
        if (!tenantDoc.exists) {
            throw new https_1.HttpsError("not-found", "Tenant não encontrado");
        }
        // Deletar documento
        await tenantRef.delete();
        v2_1.logger.info(`[deleteTenant] Tenant deletado com sucesso: ${tenantId}`);
        return {
            success: true,
            tenantId,
        };
    }
    catch (error) {
        v2_1.logger.error(`[deleteTenant] Erro ao deletar tenant:`, error);
        throw new https_1.HttpsError("internal", error.message || "Erro ao deletar tenant");
    }
});
/**
 * Alternar status do tenant (ativo/inativo)
 */
exports.toggleTenantStatus = (0, https_1.onCall)({
    region: "southamerica-east1",
    memory: "512MiB",
    timeoutSeconds: 60,
}, async (request) => {
    const { tenantId } = request.data;
    // Nota: Autenticação removida pois usuários podem estar autenticados em diferentes projetos Firebase
    // O acesso é controlado pelo painel do gestor
    try {
        v2_1.logger.info(`[toggleTenantStatus] Alternando status do tenant: ${tenantId}`);
        // Validar dados obrigatórios
        if (!tenantId) {
            throw new https_1.HttpsError("invalid-argument", "tenantId é obrigatório");
        }
        // Verificar se tenant existe
        const tenantRef = db.collection("tenants").doc(tenantId);
        const tenantDoc = await tenantRef.get();
        if (!tenantDoc.exists) {
            throw new https_1.HttpsError("not-found", "Tenant não encontrado");
        }
        const currentStatus = tenantDoc.data()?.status || "inativo";
        const newStatus = currentStatus === "ativo" ? "inativo" : "ativo";
        // Atualizar status
        await tenantRef.update({
            status: newStatus,
            atualizadoEm: firestore_1.Timestamp.now(),
        });
        v2_1.logger.info(`[toggleTenantStatus] Status alterado: ${currentStatus} -> ${newStatus}`);
        return {
            success: true,
            tenantId,
            newStatus,
        };
    }
    catch (error) {
        v2_1.logger.error(`[toggleTenantStatus] Erro ao alternar status:`, error);
        throw new https_1.HttpsError("internal", error.message || "Erro ao alternar status");
    }
});
//# sourceMappingURL=tenants.js.map
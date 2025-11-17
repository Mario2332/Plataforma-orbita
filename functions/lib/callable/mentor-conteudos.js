"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTopico = exports.updateTopico = exports.createTopico = exports.getConteudos = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const auth_1 = require("../utils/auth");
const studyData = require("../study-content-data.json");
const db = admin.firestore();
// Mapeamento de incidência texto → valor
const INCIDENCE_MAP = {
    "Muito alta!": 0.05,
    "Alta!": 0.04,
    "Média": 0.03,
    "Baixa": 0.02,
    "Muito baixa": 0.01,
};
/**
 * Obter conteúdos mesclados (JSON base + customizações)
 * Disponível para alunos e mentores
 */
exports.getConteudos = functions
    .region("southamerica-east1")
    .https.onCall(async (data, context) => {
    functions.logger.info("🔵 getConteudos chamada", {
        data,
        hasAuth: !!context.auth,
        uid: context.auth?.uid
    });
    const auth = await (0, auth_1.getAuthContext)(context);
    functions.logger.info("✅ Auth OK", { uid: auth.uid, role: auth.role });
    const { materiaKey } = data;
    try {
        // Carregar dados base do JSON
        const baseData = JSON.parse(JSON.stringify(studyData));
        if (materiaKey) {
            // Retornar apenas uma matéria
            if (!baseData[materiaKey]) {
                throw new functions.https.HttpsError("not-found", "Matéria não encontrada");
            }
            const materia = baseData[materiaKey];
            const topics = materia.topics || [];
            // Buscar customizações do Firestore
            const customizacoesSnapshot = await db
                .collection("conteudos_customizados")
                .doc(materiaKey)
                .collection("topicos")
                .get();
            // Criar mapa de customizações
            const customMap = {};
            customizacoesSnapshot.docs.forEach((doc) => {
                const data = doc.data();
                customMap[data.id] = data;
            });
            // Mesclar tópicos
            let mergedTopics = topics.map((topic) => {
                if (customMap[topic.id]) {
                    const custom = customMap[topic.id];
                    if (custom.isDeleted) {
                        return null; // Marcar para remoção
                    }
                    // Sobrescrever com dados customizados
                    return {
                        ...topic,
                        name: custom.name,
                        incidenceLevel: custom.incidenceLevel,
                        incidenceValue: custom.incidenceValue,
                    };
                }
                return topic;
            }).filter((t) => t !== null); // Remover deletados
            // Adicionar tópicos customizados novos
            Object.values(customMap).forEach((custom) => {
                if (custom.isCustom && !custom.isDeleted) {
                    mergedTopics.push({
                        id: custom.id,
                        name: custom.name,
                        incidenceLevel: custom.incidenceLevel,
                        incidenceValue: custom.incidenceValue,
                    });
                }
            });
            return {
                ...materia,
                topics: mergedTopics,
            };
        }
        else {
            // Retornar todas as matérias (para painel geral)
            const allMaterias = {};
            for (const [key, materia] of Object.entries(baseData)) {
                const materiaData = materia;
                const topics = materiaData.topics || [];
                // Buscar customizações
                const customizacoesSnapshot = await db
                    .collection("conteudos_customizados")
                    .doc(key)
                    .collection("topicos")
                    .get();
                const customMap = {};
                customizacoesSnapshot.docs.forEach((doc) => {
                    const data = doc.data();
                    customMap[data.id] = data;
                });
                // Mesclar
                let mergedTopics = topics.map((topic) => {
                    if (customMap[topic.id]) {
                        const custom = customMap[topic.id];
                        if (custom.isDeleted)
                            return null;
                        return {
                            ...topic,
                            name: custom.name,
                            incidenceLevel: custom.incidenceLevel,
                            incidenceValue: custom.incidenceValue,
                        };
                    }
                    return topic;
                }).filter((t) => t !== null);
                Object.values(customMap).forEach((custom) => {
                    if (custom.isCustom && !custom.isDeleted) {
                        mergedTopics.push({
                            id: custom.id,
                            name: custom.name,
                            incidenceLevel: custom.incidenceLevel,
                            incidenceValue: custom.incidenceValue,
                        });
                    }
                });
                allMaterias[key] = {
                    ...materiaData,
                    topics: mergedTopics,
                };
            }
            return allMaterias;
        }
    }
    catch (error) {
        functions.logger.error("❌ Erro em getConteudos:", {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        throw new functions.https.HttpsError("internal", error.message);
    }
});
/**
 * Criar novo tópico (mentor)
 */
exports.createTopico = functions
    .region("southamerica-east1")
    .https.onCall(async (data, context) => {
    const auth = await (0, auth_1.getAuthContext)(context);
    (0, auth_1.requireRole)(auth, "mentor");
    const { materiaKey, name, incidenceLevel } = data;
    if (!materiaKey || !name || !incidenceLevel) {
        throw new functions.https.HttpsError("invalid-argument", "Matéria, nome e nível de incidência são obrigatórios");
    }
    if (!INCIDENCE_MAP[incidenceLevel]) {
        throw new functions.https.HttpsError("invalid-argument", "Nível de incidência inválido");
    }
    try {
        // Gerar ID único
        const topicoId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const topicoData = {
            id: topicoId,
            name,
            incidenceLevel,
            incidenceValue: INCIDENCE_MAP[incidenceLevel],
            isCustom: true,
            isDeleted: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        await db
            .collection("conteudos_customizados")
            .doc(materiaKey)
            .collection("topicos")
            .doc(topicoId)
            .set(topicoData);
        return { success: true, topicoId };
    }
    catch (error) {
        functions.logger.error("Erro ao criar tópico:", error);
        throw new functions.https.HttpsError("internal", error.message);
    }
});
/**
 * Atualizar tópico existente (mentor)
 */
exports.updateTopico = functions
    .region("southamerica-east1")
    .https.onCall(async (data, context) => {
    const auth = await (0, auth_1.getAuthContext)(context);
    (0, auth_1.requireRole)(auth, "mentor");
    const { materiaKey, topicoId, name, incidenceLevel } = data;
    if (!materiaKey || !topicoId) {
        throw new functions.https.HttpsError("invalid-argument", "Matéria e ID do tópico são obrigatórios");
    }
    if (incidenceLevel && !INCIDENCE_MAP[incidenceLevel]) {
        throw new functions.https.HttpsError("invalid-argument", "Nível de incidência inválido");
    }
    try {
        const topicoRef = db
            .collection("conteudos_customizados")
            .doc(materiaKey)
            .collection("topicos")
            .doc(topicoId);
        const topicoDoc = await topicoRef.get();
        const updates = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        if (name !== undefined)
            updates.name = name;
        if (incidenceLevel !== undefined) {
            updates.incidenceLevel = incidenceLevel;
            updates.incidenceValue = INCIDENCE_MAP[incidenceLevel];
        }
        if (topicoDoc.exists) {
            // Atualizar existente
            await topicoRef.update(updates);
        }
        else {
            // Criar novo (caso seja do JSON base sendo editado pela primeira vez)
            await topicoRef.set({
                id: topicoId,
                ...updates,
                isCustom: false,
                isDeleted: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        return { success: true };
    }
    catch (error) {
        functions.logger.error("Erro ao atualizar tópico:", error);
        throw new functions.https.HttpsError("internal", error.message);
    }
});
/**
 * Deletar tópico (soft delete - mentor)
 */
exports.deleteTopico = functions
    .region("southamerica-east1")
    .https.onCall(async (data, context) => {
    const auth = await (0, auth_1.getAuthContext)(context);
    (0, auth_1.requireRole)(auth, "mentor");
    const { materiaKey, topicoId } = data;
    if (!materiaKey || !topicoId) {
        throw new functions.https.HttpsError("invalid-argument", "Matéria e ID do tópico são obrigatórios");
    }
    try {
        const topicoRef = db
            .collection("conteudos_customizados")
            .doc(materiaKey)
            .collection("topicos")
            .doc(topicoId);
        const topicoDoc = await topicoRef.get();
        if (topicoDoc.exists) {
            // Atualizar existente para deletado
            await topicoRef.update({
                isDeleted: true,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        else {
            // Criar registro de deleção (para tópicos do JSON base)
            await topicoRef.set({
                id: topicoId,
                isDeleted: true,
                isCustom: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        return { success: true };
    }
    catch (error) {
        functions.logger.error("Erro ao deletar tópico:", error);
        throw new functions.https.HttpsError("internal", error.message);
    }
});
//# sourceMappingURL=mentor-conteudos.js.map
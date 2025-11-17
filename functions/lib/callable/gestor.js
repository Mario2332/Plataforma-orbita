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
exports.gestorFunctions = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const auth_1 = require("../utils/auth");
const db = admin.firestore();
/**
 * Obter dados do gestor logado
 */
const getMe = functions
    .region("southamerica-east1")
    .https.onCall(async (data, context) => {
    const auth = await (0, auth_1.getAuthContext)(context);
    (0, auth_1.requireRole)(auth, "gestor");
    const gestorDoc = await db.collection("gestores").doc(auth.uid).get();
    if (!gestorDoc.exists) {
        // Criar gestor automaticamente se não existir
        await db.collection("gestores").doc(auth.uid).set({
            userId: auth.uid,
            nome: auth.email.split("@")[0],
            email: auth.email,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        const newGestorDoc = await db.collection("gestores").doc(auth.uid).get();
        return { id: newGestorDoc.id, ...newGestorDoc.data() };
    }
    return { id: gestorDoc.id, ...gestorDoc.data() };
});
/**
 * Obter total de alunos na plataforma
 */
const getTotalAlunos = functions
    .region("southamerica-east1")
    .https.onCall(async (data, context) => {
    const auth = await (0, auth_1.getAuthContext)(context);
    (0, auth_1.requireRole)(auth, "gestor");
    const alunosSnapshot = await db.collection("alunos").count().get();
    return alunosSnapshot.data().count;
});
/**
 * Listar todos os mentores
 */
const getMentores = functions
    .region("southamerica-east1")
    .https.onCall(async (data, context) => {
    const auth = await (0, auth_1.getAuthContext)(context);
    (0, auth_1.requireRole)(auth, "gestor");
    const mentoresSnapshot = await db.collection("mentores").get();
    return mentoresSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
});
/**
 * Criar novo mentor
 */
const createMentor = functions
    .region("southamerica-east1")
    .https.onCall(async (data, context) => {
    const auth = await (0, auth_1.getAuthContext)(context);
    (0, auth_1.requireRole)(auth, "gestor");
    const { email, password, nome, nomePlataforma, logoUrl, corPrincipal } = data;
    if (!email || !password || !nome || !nomePlataforma) {
        throw new functions.https.HttpsError("invalid-argument", "Email, senha, nome e nome da plataforma são obrigatórios");
    }
    try {
        // Criar usuário no Firebase Auth
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: nome,
        });
        // Criar documento do usuário
        await db.collection("users").doc(userRecord.uid).set({
            uid: userRecord.uid,
            email,
            name: nome,
            role: "mentor",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            lastSignedIn: admin.firestore.FieldValue.serverTimestamp(),
        });
        // Criar documento do mentor
        await db.collection("mentores").doc(userRecord.uid).set({
            userId: userRecord.uid,
            gestorId: auth.uid,
            nome,
            email,
            nomePlataforma,
            logoUrl: logoUrl || null,
            corPrincipal: corPrincipal || "#3b82f6",
            ativo: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return { success: true, mentorId: userRecord.uid };
    }
    catch (error) {
        functions.logger.error("Erro ao criar mentor:", error);
        throw new functions.https.HttpsError("internal", error.message);
    }
});
/**
 * Atualizar dados do mentor
 */
const updateMentor = functions
    .region("southamerica-east1")
    .https.onCall(async (data, context) => {
    const auth = await (0, auth_1.getAuthContext)(context);
    (0, auth_1.requireRole)(auth, "gestor");
    const { mentorId, nome, email, nomePlataforma, logoUrl, corPrincipal, ativo } = data;
    if (!mentorId) {
        throw new functions.https.HttpsError("invalid-argument", "ID do mentor é obrigatório");
    }
    try {
        const updates = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        if (nome !== undefined)
            updates.nome = nome;
        if (email !== undefined)
            updates.email = email;
        if (nomePlataforma !== undefined)
            updates.nomePlataforma = nomePlataforma;
        if (logoUrl !== undefined)
            updates.logoUrl = logoUrl;
        if (corPrincipal !== undefined)
            updates.corPrincipal = corPrincipal;
        if (ativo !== undefined)
            updates.ativo = ativo;
        await db.collection("mentores").doc(mentorId).update(updates);
        // Atualizar email no Firebase Auth se necessário
        if (email !== undefined) {
            await admin.auth().updateUser(mentorId, { email });
        }
        // Atualizar nome no documento users
        if (nome !== undefined) {
            await db.collection("users").doc(mentorId).update({
                name: nome,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        return { success: true };
    }
    catch (error) {
        functions.logger.error("Erro ao atualizar mentor:", error);
        throw new functions.https.HttpsError("internal", error.message);
    }
});
/**
 * Deletar mentor
 */
const deleteMentor = functions
    .region("southamerica-east1")
    .https.onCall(async (data, context) => {
    const auth = await (0, auth_1.getAuthContext)(context);
    (0, auth_1.requireRole)(auth, "gestor");
    const { mentorId } = data;
    if (!mentorId) {
        throw new functions.https.HttpsError("invalid-argument", "ID do mentor é obrigatório");
    }
    try {
        // Deletar documento do mentor
        await db.collection("mentores").doc(mentorId).delete();
        // Deletar documento do usuário
        await db.collection("users").doc(mentorId).delete();
        // Deletar usuário do Firebase Auth
        await admin.auth().deleteUser(mentorId);
        return { success: true };
    }
    catch (error) {
        functions.logger.error("Erro ao deletar mentor:", error);
        throw new functions.https.HttpsError("internal", error.message);
    }
});
/**
 * Listar todos os alunos da plataforma
 */
const getAllAlunos = functions
    .region("southamerica-east1")
    .https.onCall(async (data, context) => {
    const auth = await (0, auth_1.getAuthContext)(context);
    (0, auth_1.requireRole)(auth, "gestor");
    const alunosSnapshot = await db.collection("alunos").get();
    return alunosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
});
/**
 * Atualizar dados de qualquer aluno
 */
const updateAluno = functions
    .region("southamerica-east1")
    .https.onCall(async (data, context) => {
    const auth = await (0, auth_1.getAuthContext)(context);
    (0, auth_1.requireRole)(auth, "gestor");
    const { alunoId, nome, email, celular, plano, ativo, mentorId } = data;
    if (!alunoId) {
        throw new functions.https.HttpsError("invalid-argument", "ID do aluno é obrigatório");
    }
    try {
        const updates = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        if (nome !== undefined)
            updates.nome = nome;
        if (email !== undefined)
            updates.email = email;
        if (celular !== undefined)
            updates.celular = celular;
        if (plano !== undefined)
            updates.plano = plano;
        if (ativo !== undefined)
            updates.ativo = ativo;
        if (mentorId !== undefined)
            updates.mentorId = mentorId;
        await db.collection("alunos").doc(alunoId).update(updates);
        // Atualizar email no Firebase Auth se necessário
        if (email !== undefined) {
            await admin.auth().updateUser(alunoId, { email });
        }
        // Atualizar nome no documento users
        if (nome !== undefined) {
            await db.collection("users").doc(alunoId).update({
                name: nome,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        return { success: true };
    }
    catch (error) {
        functions.logger.error("Erro ao atualizar aluno:", error);
        throw new functions.https.HttpsError("internal", error.message);
    }
});
/**
 * Deletar aluno
 */
const deleteAluno = functions
    .region("southamerica-east1")
    .https.onCall(async (data, context) => {
    const auth = await (0, auth_1.getAuthContext)(context);
    (0, auth_1.requireRole)(auth, "gestor");
    const { alunoId } = data;
    if (!alunoId) {
        throw new functions.https.HttpsError("invalid-argument", "ID do aluno é obrigatório");
    }
    try {
        // Deletar documento do aluno
        await db.collection("alunos").doc(alunoId).delete();
        // Deletar documento do usuário
        await db.collection("users").doc(alunoId).delete();
        // Deletar usuário do Firebase Auth
        await admin.auth().deleteUser(alunoId);
        return { success: true };
    }
    catch (error) {
        functions.logger.error("Erro ao deletar aluno:", error);
        throw new functions.https.HttpsError("internal", error.message);
    }
});
// Exportar todas as funções do gestor
exports.gestorFunctions = {
    getMe,
    getTotalAlunos,
    getMentores,
    createMentor,
    updateMentor,
    deleteMentor,
    getAllAlunos,
    updateAluno,
    deleteAluno,
};
//# sourceMappingURL=gestor.js.map
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
exports.deleteProfilePhoto = exports.uploadProfilePhoto = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
const bucket = admin.storage().bucket();
/**
 * Função para fazer upload de foto de perfil
 * Recebe a imagem em base64 e salva no Storage
 */
exports.uploadProfilePhoto = functions
    .region("southamerica-east1")
    .runWith({
    memory: "512MB",
    timeoutSeconds: 60,
})
    .https.onCall(async (data, context) => {
    // Verificar autenticação
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Usuário não autenticado");
    }
    const uid = context.auth.uid;
    const { imageData } = data;
    if (!imageData) {
        throw new functions.https.HttpsError("invalid-argument", "Imagem não fornecida");
    }
    try {
        functions.logger.info(`📸 Upload de foto de perfil para usuário ${uid}`);
        // Extrair tipo de imagem e dados base64
        const matches = imageData.match(/^data:image\/([a-zA-Z]*);base64,(.*)$/);
        if (!matches || matches.length !== 3) {
            throw new functions.https.HttpsError("invalid-argument", "Formato de imagem inválido");
        }
        const imageType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, "base64");
        // Validar tamanho (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (buffer.length > maxSize) {
            throw new functions.https.HttpsError("invalid-argument", "Imagem muito grande. Tamanho máximo: 5MB");
        }
        // Validar tipo de imagem
        const allowedTypes = ["jpeg", "jpg", "png", "webp"];
        if (!allowedTypes.includes(imageType.toLowerCase())) {
            throw new functions.https.HttpsError("invalid-argument", "Tipo de imagem não suportado. Use JPEG, PNG ou WebP");
        }
        // Deletar foto antiga se existir
        const userDoc = await db.collection("users").doc(uid).get();
        const userData = userDoc.data();
        if (userData?.photoURL) {
            try {
                // Extrair caminho do arquivo da URL
                const oldPhotoPath = `profile-photos/${uid}.${imageType}`;
                const oldFile = bucket.file(oldPhotoPath);
                await oldFile.delete();
                functions.logger.info(`🗑️ Foto antiga deletada: ${oldPhotoPath}`);
            }
            catch (error) {
                // Ignorar erro se arquivo não existir
                functions.logger.warn("Erro ao deletar foto antiga (pode não existir):", error);
            }
        }
        // Nome do arquivo
        const fileName = `profile-photos/${uid}.${imageType}`;
        const file = bucket.file(fileName);
        // Fazer upload
        await file.save(buffer, {
            metadata: {
                contentType: `image/${imageType}`,
                metadata: {
                    firebaseStorageDownloadTokens: uid, // Token para acesso público
                },
            },
        });
        functions.logger.info(`✅ Upload concluído: ${fileName}`);
        // Tornar arquivo público
        await file.makePublic();
        // Obter URL pública
        const photoURL = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        // Atualizar perfil do usuário
        await db.collection("users").doc(uid).update({
            photoURL,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        functions.logger.info(`✅ Perfil atualizado com nova foto`);
        functions.logger.info(`🔗 photoURL salvo no Firestore: ${photoURL}`);
        return {
            success: true,
            photoURL,
        };
    }
    catch (error) {
        functions.logger.error("❌ Erro no upload de foto:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Erro ao fazer upload da foto: " + error.message);
    }
});
/**
 * Função para deletar foto de perfil
 */
exports.deleteProfilePhoto = functions
    .region("southamerica-east1")
    .https.onCall(async (data, context) => {
    // Verificar autenticação
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Usuário não autenticado");
    }
    const uid = context.auth.uid;
    try {
        functions.logger.info(`🗑️ Deletando foto de perfil do usuário ${uid}`);
        // Buscar URL da foto atual
        const userDoc = await db.collection("users").doc(uid).get();
        const userData = userDoc.data();
        if (!userData?.photoURL) {
            throw new functions.https.HttpsError("not-found", "Usuário não possui foto de perfil");
        }
        // Deletar arquivo do Storage
        // Tentar deletar com diferentes extensões
        const extensions = ["jpg", "jpeg", "png", "webp"];
        let deleted = false;
        for (const ext of extensions) {
            try {
                const filePath = `profile-photos/${uid}.${ext}`;
                const file = bucket.file(filePath);
                await file.delete();
                functions.logger.info(`✅ Foto deletada: ${filePath}`);
                deleted = true;
                break;
            }
            catch (error) {
                // Continuar tentando outras extensões
            }
        }
        if (!deleted) {
            functions.logger.warn("⚠️ Arquivo de foto não encontrado no Storage");
        }
        // Remover URL do perfil
        await db.collection("users").doc(uid).update({
            photoURL: admin.firestore.FieldValue.delete(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        functions.logger.info(`✅ Foto removida do perfil`);
        return {
            success: true,
        };
    }
    catch (error) {
        functions.logger.error("❌ Erro ao deletar foto:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Erro ao deletar foto: " + error.message);
    }
});
//# sourceMappingURL=upload-profile-photo.js.map
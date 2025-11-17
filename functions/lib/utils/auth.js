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
exports.getAuthContext = getAuthContext;
exports.requireRole = requireRole;
exports.requireAnyRole = requireAnyRole;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
/**
 * Verifica se o usuário está autenticado e retorna seus dados
 */
async function getAuthContext(context) {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Usuário não autenticado");
    }
    const db = admin.firestore();
    const userDoc = await db.collection("users").doc(context.auth.uid).get();
    if (!userDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Dados do usuário não encontrados");
    }
    const userData = userDoc.data();
    return {
        uid: context.auth.uid,
        email: userData.email,
        role: userData.role,
    };
}
/**
 * Verifica se o usuário tem a role especificada
 */
function requireRole(authContext, requiredRole) {
    if (authContext.role !== requiredRole) {
        throw new functions.https.HttpsError("permission-denied", `Acesso negado. Role necessária: ${requiredRole}`);
    }
}
/**
 * Verifica se o usuário tem uma das roles especificadas
 */
function requireAnyRole(authContext, requiredRoles) {
    if (!requiredRoles.includes(authContext.role)) {
        throw new functions.https.HttpsError("permission-denied", `Acesso negado. Roles aceitas: ${requiredRoles.join(", ")}`);
    }
}
//# sourceMappingURL=auth.js.map
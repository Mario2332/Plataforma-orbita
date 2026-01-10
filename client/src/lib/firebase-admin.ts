import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { 
  initializeFirestore, 
  persistentLocalCache,
  persistentMultipleTabManager,
  CACHE_SIZE_UNLIMITED,
  Firestore
} from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getFunctions, Functions } from "firebase/functions";

/**
 * Configuração do Firebase - Plataforma Órbita (Master/Admin)
 * Este projeto é usado para:
 * - Gestão de tenants/clientes white-label
 * - Painel do gestor
 * - Configurações centralizadas
 * - Cloud Functions de administração
 */
const firebaseAdminConfig = {
  apiKey: "AIzaSyDWHQPmhVx7pVQyxWLa-4Lp2FjyiWHfSAU",
  authDomain: "plataforma-orbita.firebaseapp.com",
  projectId: "plataforma-orbita",
  storageBucket: "plataforma-orbita.firebasestorage.app",
  messagingSenderId: "679876847361",
  appId: "1:679876847361:web:d9a7b0c3e8f4a5b6c7d8e9"
};

// Exportar informações do projeto admin
export const adminProjectId = firebaseAdminConfig.projectId;
export const isAdminProject = true;

// Inicializar Firebase Admin App com nome único
export const adminApp: FirebaseApp = initializeApp(firebaseAdminConfig, 'admin');

// Inicializar Auth para admin
export const adminAuth: Auth = getAuth(adminApp);

// Inicializar Firestore para admin com persistência de cache
export const adminDb: Firestore = initializeFirestore(adminApp, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
    cacheSizeBytes: CACHE_SIZE_UNLIMITED
  })
});

// Inicializar Storage para admin
export const adminStorage: FirebaseStorage = getStorage(adminApp);

// Inicializar Functions para admin (região São Paulo)
export const adminFunctions: Functions = getFunctions(adminApp, 'southamerica-east1');

/**
 * Pré-aquecer a conexão do Firestore Admin
 */
export async function warmupAdminFirestoreConnection(): Promise<void> {
  try {
    const { doc, getDoc } = await import("firebase/firestore");
    const userId = adminAuth.currentUser?.uid;
    if (userId) {
      const userDocRef = doc(adminDb, "users", userId);
      await getDoc(userDocRef);
      console.log('[Firebase Admin] Conexão Firestore pré-aquecida');
    }
  } catch (error) {
    console.warn('[Firebase Admin] Erro ao pré-aquecer conexão:', error);
  }
}

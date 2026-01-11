import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, userData } = useAuthContext();
  const isAuthenticated = !!user;
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated && userData) {
      // Redirecionar baseado no role do usuário
      switch (userData.role) {
        case "aluno":
          setLocation("/aluno");
          break;
        case "escola":
          setLocation("/escola");
          break;
        case "gestor":
          setLocation("/gestor");
          break;
        default:
          // Se não tiver role definido, manter na home
          break;
      }
    }
  }, [loading, isAuthenticated, userData, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se não estiver autenticado, mostrar página de boas-vindas
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-md w-full mx-auto p-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="text-center space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Plataforma Órbita
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Sistema de Gestão de Estudos para o ENEM
            </p>
            <div className="pt-4">
              <Button
                onClick={() => setLocation("/login/aluno")}
                size="lg"
                className="w-full"
              >
                Entrar na Plataforma
              </Button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Faça login para acessar seu dashboard
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fallback: se estiver autenticado mas não redirecionou
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
}

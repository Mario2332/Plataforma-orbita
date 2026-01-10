import { useAuthContext } from "@/contexts/AuthContext";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useTenant } from "@/contexts/TenantContext";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";
import TopNavbar from "./layout/TopNavbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved || "light";
  });
  const { loading, user, userData } = useAuthContext();
  const { tenant, isFreePlan } = useTenant();
  const [, navigate] = useLocation();
  
  // Usar branding do tenant ou fallback para constantes
  const logoUrl = tenant?.branding?.logo || APP_LOGO;
  const appTitle = tenant?.branding?.nomeExibicao || APP_TITLE;
  
  console.log('[DashboardLayout] Estado atual:', {
    loading,
    hasUser: !!user,
    hasUserData: !!userData,
    role: userData?.role,
    willShowSkeleton: loading || !userData?.role
  });
  
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  if (loading) {
    return <DashboardLayoutSkeleton />
  }

  // Lógica de Redirecionamento:
  // 1. Se não estiver logado E NÃO for o plano Free, redireciona para o login.
  // 2. Se for o plano Free, permite o acesso para visualização (o bloqueio de escrita será feito nos componentes).
  // 3. Se estiver logado, prossegue.
  const shouldRedirectToLogin = !user && !isFreePlan;

  if (shouldRedirectToLogin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-emerald-500 rounded-lg blur-none opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative">
                <img
                  src={logoUrl}
                  alt={appTitle}
                  className="h-24 w-24 rounded-lg object-cover shadow-sm border-4 border-white dark:border-gray-800"
                />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white bg-clip-text text-transparent">{appTitle}</h1>
              <p className="text-sm font-semibold text-muted-foreground">
                Faça login para continuar
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              navigate(getLoginUrl(userData?.role));
            }}
            className="w-full"
          >
            Fazer Login
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              navigate("/cadastro");
            }}
            className="w-full"
          >
            Criar Conta
          </Button>
        </div>
      </div>
    );
  }

  // Se estiver logado, mas sem dados de usuário (role), mostra o skeleton ou redireciona para o onboarding/configuração
  if (user && !userData?.role) {
    return <DashboardLayoutSkeleton />
  }

  // Se não estiver logado E for Free Plan, o userData será null, então o role também.
  // Para o Free Plan, precisamos de um role default para que o menu seja renderizado.
  const userRole = userData?.role || (isFreePlan ? 'aluno' : undefined);

  if (!userRole) {
    // Caso de fallback, não deve acontecer se a lógica acima estiver correta
    return <DashboardLayoutSkeleton />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/20 dark:from-gray-950 dark:via-emerald-950/10 dark:to-teal-950/10">
      <TopNavbar theme={theme} toggleTheme={toggleTheme} />
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}

import { lazy, Suspense, ComponentType } from "react";

// Função helper para retry de lazy loading com tratamento de erro
const lazyWithRetry = <T extends ComponentType<any>>(componentImport: () => Promise<{ default: T }>) => {
  return lazy(() => {
    return new Promise<{ default: T }>((resolve, reject) => {
      const hasRefreshed = JSON.parse(
        window.sessionStorage.getItem('retry-lazy-refreshed') || 'false'
      );

      // Tentar carregar o componente
      componentImport()
        .then((component) => {
          window.sessionStorage.setItem('retry-lazy-refreshed', 'false');
          resolve(component);
        })
        .catch((error) => {
          if (!hasRefreshed) {
            // Se for erro de chunk loading, tentar recarregar a página uma vez
            window.sessionStorage.setItem('retry-lazy-refreshed', 'true');
            console.warn('⚠️ Erro ao carregar módulo, recarregando página...', error);
            return window.location.reload();
          }
          // Se já tentou recarregar, rejeitar com o erro
          reject(error);
        });
    });
  });
};
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TenantProvider } from "./contexts/TenantContext";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import DashboardLayout from "./components/DashboardLayout";

// Lazy load de páginas de autenticação
const LoginAluno = lazy(() => import("./pages/auth/LoginAluno"));
const LoginEscola = lazy(() => import("./pages/auth/LoginEscola"));
const LoginGestor = lazy(() => import("./pages/auth/LoginGestor"));

// Lazy load de páginas do Aluno
const AlunoHome = lazy(() => import("./pages/aluno/AlunoHome"));
const AlunoEstudos = lazy(() => import("./pages/aluno/AlunoEstudos"));
const AlunoSimulados = lazy(() => import("./pages/aluno/AlunoSimulados"));
const AlunoRedacoes = lazy(() => import("./pages/aluno/AlunoRedacoes"));
const AlunoMetricas = lazy(() => import("./pages/aluno/AlunoMetricas"));
const CronogramaWrapper = lazyWithRetry(() => import("./pages/aluno/CronogramaWrapper"));
const AlunoConfiguracoes = lazyWithRetry(() => import("./pages/aluno/AlunoConfiguracoes"));
const AlunoDiario = lazyWithRetry(() => import("./pages/aluno/AlunoDiario"));
const AlunoMetas = lazyWithRetry(() => import("./pages/aluno/AlunoMetas"));
const PainelGeral = lazy(() => import("./pages/aluno/conteudos/PainelGeral"));
const Matematica = lazy(() => import("./pages/aluno/conteudos/Matematica"));
const Biologia = lazy(() => import("./pages/aluno/conteudos/Biologia"));
const Fisica = lazy(() => import("./pages/aluno/conteudos/Fisica"));
const Quimica = lazy(() => import("./pages/aluno/conteudos/Quimica"));
const Historia = lazy(() => import("./pages/aluno/conteudos/Historia"));
const Geografia = lazy(() => import("./pages/aluno/conteudos/Geografia"));
const Linguagens = lazy(() => import("./pages/aluno/conteudos/Linguagens"));
const Filosofia = lazy(() => import("./pages/aluno/conteudos/Filosofia"));
const Sociologia = lazy(() => import("./pages/aluno/conteudos/Sociologia"));

// Lazy load de páginas do Escola
const EscolaHome = lazy(() => import("./pages/escola/EscolaHome"));
const EscolaAlunos = lazy(() => import("./pages/escola/EscolaAlunos"));
const EscolaConfiguracoes = lazy(() => import("./pages/escola/EscolaConfiguracoes"));
const EscolaViewAluno = lazy(() => import("./pages/escola/EscolaViewAluno"));
const EscolaPainelGeral = lazy(() => import("./pages/escola/conteudos/EscolaPainelGeral"));
const EscolaMatematica = lazy(() => import("./pages/escola/conteudos/Matematica"));
const EscolaBiologia = lazy(() => import("./pages/escola/conteudos/Biologia"));
const EscolaFisica = lazy(() => import("./pages/escola/conteudos/Fisica"));
const EscolaQuimica = lazy(() => import("./pages/escola/conteudos/Quimica"));
const EscolaHistoria = lazy(() => import("./pages/escola/conteudos/Historia"));
const EscolaGeografia = lazy(() => import("./pages/escola/conteudos/Geografia"));
const EscolaLinguagens = lazy(() => import("./pages/escola/conteudos/Linguagens"));
const EscolaFilosofia = lazy(() => import("./pages/escola/conteudos/Filosofia"));
const EscolaSociologia = lazy(() => import("./pages/escola/conteudos/Sociologia"));
const EscolaDiagnosticoPerfil = lazy(() => import("./pages/escola/EscolaDiagnosticoPerfil"));

// Lazy load de páginas do Gestor
const GestorHome = lazy(() => import("./pages/gestor/GestorHome"));
const GestorEscolas = lazy(() => import("./pages/gestor/GestorEscolas"));
const GestorAlunos = lazy(() => import("./pages/gestor/GestorAlunos"));
const GestorConfiguracoes = lazy(() => import("./pages/gestor/GestorConfiguracoes"));
const GestorMensagens = lazy(() => import("./pages/gestor/GestorMensagens"));
const GestorBranding = lazy(() => import("./pages/gestor/GestorBranding"));
const GestorClientes = lazy(() => import("./pages/gestor/GestorClientes"));

// Lazy load de páginas públicas
const Sobre = lazy(() => import("./pages/public/Sobre"));
const Termos = lazy(() => import("./pages/public/Termos"));
const Privacidade = lazy(() => import("./pages/public/Privacidade"));
const Contato = lazy(() => import("./pages/public/Contato"));

// Componente de loading
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      
      {/* Páginas Públicas */}
      <Route path="/sobre">
        <Suspense fallback={<PageLoader />}>
          <Sobre />
        </Suspense>
      </Route>
      <Route path="/termos">
        <Suspense fallback={<PageLoader />}>
          <Termos />
        </Suspense>
      </Route>
      <Route path="/privacidade">
        <Suspense fallback={<PageLoader />}>
          <Privacidade />
        </Suspense>
      </Route>
      <Route path="/contato">
        <Suspense fallback={<PageLoader />}>
          <Contato />
        </Suspense>
      </Route>
      
      {/* Rotas de Login */}
      <Route path="/login/aluno">
        <Suspense fallback={<PageLoader />}>
          <LoginAluno />
        </Suspense>
      </Route>
      <Route path="/login/escola">
        <Suspense fallback={<PageLoader />}>
          <LoginEscola />
        </Suspense>
      </Route>
      <Route path="/login/gestor">
        <Suspense fallback={<PageLoader />}>
          <LoginGestor />
        </Suspense>
      </Route>
      
      {/* Rotas do Aluno */}
      <Route path="/aluno">
        {() => {
          console.log('[App] Rota /aluno renderizando');
          return (
            <DashboardLayout>
              <Suspense fallback={<PageLoader />}>
                <AlunoHome />
              </Suspense>
            </DashboardLayout>
          );
        }}
      </Route>
      <Route path="/aluno/estudos">
        <DashboardLayout>
          <Suspense fallback={<PageLoader />}>
            <AlunoEstudos />
          </Suspense>
        </DashboardLayout>
      </Route>
      <Route path="/aluno/simulados">
        <DashboardLayout>
          <Suspense fallback={<PageLoader />}>
            <AlunoSimulados />
          </Suspense>
        </DashboardLayout>
      </Route>
      <Route path="/aluno/redacoes">
        <DashboardLayout>
          <Suspense fallback={<PageLoader />}>
            <AlunoRedacoes />
          </Suspense>
        </DashboardLayout>
      </Route>
      <Route path="/aluno/metricas">
        <DashboardLayout>
          <Suspense fallback={<PageLoader />}>
            <AlunoMetricas />
          </Suspense>
        </DashboardLayout>
      </Route>
      <Route path="/aluno/cronograma">
        <DashboardLayout>
          <Suspense fallback={<PageLoader />}>
            <CronogramaWrapper />
          </Suspense>
        </DashboardLayout>
      </Route>
      <Route path="/aluno/configuracoes">
        <DashboardLayout>
          <Suspense fallback={<PageLoader />}>
            <AlunoConfiguracoes />
          </Suspense>
        </DashboardLayout>
      </Route>
      <Route path="/aluno/diario">
        <DashboardLayout>
          <Suspense fallback={<PageLoader />}>
            <AlunoDiario />
          </Suspense>
        </DashboardLayout>
      </Route>
      <Route path="/aluno/metas">
        <DashboardLayout>
          <Suspense fallback={<PageLoader />}>
            <AlunoMetas />
          </Suspense>
        </DashboardLayout>
      </Route>
      
      {/* Rotas de Conteúdos do Aluno */}
      <Route path="/aluno/conteudos">
        <DashboardLayout>
          <Suspense fallback={<PageLoader />}>
            <PainelGeral />
          </Suspense>
        </DashboardLayout>
      </Route>
      <Route path="/aluno/conteudos/matematica">
        <DashboardLayout>
          <Suspense fallback={<PageLoader />}>
            <Matematica />
          </Suspense>
        </DashboardLayout>
      </Route>
      <Route path="/aluno/conteudos/biologia">
        <DashboardLayout>
          <Suspense fallback={<PageLoader />}>
            <Biologia />
          </Suspense>
        </DashboardLayout>
      </Route>
      <Route path="/aluno/conteudos/fisica">
        <DashboardLayout>
          <Suspense fallback={<PageLoader />}>
            <Fisica />
          </Suspense>
        </DashboardLayout>
      </Route>
      <Route path="/aluno/conteudos/quimica">
        <DashboardLayout>
          <Suspense fallback={<PageLoader />}>
            <Quimica />
          </Suspense>
        </DashboardLayout>
      </Route>
      <Route path="/aluno/conteudos/historia">
        <DashboardLayout>
          <Suspense fallback={<PageLoader />}>
            <Historia />
          </Suspense>
        </DashboardLayout>
      </Route>
      <Route path="/aluno/conteudos/geografia">
        <DashboardLayout>
          <Suspense fallback={<PageLoader />}>
            <Geografia />
          </Suspense>
        </DashboardLayout>
      </Route>
      <Route path="/aluno/conteudos/linguagens">
        <DashboardLayout>
          <Suspense fallback={<PageLoader />}>
            <Linguagens />
          </Suspense>
        </DashboardLayout>
      </Route>
      <Route path="/aluno/conteudos/filosofia">
        <DashboardLayout>
          <Suspense fallback={<PageLoader />}>
            <Filosofia />
          </Suspense>
        </DashboardLayout>
      </Route>
      <Route path="/aluno/conteudos/sociologia">
        <DashboardLayout>
          <Suspense fallback={<PageLoader />}>
            <Sociologia />
          </Suspense>
        </DashboardLayout>
      </Route>
      
      {/* Rotas do Escola */}
      <Route path="/escola">
        <DashboardLayout>
          <Suspense fallback={<PageLoader />}>
            <EscolaHome />
          </Suspense>
        </DashboardLayout>
      </Route>
      <Route path="/escola/alunos">
        <DashboardLayout>
          <Suspense fallback={<PageLoader />}>
            <EscolaAlunos />
          </Suspense>
        </DashboardLayout>
      </Route>
      <Route path="/escola/alunos/:alunoId">
        {(params) => (
          <DashboardLayout>
            <Suspense fallback={<PageLoader />}>
              <EscolaViewAluno alunoId={params.alunoId} />
            </Suspense>
          </DashboardLayout>
        )}
      </Route>
      <Route path="/escola/configuracoes">
        <DashboardLayout>
          <Suspense fallback={<PageLoader />}>
            <EscolaConfiguracoes />
          </Suspense>
        </DashboardLayout>
      </Route>
      <Route path="/escola/diagnostico-perfil">
        <DashboardLayout>
          <Suspense fallback={<PageLoader />}>
            <EscolaDiagnosticoPerfil />
          </Suspense>
        </DashboardLayout>
      </Route>
      
      {/* Rotas de Conteúdos do Escola */}
      <Route path="/escola/conteudos">
        <DashboardLayout>
          <Suspense fallback={<PageLoader />}>
            <EscolaPainelGeral />
          </Suspense>
        </DashboardLayout>
      </Route>
      <Route path="/escola/conteudos/matematica">
        <DashboardLayout>
          <Suspense fallback={<PageLoader />}>
            <EscolaMatematica />
          </Suspense>
        </DashboardLayout>
      </Route>
      <Route path="/escola/conteudos/biologia">
        <DashboardLayout>
          <Suspense fallback={<PageLoader />}>
            <EscolaBiologia />
          </Suspense>
        </DashboardLayout>
      </Route>
      <Route path="/escola/conteudos/fisica">
        <DashboardLayout>
          <Suspense fallback={<PageLoader />}>
            <EscolaFisica />
          </Suspense>
        </DashboardLayout>
      </Route>
      <Route path="/escola/conteudos/quimica">
        <DashboardLayout>
          <Suspense fallback={<PageLoader />}>
            <EscolaQuimica />
          </Suspense>
        </DashboardLayout>
      </Route>
      <Route path="/escola/conteudos/historia">
        <DashboardLayout>
          <Suspense fallback={<PageLoader />}>
            <EscolaHistoria />
          </Suspense>
        </DashboardLayout>
      </Route>
      <Route path="/escola/conteudos/geografia">
        <DashboardLayout>
          <Suspense fallback={<PageLoader />}>
            <EscolaGeografia />
          </Suspense>
        </DashboardLayout>
      </Route>
      <Route path="/escola/conteudos/linguagens">
        <DashboardLayout>
          <Suspense fallback={<PageLoader />}>
            <EscolaLinguagens />
          </Suspense>
        </DashboardLayout>
      </Route>
      <Route path="/escola/conteudos/filosofia">
        <DashboardLayout>
          <Suspense fallback={<PageLoader />}>
            <EscolaFilosofia />
          </Suspense>
        </DashboardLayout>
      </Route>
      <Route path="/escola/conteudos/sociologia">
        <DashboardLayout>
          <Suspense fallback={<PageLoader />}>
            <EscolaSociologia />
          </Suspense>
        </DashboardLayout>
      </Route>
      
      {/* Rotas do Gestor */}
      <Route path="/gestor">
        <DashboardLayout>
          <Suspense fallback={<PageLoader />}>
            <GestorHome />
          </Suspense>
        </DashboardLayout>
      </Route>
      <Route path="/gestor/escolas">
        <DashboardLayout>
          <Suspense fallback={<PageLoader />}>
            <GestorEscolas />
          </Suspense>
        </DashboardLayout>
      </Route>
      <Route path="/gestor/alunos">
        <DashboardLayout>
          <Suspense fallback={<PageLoader />}>
            <GestorAlunos />
          </Suspense>
        </DashboardLayout>
      </Route>
      <Route path="/gestor/configuracoes">
        <DashboardLayout>
          <Suspense fallback={<PageLoader />}>
            <GestorConfiguracoes />
          </Suspense>
        </DashboardLayout>
      </Route>
      <Route path="/gestor/mensagens">
        <DashboardLayout>
          <Suspense fallback={<PageLoader />}>
            <GestorMensagens />
          </Suspense>
        </DashboardLayout>
      </Route>
      <Route path="/gestor/branding">
        <DashboardLayout>
          <Suspense fallback={<PageLoader />}>
            <GestorBranding />
          </Suspense>
        </DashboardLayout>
      </Route>
      <Route path="/gestor/clientes">
        <DashboardLayout>
          <Suspense fallback={<PageLoader />}>
            <GestorClientes />
          </Suspense>
        </DashboardLayout>
      </Route>
      
      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <TenantProvider>
        <ThemeProvider>
          <AuthProvider>
            <TooltipProvider>
              <Router />
              <Toaster />
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </TenantProvider>
    </ErrorBoundary>
  );
}

export default App;

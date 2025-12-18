import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  componentName?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturou erro:', error, errorInfo);
    
    // Log detalhado no console para debug
    console.group('🔴 Erro Capturado pelo ErrorBoundary');
    console.error('Componente:', this.props.componentName || 'Unknown');
    console.error('Mensagem:', error.message);
    console.error('Stack:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('URL:', window.location.href);
    console.error('User Agent:', navigator.userAgent);
    console.groupEnd();
  }

  handleClearCacheAndReload = () => {
    // Limpar localStorage
    localStorage.removeItem('autodiagnostico-cache');
    
    // Limpar cache do service worker
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    // Recarregar página com force reload
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-2xl p-8">
            <AlertTriangle
              size={48}
              className="text-destructive mb-6 flex-shrink-0"
            />

            <h2 className="text-xl mb-4 font-semibold">
              {this.props.fallbackMessage || "Ops! Algo deu errado"}
            </h2>

            <p className="text-muted-foreground mb-6 text-center">
              Encontramos um problema ao carregar esta seção. Não se preocupe, seus dados estão seguros.
              Tente recarregar a página ou limpar o cache.
            </p>

            {process.env.NODE_ENV === 'development' && (
              <div className="p-4 w-full rounded bg-muted overflow-auto mb-6">
                <pre className="text-sm text-muted-foreground whitespace-break-spaces">
                  {this.state.error?.stack}
                </pre>
              </div>
            )}

            <div className="flex gap-3 w-full">
              <button
                onClick={() => window.location.reload()}
                className={cn(
                  "flex items-center justify-center gap-2 px-4 py-2 rounded-lg flex-1",
                  "bg-primary text-primary-foreground",
                  "hover:opacity-90 cursor-pointer"
                )}
              >
                <RotateCcw size={16} />
                Recarregar Página
              </button>
              
              <button
                onClick={this.handleClearCacheAndReload}
                className={cn(
                  "flex items-center justify-center gap-2 px-4 py-2 rounded-lg flex-1",
                  "bg-secondary text-secondary-foreground border",
                  "hover:opacity-90 cursor-pointer"
                )}
              >
                Limpar Cache e Recarregar
              </button>
            </div>

            <p className="text-xs text-muted-foreground mt-4 text-center">
              Se o problema persistir, entre em contato com o suporte.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

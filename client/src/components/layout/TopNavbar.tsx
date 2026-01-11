import { useAuthContext } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { APP_LOGO, APP_TITLE } from "@/const";
import { useTenant } from "@/contexts/TenantContext";
import { 
  BarChart3, 
  BookOpen, 
  ChevronDown,
  FileText, 
  GraduationCap, 
  Heart, 
  Home, 
  LayoutDashboard, 
  LogOut, 
  Moon, 
  PenTool, 
  Settings, 
  Sun, 
  Target,
  Users,
  MessageSquare,
  Palette,
  Building2
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { TenantFeatures } from "@/types/tenant";

type FeatureKey = keyof TenantFeatures;

interface MenuItem {
  icon: any;
  label: string;
  path: string;
  feature?: FeatureKey;
  submenu?: { label: string; path: string }[];
}

const getMenuItems = (role?: string, features?: TenantFeatures): MenuItem[] => {
  if (!role) return [];
  
  const filterByFeature = (items: MenuItem[]): MenuItem[] => {
    if (!features) return items;
    return items.filter(item => {
      if (!item.feature) return true;
      return features[item.feature] === true;
    });
  };
  
  switch (role) {
    case "aluno":
      return filterByFeature([
        { icon: Home, label: "Início", path: "/aluno" },
        { icon: BookOpen, label: "Estudos", path: "/aluno/estudos", feature: "estudos" },
        { icon: LayoutDashboard, label: "Cronograma", path: "/aluno/cronograma", feature: "cronograma" },
        { icon: BarChart3, label: "Métricas", path: "/aluno/metricas", feature: "metricas" },
        { icon: Target, label: "Metas", path: "/aluno/metas", feature: "metas" },
        { icon: FileText, label: "Simulados", path: "/aluno/simulados", feature: "simulados" },
        { icon: PenTool, label: "Redações", path: "/aluno/redacoes", feature: "redacoes" },
        { icon: Heart, label: "Diário de Bordo", path: "/aluno/diario", feature: "diarioBordo" },
        { 
          icon: GraduationCap, 
          label: "Conteúdos", 
          path: "/aluno/conteudos",
          submenu: [
            { label: "Painel Geral", path: "/aluno/conteudos" },
            { label: "Matemática", path: "/aluno/conteudos/matematica" },
            { label: "Biologia", path: "/aluno/conteudos/biologia" },
            { label: "Física", path: "/aluno/conteudos/fisica" },
            { label: "Química", path: "/aluno/conteudos/quimica" },
            { label: "História", path: "/aluno/conteudos/historia" },
            { label: "Geografia", path: "/aluno/conteudos/geografia" },
            { label: "Linguagens", path: "/aluno/conteudos/linguagens" },
            { label: "Filosofia", path: "/aluno/conteudos/filosofia" },
            { label: "Sociologia", path: "/aluno/conteudos/sociologia" },
          ]
        },
      ]);
    case "escola":
      return [
        { icon: Users, label: "Alunos", path: "/escola/alunos" },
        { 
          icon: BookOpen, 
          label: "Conteúdos", 
          path: "/escola/conteudos",
          submenu: [
            { label: "Painel Geral", path: "/escola/conteudos" },
            { label: "Matemática", path: "/escola/conteudos/matematica" },
            { label: "Biologia", path: "/escola/conteudos/biologia" },
            { label: "Física", path: "/escola/conteudos/fisica" },
            { label: "Química", path: "/escola/conteudos/quimica" },
            { label: "História", path: "/escola/conteudos/historia" },
            { label: "Geografia", path: "/escola/conteudos/geografia" },
            { label: "Linguagens", path: "/escola/conteudos/linguagens" },
            { label: "Filosofia", path: "/escola/conteudos/filosofia" },
            { label: "Sociologia", path: "/escola/conteudos/sociologia" },
          ]
        },
      ];
    case "gestor":
      return [
        { icon: Home, label: "Início", path: "/gestor" },
        { icon: Users, label: "Escolaes", path: "/gestor/escolas" },
        { icon: GraduationCap, label: "Alunos", path: "/gestor/alunos" },
        { icon: MessageSquare, label: "Mensagens", path: "/gestor/mensagens" },
        { icon: Building2, label: "Clientes", path: "/gestor/clientes" },
        { icon: Palette, label: "Personalização", path: "/gestor/branding" },
      ];
    default:
      return [];
  }
};

interface TopNavbarProps {
  theme: string;
  toggleTheme: () => void;
}

export default function TopNavbar({ theme, toggleTheme }: TopNavbarProps) {
  const { userData, signOut } = useAuthContext();
  const { tenant } = useTenant();
  const [location, setLocation] = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const logoUrl = tenant?.branding?.logo || APP_LOGO;
  const appTitle = tenant?.branding?.nomeExibicao || APP_TITLE;
  
  const menuItems = getMenuItems(userData?.role, tenant?.features);

  return (
    <nav className="sticky top-0 z-50 w-full border-b-2 border-emerald-100 dark:border-emerald-900/30 bg-gradient-to-r from-white via-emerald-50/30 to-teal-50/30 dark:from-gray-950 dark:via-emerald-950/10 dark:to-teal-950/10 backdrop-blur-sm shadow-sm">
      <div className="flex h-16 items-center px-4 gap-4">
        {/* Logo e Título */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500 rounded-xl blur-md opacity-50"></div>
            <img
              src={logoUrl}
              className="relative h-10 w-10 rounded-xl object-contain ring-2 ring-emerald-200 dark:ring-emerald-800 shadow"
              alt="Logo"
            />
          </div>
          <span className="font-semibold text-lg tracking-tight text-emerald-600 dark:text-emerald-400 hidden md:block">
            {appTitle}
          </span>
        </div>

        {/* Menu Items */}
        <div className="flex items-center gap-1 flex-1 overflow-x-auto">
          {menuItems.map(item => {
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isActive = location === item.path || (hasSubmenu && item.submenu?.some(sub => location === sub.path));
            
            if (hasSubmenu) {
              return (
                <DropdownMenu 
                  key={item.path}
                  open={openSubmenu === item.path}
                  onOpenChange={(open) => setOpenSubmenu(open ? item.path : null)}
                >
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                        isActive
                          ? "bg-emerald-500 text-white shadow"
                          : "hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="hidden sm:inline">{item.label}</span>
                      <ChevronDown className="h-3 w-3 shrink-0" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    {item.submenu.map(subItem => (
                      <DropdownMenuItem
                        key={subItem.path}
                        onClick={() => {
                          setLocation(subItem.path);
                          setOpenSubmenu(null);
                        }}
                        className={location === subItem.path ? "bg-emerald-100 dark:bg-emerald-900/30" : ""}
                      >
                        {subItem.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }

            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-emerald-500 text-white shadow"
                    : "hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-gray-700 dark:text-gray-300"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-2 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full hover:ring-2 hover:ring-emerald-500/50 transition-all">
                <Avatar className="h-9 w-9 border-2 border-emerald-200 dark:border-emerald-800 shadow">
                  {userData?.photoURL && (
                    <AvatarImage src={userData.photoURL} alt={userData?.name || "Foto de perfil"} />
                  )}
                  <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                    {userData?.name?.charAt(0).toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400 hidden md:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {userData?.name || "Usuário"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {userData?.email || ""}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLocation(`/${userData?.role}/configuracoes`)}>
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleTheme}>
                {theme === "dark" ? (
                  <>
                    <Sun className="h-4 w-4 mr-2" />
                    Modo Claro
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 mr-2" />
                    Modo Escuro
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-red-600 dark:text-red-400">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}

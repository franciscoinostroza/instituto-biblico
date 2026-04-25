import { useState } from "react";
import { Link, NavLink as RouterNavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, GraduationCap, Users, BookMarked, Building2,
  MessageSquare, Bell, LogOut, Menu, X, ChevronDown, Settings, BarChart3, User as UserIcon,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import type { Rol } from "@/types";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; roles?: Rol[] };

const navItems: NavItem[] = [
  { to: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { to: "/materias", label: "Mis materias", icon: BookMarked },
  { to: "/admin/usuarios", label: "Usuarios", icon: Users, roles: ["admin"] },
  { to: "/admin/carreras", label: "Carreras", icon: GraduationCap, roles: ["admin"] },
  { to: "/admin/reportes", label: "Reportes", icon: BarChart3, roles: ["admin"] },
  { to: "/instituto", label: "Instituto", icon: Building2 },
  { to: "/mensajes", label: "Mensajes", icon: MessageSquare },
];

const rolColor: Record<Rol, { ring: string; chip: string; label: string }> = {
  admin: { ring: "bg-role-admin", chip: "bg-role-admin/10 text-role-admin border-role-admin/20", label: "Administrador" },
  docente: { ring: "bg-role-docente", chip: "bg-role-docente/10 text-role-docente border-role-docente/20", label: "Docente" },
  estudiante: { ring: "bg-role-estudiante", chip: "bg-role-estudiante/10 text-role-estudiante border-role-estudiante/20", label: "Estudiante" },
};

export const AppLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;
  const role = rolColor[user.role];

  const visibleItems = navItems.filter((i) => !i.roles || i.roles.includes(user.role));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Cerrar menú móvil al cambiar de ruta
  const onNavClick = () => setMobileOpen(false);

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <Logo size="sm" />
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">Navegación</p>
          {visibleItems.map((item) => (
            <RouterNavLink
              key={item.to} to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary",
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </RouterNavLink>
          ))}
        </nav>

        {/* User card */}
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent">
            <div className="relative">
              <Avatar className="h-10 w-10 border-2 border-card">
                <AvatarFallback className="bg-gradient-hero text-primary-foreground font-medium text-sm">
                  {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </AvatarFallback>
              </Avatar>
              <span className={cn("absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-card", role.ring)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{role.label}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-fade-in" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 bg-sidebar border-r border-sidebar-border flex flex-col animate-slide-in-right">
            <div className="h-16 flex items-center justify-between px-6 border-b border-sidebar-border">
              <Logo size="sm" />
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
              {visibleItems.map((item) => (
                <RouterNavLink
                  key={item.to} to={item.to} onClick={onNavClick}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth",
                      isActive ? "bg-primary text-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent",
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </RouterNavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 sticky top-0 z-30 flex items-center gap-3 px-4 sm:px-6 border-b border-border bg-background/80 backdrop-blur-md">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1" />

          <Badge variant="outline" className={cn("hidden sm:inline-flex border", role.chip)}>
            {role.label}
          </Badge>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-accent ring-2 ring-background" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-secondary transition-smooth">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-hero text-primary-foreground text-xs font-medium">
                    {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/perfil"><UserIcon className="mr-2 h-4 w-4" /> Mi perfil</Link>
              </DropdownMenuItem>
              {user.role === "admin" && (
                <DropdownMenuItem asChild>
                  <Link to="/admin/configuracion"><Settings className="mr-2 h-4 w-4" /> Configuración</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" /> Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main key={location.pathname} className="flex-1 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

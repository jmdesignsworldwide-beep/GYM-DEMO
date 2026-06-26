import {
  LayoutDashboard,
  DoorOpen,
  Users,
  CreditCard,
  Dumbbell,
  BarChart3,
  CalendarClock,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

// Navegación del sistema. Los módulos se construyen en tandas siguientes;
// por ahora cada ruta muestra un placeholder para recorrer el layout.
export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/acceso", label: "Acceso", icon: DoorOpen },
  { href: "/miembros", label: "Miembros", icon: Users },
  { href: "/pagos", label: "Pagos", icon: CreditCard },
  { href: "/calendario", label: "Calendario", icon: CalendarClock },
  { href: "/clases", label: "Clases", icon: Dumbbell },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];

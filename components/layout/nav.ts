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
  soloAdmin?: boolean;
};

// Navegación del sistema. `soloAdmin` oculta el ítem al cajero (y el servidor
// también bloquea esas rutas — ver middleware).
export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/acceso", label: "Acceso", icon: DoorOpen },
  { href: "/miembros", label: "Miembros", icon: Users },
  { href: "/pagos", label: "Pagos", icon: CreditCard, soloAdmin: true },
  { href: "/calendario", label: "Calendario", icon: CalendarClock },
  { href: "/clases", label: "Clases", icon: Dumbbell },
  { href: "/reportes", label: "Reportes", icon: BarChart3, soloAdmin: true },
  { href: "/configuracion", label: "Configuración", icon: Settings, soloAdmin: true },
];

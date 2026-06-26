import {
  LayoutDashboard,
  DoorOpen,
  Users,
  CreditCard,
  Wallet,
  ShoppingCart,
  Package,
  Wrench,
  Dumbbell,
  UserCog,
  HeartPulse,
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
  { href: "/empleados", label: "Empleados", icon: UserCog },
  { href: "/pagos", label: "Pagos", icon: CreditCard, soloAdmin: true },
  { href: "/caja", label: "Caja", icon: Wallet },
  { href: "/pos", label: "Venta", icon: ShoppingCart },
  { href: "/inventario", label: "Inventario", icon: Package, soloAdmin: true },
  { href: "/equipos", label: "Equipos", icon: Wrench, soloAdmin: true },
  { href: "/calendario", label: "Calendario", icon: CalendarClock },
  { href: "/clases", label: "Clases", icon: Dumbbell },
  { href: "/entrenamiento", label: "Entrenamiento", icon: HeartPulse },
  { href: "/reportes", label: "Reportes", icon: BarChart3, soloAdmin: true },
  { href: "/configuracion", label: "Configuración", icon: Settings, soloAdmin: true },
];

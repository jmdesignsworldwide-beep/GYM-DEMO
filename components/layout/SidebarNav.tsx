"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { navItems } from "./nav";
import { Logo } from "@/components/ui/Logo";
import { signOut } from "@/lib/auth";

/**
 * Contenido de navegación, compartido por el sidebar de escritorio y el
 * drawer de móvil. `onNavigate` cierra el drawer al tocar un enlace.
 */
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    onNavigate?.();
    router.push("/login");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-200 ${
                active
                  ? "bg-accent-soft font-medium text-accent"
                  : "text-ink-muted hover:bg-bg-2 hover:text-ink"
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {active && (
                <span
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-accent"
                  style={{ boxShadow: "var(--glow)" }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink-muted transition-colors duration-200 hover:bg-bg-2 hover:text-ink"
        >
          <LogOut size={18} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
}

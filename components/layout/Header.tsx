"use client";

import { Bell, Menu } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function Header({
  onMenu,
  username,
  rol,
}: {
  onMenu: () => void;
  username: string;
  rol: string;
}) {
  const display = username || "Usuaria";
  const rolLabel = rol === "admin" ? "Admin" : "Cajero";

  return (
    <header className="glass sticky top-0 z-20 border-x-0 border-t-0">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={onMenu}
          aria-label="Abrir menú"
          className="grid h-10 w-10 place-items-center rounded-lg text-ink transition-colors hover:bg-bg-2 lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div className="lg:hidden">
          <Logo size="sm" />
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            aria-label="Notificaciones"
            className="relative grid h-10 w-10 place-items-center rounded-full text-ink-muted transition-colors hover:bg-bg-2 hover:text-ink"
          >
            <Bell size={18} />
            <span
              className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-accent"
              style={{ boxShadow: "var(--glow)" }}
            />
          </button>

          <ThemeToggle />

          <div className="flex items-center gap-2 pl-1">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
              {display.charAt(0).toUpperCase()}
            </span>
            <div className="hidden leading-tight sm:block">
              <p className="text-sm text-ink">{display}</p>
              <p className="text-xs text-ink-faint">{rolLabel}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

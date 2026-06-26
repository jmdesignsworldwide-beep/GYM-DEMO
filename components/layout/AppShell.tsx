"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { SidebarNav } from "./SidebarNav";
import { Header } from "./Header";

/**
 * Marco del sistema: sidebar fijo en escritorio, drawer con hamburguesa en
 * móvil, header y área de contenido con transición suave entre vistas.
 * El drawer se desmonta al cerrar (no bloquea toques en móvil).
 */
export function AppShell({
  children,
  rol,
  username,
}: {
  children: React.ReactNode;
  rol: string;
  username: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Bloquea el scroll del fondo mientras el drawer está abierto.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Cierra el drawer al cambiar de ruta.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen">
      {/* Sidebar — escritorio */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-line bg-bg-1 lg:block">
        <SidebarNav rol={rol} />
      </aside>

      {/* Drawer — móvil (montado solo cuando está abierto) */}
      <AnimatePresence>
        {open && (
          <div className="lg:hidden">
            <motion.div
              className="fixed inset-0 z-40 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-[82vw] max-w-xs flex-col border-r border-line bg-bg-1"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
            >
              <SidebarNav rol={rol} onNavigate={() => setOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Contenido */}
      <div className="lg:pl-64">
        <Header onMenu={() => setOpen(true)} username={username} rol={rol} />
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

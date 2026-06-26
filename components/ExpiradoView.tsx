"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Phone, AtSign, Mail, LogOut, Clock } from "lucide-react";
import { Aurora } from "@/components/Aurora";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { signOut } from "@/lib/auth";

const contactos = [
  { icon: Phone, label: "809-707-2997", href: "tel:+18097072997" },
  { icon: AtSign, label: "@jm.designs.worldwide", href: "https://instagram.com/jm.designs.worldwide" },
  { icon: Mail, label: "jm.designs.worldwide@gmail.com", href: "mailto:jm.designs.worldwide@gmail.com" },
];

export function ExpiradoView() {
  const router = useRouter();
  const [saliendo, setSaliendo] = useState(false);

  async function salir() {
    if (saliendo) return;
    setSaliendo(true);
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-10">
      <Aurora intensity="intense" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="glass shadow-card w-full max-w-md rounded-xl p-8 text-center sm:p-10"
      >
        <div className="mb-7 flex flex-col items-center">
          <Logo size="lg" />
          <span className="mt-7 grid h-14 w-14 place-items-center rounded-full bg-accent-soft text-accent">
            <Clock size={26} />
          </span>
          <h1 className="mt-5 font-display text-title font-semibold text-ink">
            Tu acceso de demostración ha expirado
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Contacta a JM Designs Worldwide para renovarlo y seguir explorando el sistema.
          </p>
        </div>

        <div className="space-y-2.5 text-left">
          {contactos.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg border border-line bg-bg-2 px-4 py-3 text-sm text-ink transition-colors hover:border-accent hover:bg-accent-soft"
            >
              <c.icon size={18} className="shrink-0 text-accent" />
              <span className="truncate">{c.label}</span>
            </a>
          ))}
        </div>

        <Button
          variant="ghost"
          magnetic={false}
          loading={saliendo}
          onClick={salir}
          className="mt-7 w-full"
        >
          <LogOut size={16} />
          Cerrar sesión
        </Button>
      </motion.div>

      <p className="absolute bottom-5 text-xs text-ink-faint">
        JM FIT · por JM Designs Worldwide
      </p>
    </main>
  );
}

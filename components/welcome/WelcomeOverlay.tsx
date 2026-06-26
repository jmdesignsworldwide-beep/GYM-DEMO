"use client";

import { motion } from "framer-motion";
import { Aurora } from "@/components/Aurora";
import { Logo } from "@/components/ui/Logo";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Bienvenida cinematográfica — momento estrella tras el login.
 * Aurora a máxima intensidad, logo con anillos de glow, marca en degradado y
 * saludo con efecto desenfoque-a-nítido. El padre (WelcomeGate) controla
 * cuándo se monta/desmonta y el revelado del dashboard.
 */
export function WelcomeOverlay({ nombre }: { nombre: string }) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-bg-0 px-6"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.06, filter: "blur(10px)" }}
      transition={{ duration: 0.7, ease }}
    >
      <Aurora intensity="intense" />

      <div className="relative flex flex-col items-center text-center">
        {/* Logo con anillos de glow */}
        <div className="relative mb-7 grid place-items-center">
          <motion.span
            aria-hidden
            className="absolute rounded-full"
            style={{ width: 150, height: 150, boxShadow: "0 0 90px 12px var(--accent)" }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0, 0.5, 0.32], scale: [0.6, 1.15, 1] }}
            transition={{ duration: 1.6, ease, times: [0, 0.6, 1] }}
          />
          {[0, 1].map((i) => (
            <motion.span
              key={i}
              aria-hidden
              className="absolute rounded-full border border-accent/40"
              initial={{ width: 96, height: 96, opacity: 0.5 }}
              animate={{ width: 220 + i * 70, height: 220 + i * 70, opacity: 0 }}
              transition={{ duration: 2.2, ease: "easeOut", delay: 0.25 + i * 0.45, repeat: Infinity, repeatDelay: 0.3 }}
            />
          ))}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease }}
          >
            <Logo size="lg" />
          </motion.div>
        </div>

        {/* Marca debajo del logo, con espacio */}
        <motion.h1
          className="text-gradient font-display text-display-lg font-bold tracking-tight"
          initial={{ opacity: 0, y: 16, filter: "blur(16px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, ease, delay: 0.2 }}
        >
          JM FIT
        </motion.h1>

        {/* Saludo con desenfoque-a-nítido */}
        <motion.p
          className="mt-4 text-lg text-ink sm:text-xl"
          initial={{ opacity: 0, filter: "blur(14px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 1, ease, delay: 0.6 }}
        >
          Bienvenido de nuevo, <span className="font-semibold text-ink">{nombre}</span>
        </motion.p>

        {/* Línea viva de acento */}
        <motion.span
          aria-hidden
          className="mt-7 block h-[3px] rounded-full bg-accent"
          style={{ boxShadow: "var(--glow)" }}
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 96, opacity: 1 }}
          transition={{ duration: 0.9, ease, delay: 0.9 }}
        />
      </div>
    </motion.div>
  );
}

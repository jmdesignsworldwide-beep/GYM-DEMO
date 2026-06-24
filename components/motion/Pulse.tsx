"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Pulse — indicador que "late". Para estados en vivo:
 * "gente en el gym ahora", "vencen hoy", etc.
 */
export function Pulse({
  label,
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="relative grid h-2.5 w-2.5 place-items-center">
        {!reduce && (
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ background: "var(--accent)" }}
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 2.6, opacity: 0 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <span className="h-2.5 w-2.5 rounded-full bg-accent" style={{ boxShadow: "var(--glow)" }} />
      </span>
      {label && <span className="text-sm text-ink-muted">{label}</span>}
    </span>
  );
}

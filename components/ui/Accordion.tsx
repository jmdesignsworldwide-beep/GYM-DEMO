"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronRight } from "lucide-react";

/**
 * Accordion — sección colapsable premium. Cerrada por defecto, con título +
 * resumen y chevron que rota. Despliegue suave (height auto), respeta
 * prefers-reduced-motion.
 */
export function Accordion({
  title,
  summary,
  defaultOpen = false,
  children,
}: {
  title: string;
  summary?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const reduce = useReducedMotion();

  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-bg-2"
      >
        <span className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-ink">{title}</span>
          {summary && <span className="text-xs text-ink-faint">{summary}</span>}
        </span>
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
          className="shrink-0 text-ink-muted"
        >
          <ChevronRight size={18} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

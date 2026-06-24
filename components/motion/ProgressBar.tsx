"use client";

import { motion } from "framer-motion";

/**
 * ProgressBar — barra que se llena hasta `value`% al entrar en vista.
 */
export function ProgressBar({
  value,
  className = "",
  label,
}: {
  value: number;
  className?: string;
  label?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div className={className}>
      {label && (
        <div className="mb-2 flex items-baseline justify-between text-sm">
          <span className="text-ink-muted">{label}</span>
          <span className="tabular-nums font-medium text-ink">{pct}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-bg-3">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, var(--accent), var(--accent-hover))",
            boxShadow: "var(--glow)",
          }}
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

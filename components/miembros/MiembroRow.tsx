"use client";

import { motion } from "framer-motion";
import { Avatar } from "./Avatar";
import { estadoInfo } from "@/lib/miembros/estado";
import { formatFechaCorta } from "@/lib/format";
import type { Miembro } from "@/lib/miembros/data";

export function MiembroRow({ miembro, onClick }: { miembro: Miembro; onClick: () => void }) {
  const est = estadoInfo(miembro.estado);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ x: 4 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-3 text-left transition-colors hover:border-line hover:bg-bg-2"
    >
      <Avatar nombre={miembro.nombre} foto={miembro.foto_url} size={44} />

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink">{miembro.nombre}</p>
        <p className="truncate text-xs text-ink-faint">
          {miembro.plan} · vence {formatFechaCorta(miembro.fecha_vencimiento)}
        </p>
      </div>

      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${est.badge}`}
      >
        {est.label}
      </span>
    </motion.button>
  );
}

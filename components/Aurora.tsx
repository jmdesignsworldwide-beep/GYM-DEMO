"use client";

import { motion, useReducedMotion } from "framer-motion";

type Intensity = "subtle" | "intense";

/**
 * Aurora — fondo naranja que respira bajo el contenido.
 * `intensity="subtle"` (por defecto): elegante, no cansa en uso diario.
 * `intensity="intense"`: para momentos estrella (login, bienvenida, WOW).
 * Respeta prefers-reduced-motion (se queda quieta, sin perder el ambiente).
 */
export function Aurora({
  intensity = "subtle",
  className = "",
}: {
  intensity?: Intensity;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const intense = intensity === "intense";

  const baseOpacity = intense ? 0.55 : 0.28;
  const peakOpacity = intense ? 0.8 : 0.4;
  const blur = intense ? 90 : 70;

  const breathe = reduce
    ? {}
    : {
        opacity: [baseOpacity, peakOpacity, baseOpacity],
        scale: [1, 1.08, 1],
      };

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}
    >
      {/* mancha principal, arriba */}
      <motion.div
        className="absolute left-1/2 top-[-18%] h-[55vh] w-[80vw] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, var(--aurora-a), transparent 65%)",
          filter: `blur(${blur}px)`,
          opacity: baseOpacity,
        }}
        animate={breathe}
        transition={{ duration: intense ? 7 : 11, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* mancha secundaria, abajo-izquierda */}
      <motion.div
        className="absolute bottom-[-22%] left-[-10%] h-[50vh] w-[55vw] rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, var(--aurora-b), transparent 70%)",
          filter: `blur(${blur}px)`,
          opacity: baseOpacity * 0.8,
        }}
        animate={
          reduce
            ? {}
            : { opacity: [baseOpacity * 0.6, peakOpacity * 0.7, baseOpacity * 0.6], scale: [1, 1.12, 1] }
        }
        transition={{ duration: intense ? 9 : 14, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />
      {/* grano sutil para que no se vea plano */}
      <div className="absolute inset-0 opacity-[0.015] [background-image:radial-gradient(var(--text-1)_1px,transparent_1px)] [background-size:3px_3px]" />
    </div>
  );
}

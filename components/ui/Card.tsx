"use client";

import { motion } from "framer-motion";
import { Magnetic } from "@/components/motion/Magnetic";

/**
 * Card — superficie de vidrio con sombra en capas y glow opcional al hover.
 * `magnetic` la atrae sutil hacia el cursor (reusa el primitivo Magnetic).
 */
export function Card({
  children,
  className = "",
  magnetic = false,
  glowOnHover = true,
}: {
  children: React.ReactNode;
  className?: string;
  magnetic?: boolean;
  glowOnHover?: boolean;
}) {
  const inner = (
    <motion.div
      whileHover={glowOnHover ? { y: -4 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={`glass shadow-card group relative rounded-lg p-5 transition-shadow duration-300 ${
        glowOnHover ? "hover:[box-shadow:var(--shadow-card),var(--glow)]" : ""
      } ${className}`}
    >
      {children}
    </motion.div>
  );

  return magnetic ? <Magnetic strength={0.18}>{inner}</Magnetic> : inner;
}

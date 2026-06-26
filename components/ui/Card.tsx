"use client";

import { motion } from "framer-motion";
import { Magnetic } from "@/components/motion/Magnetic";

/**
 * Card — superficie de vidrio con sombra en capas y glow opcional al hover.
 * `magnetic` la atrae sutil hacia el cursor (reusa el primitivo Magnetic).
 * Si recibe `onClick`, se comporta como botón (cursor + teclado).
 */
export function Card({
  children,
  className = "",
  magnetic = false,
  glowOnHover = true,
  onClick,
  ariaLabel,
}: {
  children: React.ReactNode;
  className?: string;
  magnetic?: boolean;
  glowOnHover?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
}) {
  const clickable = !!onClick;
  const inner = (
    <motion.div
      whileHover={glowOnHover ? { y: -4 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      onClick={onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={ariaLabel}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={`glass shadow-card group relative rounded-lg p-5 transition-shadow duration-300 ${
        glowOnHover ? "hover:[box-shadow:var(--shadow-card),var(--glow)]" : ""
      } ${clickable ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </motion.div>
  );

  return magnetic ? <Magnetic strength={0.18}>{inner}</Magnetic> : inner;
}

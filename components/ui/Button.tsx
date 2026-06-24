"use client";

import { Loader2 } from "lucide-react";
import { Magnetic } from "@/components/motion/Magnetic";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none select-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-contrast hover:bg-accent-hover [box-shadow:var(--glow)] hover:[box-shadow:0_0_32px_-2px_var(--accent)]",
  secondary: "glass text-ink hover:text-accent hover:border-accent",
  ghost: "text-ink-muted hover:text-ink hover:bg-bg-2",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-sm",
  lg: "h-14 px-7 text-base",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  magnetic = true,
  className = "",
  ...props
}: {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  magnetic?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const btn = (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );

  // El magnetic solo tiene sentido en el botón principal de acción.
  return magnetic && variant === "primary" ? (
    <Magnetic strength={0.25} className="inline-block">
      {btn}
    </Magnetic>
  ) : (
    btn
  );
}

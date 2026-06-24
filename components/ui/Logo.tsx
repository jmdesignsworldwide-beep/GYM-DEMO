/**
 * Logo de JM FIT — marca tipográfica con badge naranja.
 * `size` controla la escala general.
 */
export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims = {
    sm: { badge: "h-7 w-7 text-sm", word: "text-base" },
    md: { badge: "h-9 w-9 text-base", word: "text-lg" },
    lg: { badge: "h-12 w-12 text-xl", word: "text-2xl" },
  }[size];

  return (
    <span className="inline-flex items-center gap-2.5 font-display font-semibold">
      <span
        className="grid place-items-center rounded-[10px] text-accent-contrast"
        style={{
          background: "linear-gradient(135deg, var(--accent-hover), var(--accent))",
          boxShadow: "var(--glow)",
        }}
        aria-hidden
      >
        <span className={`grid place-items-center ${dims.badge}`}>JM</span>
      </span>
      <span className={`tracking-tight text-ink ${dims.word}`}>
        FIT
      </span>
    </span>
  );
}

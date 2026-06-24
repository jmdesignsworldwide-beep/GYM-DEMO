/**
 * Skeleton — placeholder de carga con barrido elegante.
 * El barrido se desactiva solo con prefers-reduced-motion (vía CSS global).
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-bg-3 ${className}`}
      aria-hidden
    >
      <div className="jmfit-shimmer absolute inset-0" />
    </div>
  );
}

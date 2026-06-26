export type StockInfo = { label: string; badge: string; dot: string };

export function stockInfo(stock: number, umbral: number): StockInfo {
  if (stock <= 0) {
    return {
      label: "Agotado",
      badge: "bg-red-500/10 text-red-600 dark:text-red-400",
      dot: "bg-red-500",
    };
  }
  if (stock <= umbral) {
    return {
      label: "Stock bajo",
      badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      dot: "bg-amber-500",
    };
  }
  return {
    label: "En stock",
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  };
}

export const CATEGORIAS_PRODUCTO = ["suplementos", "bebidas", "ropa", "accesorios"] as const;

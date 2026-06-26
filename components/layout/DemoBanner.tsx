"use client";

import { Clock } from "lucide-react";

/**
 * Aviso discreto de vigencia para cuentas de demostración (clientes).
 * Solo aparece cuando quedan pocos días. Las cuentas internas de Marien
 * no tienen vencimiento, así que nunca lo ven.
 */
export function DemoBanner({ accesoExpira }: { accesoExpira: string | null }) {
  if (!accesoExpira) return null;

  const dias = Math.ceil((new Date(accesoExpira).getTime() - Date.now()) / 86400000);
  if (dias <= 0 || dias > 7) return null;

  const texto =
    dias === 1 ? "Tu demo expira mañana." : `Tu demo expira en ${dias} días.`;

  return (
    <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-center gap-2 px-4 pt-4 sm:px-6 lg:px-10">
      <div className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-300">
        <Clock size={13} className="shrink-0" />
        {texto}
      </div>
    </div>
  );
}

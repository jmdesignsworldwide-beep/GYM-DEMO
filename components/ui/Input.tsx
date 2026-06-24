"use client";

import { forwardRef } from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  /** Elemento al final del campo (ej. botón mostrar/ocultar contraseña). */
  trailing?: React.ReactNode;
};

/**
 * Input — campo de formulario reutilizable, con label, foco con anillo
 * naranja y soporte para un elemento al final (icono/botón).
 */
export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, trailing, id, className = "", ...props },
  ref,
) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-muted">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          ref={ref}
          className={`h-12 w-full rounded-lg border bg-bg-2 px-4 text-ink placeholder:text-ink-faint transition-colors duration-200 focus:border-accent focus:outline-none ${
            trailing ? "pr-12" : ""
          } ${className}`}
          {...props}
        />
        {trailing && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">{trailing}</div>
        )}
      </div>
    </div>
  );
});

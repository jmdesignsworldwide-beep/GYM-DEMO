"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { WelcomeOverlay } from "./WelcomeOverlay";

export const WELCOME_KEY = "jmfit:welcome";

function primerNombre(nombre: string): string {
  const first = (nombre || "").trim().split(/\s+/)[0] || "";
  return first ? first.charAt(0).toUpperCase() + first.slice(1) : "de vuelta";
}

/**
 * Muestra la bienvenida cinematográfica UNA vez por login (bandera en
 * sessionStorage que pone la pantalla de login). A prueba de fallos: si algo
 * sale mal, un timeout la retira y el usuario entra al dashboard igual.
 * Respeta prefers-reduced-motion (la salta por completo).
 */
export function WelcomeGate({ username }: { username: string }) {
  const [visible, setVisible] = useState(false);
  const [killed, setKilled] = useState(false);

  useEffect(() => {
    let debeMostrar = false;
    try {
      debeMostrar = sessionStorage.getItem(WELCOME_KEY) === "1";
      if (debeMostrar) sessionStorage.removeItem(WELCOME_KEY);
    } catch {
      debeMostrar = false;
    }
    if (!debeMostrar) return;

    // prefers-reduced-motion → saltar directo al dashboard
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    setVisible(true);
    const tSalida = setTimeout(() => setVisible(false), 2400); // inicia el revelado
    const tFailsafe = setTimeout(() => setKilled(true), 4500); // red de seguridad
    return () => {
      clearTimeout(tSalida);
      clearTimeout(tFailsafe);
    };
  }, []);

  if (killed) return null;

  return (
    <AnimatePresence>
      {visible && <WelcomeOverlay key="welcome" nombre={primerNombre(username)} />}
    </AnimatePresence>
  );
}

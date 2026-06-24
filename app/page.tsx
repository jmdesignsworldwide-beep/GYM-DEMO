"use client";

import { Aurora } from "@/components/Aurora";
import { Logo } from "@/components/ui/Logo";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { CountUp } from "@/components/motion/CountUp";
import { ProgressBar } from "@/components/motion/ProgressBar";
import { Pulse } from "@/components/motion/Pulse";
import { Skeleton } from "@/components/motion/Skeleton";
import { motion } from "framer-motion";

const kpis = [
  { label: "Ingresos del mes", value: 284500, prefix: "RD$ " },
  { label: "Miembros activos", value: 412, prefix: "" },
  { label: "Renovaciones hoy", value: 17, prefix: "" },
  { label: "Asistencia semanal", value: 1893, prefix: "" },
];

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-6">
        <h2 className="font-display text-title font-semibold text-ink">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30">
        <div className="glass border-x-0 border-t-0">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
            <Logo />
            <div className="flex items-center gap-3">
              <Pulse label="38 en el gym ahora" className="hidden sm:inline-flex" />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Hero — momento de intensidad (aurora intensa) */}
      <section className="relative overflow-hidden">
        <Aurora intensity="intense" />
        <div className="mx-auto flex max-w-6xl flex-col items-start px-4 py-20 sm:px-6 sm:py-28">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-ink-muted"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Sistema de diseño · Pieza 1
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-display text-display-lg font-bold text-ink"
          >
            La energía de JM FIT,
            <br />
            <span className="text-gradient">en cada pantalla.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mt-5 max-w-xl text-base text-ink-muted sm:text-lg"
          >
            Base oscura deportiva, acento naranja que respira y movimiento con alma.
            Estos son los cimientos visuales de los que hereda todo el sistema.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Button size="lg">Empezar</Button>
            <Button variant="secondary" size="lg" magnetic={false}>
              Ver componentes
            </Button>
          </motion.div>
        </div>
      </section>

      {/* KPIs con count-up, glass, magnetic y glow */}
      <Section
        title="KPIs con vida"
        subtitle="Números que cuentan hacia arriba, en tabular-nums para que los montos no bailen."
      >
        <StaggerGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k) => (
            <StaggerItem key={k.label}>
              <Card magnetic className="h-full">
                <p className="text-sm text-ink-muted">{k.label}</p>
                <p className="mt-3 font-display text-3xl font-bold text-ink">
                  <CountUp value={k.value} prefix={k.prefix} />
                </p>
              </Card>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Section>

      {/* Tipografía */}
      <Section title="Tipografía" subtitle="Sora para títulos y números · Inter para el cuerpo.">
        <Card glowOnHover={false} className="space-y-4">
          <p className="font-display text-display-lg font-bold text-ink">Aa Bb Cc 123</p>
          <p className="font-display text-title font-semibold text-ink">
            Sora — títulos con presencia
          </p>
          <p className="text-base text-ink">
            Inter — cuerpo limpio y legible para uso diario.
          </p>
          <p className="text-sm text-ink-muted">Texto secundario · jerarquía clara.</p>
          <p className="text-sm text-ink-faint">Texto terciario · detalles y notas.</p>
        </Card>
      </Section>

      {/* Color tokens */}
      <Section title="Paleta" subtitle="Capas de fondo, texto y el acento naranja — en ambos temas (prueba el toggle ☀️/🌙).">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { name: "Fondo 0", cls: "bg-bg-0" },
            { name: "Fondo 1", cls: "bg-bg-1" },
            { name: "Fondo 2", cls: "bg-bg-2" },
            { name: "Fondo 3", cls: "bg-bg-3" },
            { name: "Acento", cls: "bg-accent" },
            { name: "Acento hover", cls: "bg-accent-hover" },
          ].map((s) => (
            <div key={s.name} className="rounded-lg border p-2">
              <div className={`h-14 w-full rounded-md border ${s.cls}`} />
              <p className="mt-2 text-xs text-ink-muted">{s.name}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Progreso */}
      <Section title="Progreso" subtitle="Barras que se llenan al entrar en vista.">
        <Card glowOnHover={false} className="space-y-5">
          <ProgressBar label="Meta de renovaciones" value={72} />
          <ProgressBar label="Capacidad del gym" value={48} />
          <ProgressBar label="Plan anual vendido" value={91} />
        </Card>
      </Section>

      {/* Botones */}
      <Section title="Botones" subtitle="Principal con glow magnético, secundario en vidrio, fantasma.">
        <Card glowOnHover={false} className="flex flex-wrap items-center gap-3">
          <Button>Renovar membresía</Button>
          <Button variant="secondary" magnetic={false}>
            Cancelar
          </Button>
          <Button variant="ghost" magnetic={false}>
            Ver detalles
          </Button>
          <Button loading magnetic={false}>
            Guardando
          </Button>
        </Card>
      </Section>

      {/* Skeletons */}
      <Section title="Carga elegante" subtitle="Skeletons con barrido suave mientras llegan los datos.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Card key={i} glowOnHover={false} className="space-y-3">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-9 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </Card>
          ))}
        </div>
      </Section>

      <footer className="mx-auto max-w-6xl px-4 py-10 text-center text-xs text-ink-faint sm:px-6">
        JM FIT · sistema de diseño · base oscura + naranja energía 🟠
      </footer>
    </div>
  );
}

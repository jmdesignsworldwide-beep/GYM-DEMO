"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { Aurora } from "@/components/Aurora";
import { Logo } from "@/components/ui/Logo";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { signIn } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);

    const result = await signIn(username, password);

    if (result.ok) {
      // Sesión iniciada — al sistema. El layout real llega en la Pieza 3.
      router.push("/");
      router.refresh();
    } else {
      setError(result.message);
      setLoading(false);
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-10">
      {/* Momento de intensidad: la aurora sube de energía en el login */}
      <Aurora intensity="intense" />

      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="glass shadow-card w-full max-w-md rounded-xl p-8 sm:p-10"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo size="lg" />
          <h1 className="mt-6 font-display text-title font-semibold text-ink">
            Bienvenida a JM FIT
          </h1>
          <p className="mt-1.5 text-sm text-ink-muted">
            Inicia sesión para entrar al sistema.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Input
            id="usuario"
            label="Usuario"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="tu usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />

          <Input
            id="contrasena"
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="grid h-9 w-9 place-items-center rounded-md text-ink-faint transition-colors hover:text-ink"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-start gap-2 rounded-lg border border-accent bg-accent-soft px-3 py-2.5 text-sm text-ink"
                role="alert"
              >
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-accent" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <Button type="submit" size="lg" loading={loading} magnetic={false} className="mt-2 w-full">
            {loading ? "Iniciando sesión" : "Iniciar sesión"}
          </Button>
        </form>
      </motion.div>

      <p className="absolute bottom-5 text-xs text-ink-faint">
        JM FIT · sistema de gestión
      </p>
    </main>
  );
}

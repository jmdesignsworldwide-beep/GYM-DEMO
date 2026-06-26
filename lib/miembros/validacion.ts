// Validadores y normalizadores (usados en el servidor y la interfaz).

export function soloDigitos(s: string): string {
  return (s || "").replace(/\D/g, "");
}

export function cedulaValida(s: string): boolean {
  return /^\d{11}$/.test(soloDigitos(s));
}

export function telefonoValido(s: string): boolean {
  return /^(809|829|849)\d{7}$/.test(soloDigitos(s));
}

export function emailValido(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export function formatCedula(s: string): string {
  const d = soloDigitos(s);
  return d.length === 11 ? `${d.slice(0, 3)}-${d.slice(3, 10)}-${d.slice(10)}` : s;
}

export function formatTelefono(s: string): string {
  const d = soloDigitos(s);
  return d.length === 10 ? `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}` : s;
}

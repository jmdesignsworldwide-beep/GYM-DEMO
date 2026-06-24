# JM FIT

Sistema de gestión para el gimnasio **JM FIT** (demo).

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase · Vercel

> Tanda 1A — Infraestructura. Página temporal de verificación de deploy +
> conexión a Supabase. El diseño de marca y los módulos vienen después.

## Variables de entorno

Configurar en Vercel (ver `.env.example`):

| Variable | Visibilidad |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Pública |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Pública |
| `SUPABASE_SERVICE_ROLE_KEY` | **Sensitive — solo servidor, sin `NEXT_PUBLIC_`** |

## Desarrollo local

```bash
npm install
npm run dev
```

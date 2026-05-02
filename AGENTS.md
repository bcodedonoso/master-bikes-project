<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# MasterBikes Web — Agent Guide

## Project Overview

MasterBikes Web is a Next.js 16 application for **MasterBikes | Centro de Ciclismo Profesional**, a business-management platform for a bike shop. It supports:

- **Public catalog**: Product listings for bike gear and high-end bicycles (fetched from Supabase).
- **Customer portal** (`/dashboard/cliente`): Repair requests, bike rentals, in-app purchases, and delivery tracking.
- **Technician dashboard** (`/dashboard/tecnico`): Repair queue management.
- **Dispatch/logistics panel** (`/dashboard/despacho`): Order status updates (pedido_tomado → en_transito → entregado).
- **Supervisor command center** (`/dashboard/supervisor`): Real-time KPIs, sales overview, rental status, and operational alerts via Supabase realtime subscriptions.
- **Supervisor rental control** (`/dashboard/supervisor/arriendo`): Rental hand-off and return management.

All user-facing text and most code comments are in **Spanish**.

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.4 |
| UI Library | React | 19.2.4 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| PostCSS | `@tailwindcss/postcss` | 4.x |
| Database / Auth | Supabase (`@supabase/supabase-js`) | 2.x |
| Email (optional) | Resend (`resend`) | 6.x |
| Linting | ESLint (`eslint-config-next`) | 9.x |
| Fonts | Geist & Geist Mono (via `next/font/google`) | — |

## Project Structure

```
app/
├── layout.tsx              # Root layout (Spanish lang, Geist fonts, favicon)
├── page.tsx                # Public home / sales catalog
├── globals.css             # Tailwind import + CSS variables
├── login/page.tsx          # Login & registration (Supabase Auth)
├── components/
│   ├── ComprarBtn.tsx      # Client buy button (creates despacho + venta)
│   └── ThemeToggle.tsx     # Manual dark/light class toggler (not mounted in layout)
└── dashboard/
    ├── cliente/page.tsx           # Customer dashboard
    ├── cliente/despachos/page.tsx # Customer delivery tracking
    ├── despacho/page.tsx          # Logistics admin
    ├── supervisor/page.tsx        # Supervisor KPI dashboard
    ├── supervisor/arriendo/page.tsx # Rental admin
    └── tecnico/page.tsx           # Technician repair queue
public/
├── favicon.ico
└── logo.png
```

**No `app/api/` directory exists.** The login page references `fetch('/api/email')`, but the API route is missing. Registration currently attempts the fetch and falls back to a UI message if it fails.

## Build and Development Commands

```bash
# Install dependencies
npm install

# Development server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint
npm run lint
```

## Runtime Architecture

### Routing
Uses the **Next.js App Router** (`app/` directory). Every dashboard page is a distinct route with nested layouts inheriting from `app/layout.tsx`.

### Data Flow
- All data access is done **directly from the client** (and Server Components where marked `async`) using the Supabase JS client.
- There is **no backend API layer** in this project (no Route Handlers).
- The supervisor dashboard uses **Supabase Realtime** (`supabase.channel`) to listen to PostgreSQL changes on `ventas`, `reparaciones`, `despachos`, and `arriendos`.

### Component Types
- Most interactive pages are **`"use client"`** components because they use `useState`, `useEffect`, and Supabase auth.
- The home page (`page.tsx`) is an **async Server Component** that fetches the product catalog at request time.

## Database / Supabase Schema

The app expects a Supabase project with at least these **public** tables:

| Table | Key Columns | Usage |
|---|---|---|
| `productos` | `id`, `nombre`, `descripcion`, `precio`, `precio_diario`, `categoria`, `tipo` (`'venta'` / `'arriendo'`) | Catalog source for home page, customer shop, and rental selector |
| `reparaciones` | `id`, `cliente_id`, `descripcion_problema`, `estado`, `fecha_solicitud` | Repair tickets |
| `arriendos` | `id`, `cliente_id`, `producto_id`, `fecha_inicio`, `fecha_fin`, `cantidad`, `monto_total`, `estado` | Rental reservations |
| `ventas` | `id`, `monto_total`, `tipo_servicio`, `fecha` | Sales transactions |
| `despachos` | `id`, `cliente_id`, `detalle`, `direccion`, `estado` | Delivery/shipment tracking |

**Auth**: Uses Supabase Auth (`signInWithPassword`, `signUp`, `signOut`, `getUser`).

## Environment Variables

Required in `.env.local` (already gitignored):

```bash
NEXT_PUBLIC_SUPABASE_URL=<supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
# RESEND_API_KEY is likely also expected for the email API route if implemented
```

**Security note**: The Supabase anon key is exposed to the browser because the client talks directly to Supabase. Row Level Security (RLS) must be configured in Supabase to protect data.

## Code Style Guidelines

- **Language**: All UI strings and inline comments are in **Spanish**. Maintain this convention.
- **Styling**: Tailwind CSS utility classes exclusively. Dark-mode support uses manual `dark:` prefixes and `dark` class toggling on `<html>` (see `ThemeToggle.tsx`).
- **Typography**: Heavy use of `font-black`, `font-bold`, uppercase tracking, and rounded cards (`rounded-2xl`, `rounded-3xl`).
- **Types**: Uses `any[]` for state arrays. Prefer stricter types when adding new features.
- **Supabase client**: Instantiated per file with `createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)`.

## Testing

- **No test framework is installed.** There are no unit tests, integration tests, or E2E tests.
- If you add tests, install a runner (e.g., Vitest, Jest, or Playwright) and update `package.json` scripts accordingly.

## Security Considerations

- **No API routes**: All Supabase queries run from the client. Ensure RLS policies are active.
- **Env file committed?** `.env.local` is gitignored, but verify secrets are not committed.
- **Email endpoint missing**: The `/api/email` route referenced in `app/login/page.tsx` does not exist. If implemented, protect it against abuse (rate limiting, auth checks).
- **No input sanitization** is visible in forms; rely on Supabase parameterized queries (they are used) and validate inputs on the client.

## Deployment

Standard Next.js deployment on **Vercel** (or any platform supporting the App Router).

1. Set environment variables in the hosting platform.
2. Run `npm run build`.
3. Output is static + SSR via Next.js. No custom server configuration is present.

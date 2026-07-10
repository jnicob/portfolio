---
name: nextjs-static-dual
description: Next.js 16 App Router with dual runtime — static export (default) and optional Node mode. Use when creating routes/pages, choosing RSC vs client components, or touching next.config, route handlers, images or anything runtime-dependent.
metadata:
  auto-invoke: 'App Router, RSC vs client, static export, output export, route handlers, SSR, dual runtime, hosting'
---

# Next.js static-first dual runtime

## Model

- `resolveOutputMode(process.env)` (`apps/web/src/lib/output-mode.ts`) decides the mode:
  `export` (default) or `node` (`NEXT_OUTPUT_MODE=node`). Components NEVER branch on this —
  only config and the playground adapter selection do.
- Write every feature so it works in static export. Node mode only ADDS capabilities
  (SSR, `/api/ai-proxy`); it must never be required for a page to render.

## Static export restrictions (the default — respect them everywhere)

- No dynamic route handlers, no server actions at request time, no middleware at runtime,
  no `headers()`/`cookies()`, no ISR.
- Every dynamic segment needs `generateStaticParams` (e.g. `[locale]`, `projects/[slug]`).
- `images.unoptimized = true` in export mode: pre-size images, provide width/height,
  use modern formats committed to the repo (or generated at build time).
- Root `/` redirect to a locale must be a static HTML meta-refresh page or client redirect.

## RSC vs client

- Default to Server Components (they render fine at build time in export mode).
- `"use client"` only for interactivity (theme switcher, playground form, lightbox, slider).
- Keep client islands small and at the leaves; pass data down from server components.

## Node-only surface

- `/api/ai-proxy` route handler (playground live-premium) exists but is excluded from the
  build in export mode. Anything server-secret-dependent belongs ONLY here.

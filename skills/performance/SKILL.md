---
name: performance
description: Core Web Vitals, image discipline, bundle budget and code splitting for a static-first Next.js site. Use when adding dependencies, images, fonts, client components, or investigating slowness.
metadata:
  auto-invoke: 'performance, Core Web Vitals, LCP, bundle size, images, code splitting, Lighthouse'
---

# Performance

## Budgets (CI-enforced in Phase 6, respected always)

- Lighthouse (mobile, static build): Performance > 90, A11y = 100, Best Practices > 95, SEO > 95.
- First Load JS per route: ≤ 130 kB gzip. New dependency > 10 kB gzip needs justification
  in the PR/commit body (and prefer dynamic import).

## Images & media

- Static export ⇒ no server optimizer: commit pre-sized modern formats (AVIF/WebP) with
  explicit width/height (no CLS). Mock playground media: images ≤ 200 kB, videos ≤ 2 MB
  (H.264/AV1, `preload="none"`, poster image).
- LCP element (hero) preloaded/priority; below-the-fold media lazy.

## JS discipline

- Server Components by default; client islands at the leaves (see `nextjs-static-dual`).
- Heavy client-only pieces (lightbox, slider, playground panel) load via `next/dynamic`.
- Fonts: `next/font` self-hosted subsets, `display: swap`, max 2 families.

## Verify

`pnpm --filter web build` prints route sizes — check them on every feature. Run Lighthouse
locally on `out/` before phase close (`pnpm dlx serve apps/web/out`).

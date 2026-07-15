# STATUS — nicobehm portfolio

> Actualizado: 2026-07-15 · por /checkpoint

## Ahora

**Fase 3 COMPLETA y mergeada a main** (`27a933d..ecb17b7`, 48 commits, FF + push):
contenido+páginas+i18n+SEO (A) · media-kit **0.4.0** (C) · theming v2 con 4 skins y 3
vistas de CV (B). Verificación en vivo (Playwright sobre el export), design review y
code review final "Ready to merge: Yes" con todos los blockers resueltos.
**Siguiente fase: F4 (playground) — falta brainstorm/spec y plan.**

## Hecho

- ✅ Fases 0–3 (ver roadmap). F3: es/en bajo `[locale]`, datos Zod sin PII
  (`content/cv/` en .gitignore), 3 case studies MDX, SEO completo (hreflang/sitemap/OG),
  4 skins AA-verificados (8 combos), `lib/appearance.ts` (URL>storage>default),
  FilterableList + skin-switcher, CV standard/compact(print)/timeline + compartir vista.
- ✅ media-kit 0.4.0: fix pan con ratón, compare-lightbox (`compare`+`dragTarget`),
  `MediaSource` (src/fullSrc según pantalla + preload), `expand` por ejemplo,
  `pauseOnClick`, overlayLabels/objectFit/loading. Sin breaking.
- ✅ Gate: 333 tests, builds duales export/node, greps de PII/colores limpios.

## Siguiente acción

1. Brainstorm F4 (playground) con `superpowers:brainstorming` → spec
   `docs/superpowers/specs/2026-07-<dd>-phase-4-playground-design.md` (leer antes
   spec de producto §playground y contratos F3→F4 del roadmap).
2. Plan con `superpowers:writing-plans` → ejecutar con subagent-driven-development
   (rama `feature/phase-4-playground`; gate `pnpm run lint && pnpm run typecheck && pnpm run test`).
3. Incluir en F4 la tarea de limpieza del backlog F3 (ledger `.superpowers/sdd/progress.md`,
   entrada "F3 Task 26"): sweep `z.url()`, consistencia (props muertas, contacto
   triplicado, SITE_URL x3), guard `NEXT_PUBLIC_SITE_URL` en build prod.

## Pendientes del usuario (no bloqueantes)

- Dominio definitivo + fijar `NEXT_PUBLIC_SITE_URL` (SEO apunta a placeholder).
- Publicar `@nicobehm/media-kit` en npm (0.4.0 lista).
- Upgrade Node 22 (retirar pins de `docs/decisions/2026-07-10-dependency-pins.md`).

## Fuentes de verdad

- Roadmap: [docs/superpowers/plans/2026-07-10-portfolio-roadmap.md](docs/superpowers/plans/2026-07-10-portfolio-roadmap.md)
- Spec producto: [docs/superpowers/specs/2026-07-10-portfolio-design.md](docs/superpowers/specs/2026-07-10-portfolio-design.md)
- Plan F3 (hecha): [docs/superpowers/plans/2026-07-15-phase-3-content-theming.md](docs/superpowers/plans/2026-07-15-phase-3-content-theming.md)
- Ledger SDD: `.superpowers/sdd/progress.md`

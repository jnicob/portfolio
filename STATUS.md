# STATUS — nicobehm portfolio

> Actualizado: 2026-07-16 · tras feedback de contenido del usuario

## Ahora

**Fase 3 COMPLETA y mergeada a main**. El usuario revisó el sitio (2026-07-16) y dio
feedback de contenido → **nueva fase 3.5 (Contenido v2) antes de F4**, decisiones
registradas en el spec maestro §2.1 (home reordenada, +1.000 PRs solo a nivel global,
proyectos Backoffice + todo el CV de LinkedIn, skills ampliadas, fixes UI del header).
LinkedIn ya entregado en `apps/web/content/cv/linkedin*.pdf`. Exploración de repos
Freepik (Backoffice + fc_freepik_web) hecha con resúmenes clean-room.
**Siguiente fase: F3.5 (plan just-in-time con writing-plans) → luego F4 (playground).**

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

1. Resolver con el usuario las 2 dudas abiertas de §2.1 del spec maestro: qué es
   "Playground" en destacados (¿el de fc_freepik_web live o el propio de F4?) y el
   comentario truncado de Showcase ("sigue habiendo…").
2. Plan F3.5 con `superpowers:writing-plans` desde spec maestro §2.1 + notas de
   exploración en `apps/web/content/cv/` → ejecutar con subagent-driven-development
   (rama `feature/phase-3.5-content-v2`; gate `pnpm run lint && pnpm run typecheck && pnpm run test`).
3. Incluir en F3.5 la limpieza del backlog F3 (ledger `.superpowers/sdd/progress.md`,
   "F3 Task 26"): sweep `z.url()`, consistencia (props muertas, contacto triplicado,
   SITE_URL x3), guard `NEXT_PUBLIC_SITE_URL` en build prod.
4. Después: brainstorm F4 (playground) → spec → plan, como estaba previsto.

## Pendientes del usuario (no bloqueantes)

- Dominio definitivo + fijar `NEXT_PUBLIC_SITE_URL` (SEO apunta a placeholder).
- Publicar `@nicobehm/media-kit` en npm (0.4.0 lista).
- Upgrade Node 22 (retirar pins de `docs/decisions/2026-07-10-dependency-pins.md`).

## Fuentes de verdad

- Roadmap: [docs/superpowers/plans/2026-07-10-portfolio-roadmap.md](docs/superpowers/plans/2026-07-10-portfolio-roadmap.md)
- Spec producto: [docs/superpowers/specs/2026-07-10-portfolio-design.md](docs/superpowers/specs/2026-07-10-portfolio-design.md)
- Plan F3 (hecha): [docs/superpowers/plans/2026-07-15-phase-3-content-theming.md](docs/superpowers/plans/2026-07-15-phase-3-content-theming.md)
- Ledger SDD: `.superpowers/sdd/progress.md`

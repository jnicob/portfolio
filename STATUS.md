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

1. ✅ Usuario eligió TODOS los componentes de impacto visual (2026-07-16) — F3.6 acotada.
2. Plan F3.5 (Contenido v2) con `superpowers:writing-plans` desde spec maestro §2.1 +
   notas de exploración en `apps/web/content/cv/` → ejecutar con
   subagent-driven-development (rama `feature/phase-3.5-content-v2`; gate
   `pnpm run lint && pnpm run typecheck && pnpm run test`).
3. Incluir en F3.5 la limpieza del backlog F3 (ledger `.superpowers/sdd/progress.md`,
   "F3 Task 26"): sweep `z.url()`, consistencia (props muertas, contacto triplicado,
   SITE_URL x3), guard `NEXT_PUBLIC_SITE_URL` en build prod.
4. Plan F3.6 (Showcase UX v2 + media-kit 0.5) tras cerrar la selección de componentes.
5. Después: brainstorm F4 (playground) → spec → plan, como estaba previsto.

Dudas 2026-07-16 resueltas por el usuario: Playground destacado = el de fc_freepik_web
(independiente o parte destacada del case study API); Flows API → sección "integración"
del case study de la plataforma; alcance API incluye stock/estado, no solo IA.

## Pendientes del usuario (no bloqueantes)

- Dominio definitivo + fijar `NEXT_PUBLIC_SITE_URL` (SEO apunta a placeholder).
- Publicar `@nicobehm/media-kit` en npm (0.4.0 lista).
- Upgrade Node 22 (retirar pins de `docs/decisions/2026-07-10-dependency-pins.md`).

## Fuentes de verdad

- Roadmap: [docs/superpowers/plans/2026-07-10-portfolio-roadmap.md](docs/superpowers/plans/2026-07-10-portfolio-roadmap.md)
- Spec producto: [docs/superpowers/specs/2026-07-10-portfolio-design.md](docs/superpowers/specs/2026-07-10-portfolio-design.md)
- Plan F3 (hecha): [docs/superpowers/plans/2026-07-15-phase-3-content-theming.md](docs/superpowers/plans/2026-07-15-phase-3-content-theming.md)
- Ledger SDD: `.superpowers/sdd/progress.md`

# STATUS — nicobehm portfolio

> Actualizado: 2026-07-18 · por /checkpoint (F3.6 mergeada; F3.7 conjunta definida, sin empezar)

## Ahora

**F3.6 (Showcase UX v2 + media-kit 0.5) CERRADA** y mergeada FF a `main` (+push).
T21 ejecutada completa: gate verde (media-kit 186 + web 336 tests, lint, typecheck,
builds duales), verificación en vivo Playwright sobre el export (todos los fixes del
bloque D confirmados + 0 console errors), design review y qa-a11y-perf con TODOS los
bloqueantes/importantes arreglados y re-verificados, code review final (Fable)
"Ready to merge: Yes".

Fixes de cierre (T29-T31 + orquestador, todos con review):
- **T29**: React #418 en home — `AnimatedMetric` hidrataba `0+` vs SSR `25+` (rama
  server/client en el initializer). Era el console error preexistente de T20.
- **T30** (fixer consolidado de reviews): `formatLike` ya no corrompe métricas no
  numéricas; chips de FilterGallery con tokens `--mk-filter-*` (fallback aditivo) y
  legibles en ambos temas; API player sin idle hueco + etiquetas pending/streaming;
  índice/filtro visible en <lg; `SkillLevel` role=img + nombre accesible de
  MoreProjectsCard → **axe 0 violations y Lighthouse A11y 100**; variantes 840px +
  srcset; one-liners de docs.
- **T31 + orquestador**: `next/dynamic` (ssr:true) en las 6 demos del showcase +
  `preload:false` de Source Serif (solo la usa el skin editorial).

**Gate perf**: mediana Lighthouse showcase **90** (= umbral verde) vs main 91, con
LCP MEJOR que main (3.3s vs 3.5s); medición fiable solo en host ocioso (con carga
varía 65-92). El residuo es TBT de hidratación ligado al **First Load JS
preexistente (273-284 kB gz vs presupuesto 130 kB)** → primera prioridad de F4.

## Hecho

- ✅ Fases 0–3.6 (ver roadmap) · media-kit 0.5.0 lista para npm.
- ✅ F3.6: bloques A+B+C+D + T28-T31. Ledger tarea a tarea: `.superpowers/sdd/progress.md`.

## Siguiente acción

1. **F3.7 CONJUNTA** (decisión Nico 2026-07-18): feedback showcase 2026-07-18 (sección F
   del doc de feedback: retrato fullscreen, lado-a-lado mobile, galería con assets IA
   reales vía AI API, calidad HD+preload fullscreen, scrub UX o sustitución, API player
   rediseñado sin layout shift) + secciones B-E + A6 + backlog design/QA de T21 (ledger).
   Empezar con **brainstorm + plan** (superpowers:brainstorming → writing-plans) en
   sesión nueva — prompt de continuación entregado en el checkpoint 2026-07-18.
   Requisito transversal del plan: listado final de TODAS las features + punteros a
   decisiones técnicas (ver sección "Requisito transversal" del doc de feedback).
2. F4 arrastra: First Load JS >2× presupuesto (palanca real del gate perf), sweep
   z.url()/consistencia, guard NEXT_PUBLIC_SITE_URL, contraste borders 1.4.11.

## Pendientes del usuario (no bloqueantes)

- Dominio definitivo + `NEXT_PUBLIC_SITE_URL` (el build avisa si falta).
- Publicar `@nicobehm/media-kit` 0.5.0 en npm.
- Upgrade Node 22 (retirar pins de `docs/decisions/2026-07-10-dependency-pins.md`).

## Fuentes de verdad

- Plan F3.6 (cerrado): [docs/superpowers/plans/2026-07-17-phase-3.6-showcase-mediakit.md](docs/superpowers/plans/2026-07-17-phase-3.6-showcase-mediakit.md)
- Feedback Nico (A hecho; B-E → F3.7): [docs/superpowers/plans/2026-07-17-feedback-nico-ux-content.md](docs/superpowers/plans/2026-07-17-feedback-nico-ux-content.md)
- Roadmap: [docs/superpowers/plans/2026-07-10-portfolio-roadmap.md](docs/superpowers/plans/2026-07-10-portfolio-roadmap.md) · Ledger SDD: `.superpowers/sdd/progress.md`

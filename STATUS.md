# STATUS — nicobehm portfolio

> Actualizado: 2026-07-17 · por /checkpoint (F3.6 bloques A+B hechos)

## Ahora

**F3.6 (Showcase UX v2 + media-kit 0.5) EN EJECUCIÓN** en rama
`feature/phase-3.6-showcase-mediakit` (sin pushear) con subagent-driven-development.
**Hechas T1-T16 de 21** (commits `c64fd51..fd4fe3f`, cada una con review aprobada):
- **Bloque A completo (T1-T9):** media-kit **0.5.0** — fix foco fullscreen, re-clamp pan,
  tooltips con delay, `compareMode` (wipe/onion/blink/side-by-side), `SpotlightReveal`,
  `FilterGallery`, `VideoScrubPreview`, release con README/CHANGELOG verificados 1:1.
- **Bloque B completo (T10-T16):** assets IA reales (landscape.webp 113 kB, scrub.mp4
  617 kB + póster), colorización real, tabs sin salto (grid apilado), índice que FILTRA
  (ShowcaseView + hash deep-link), radii/estados coherentes, 4 demos nuevas.
Gate verde: media-kit 173 tests · web 256 · lint/typecheck · build estático.
**Siguiente tarea: T17 (AnimatedMetric)** — bloque C (T17-T20) + T21 cierre.

## Hecho

- ✅ Fases 0–3.5 (ver roadmap) · media-kit 0.2.0→0.4.0 en fases previas.
- ✅ F3.6 bloques A y B (arriba). Ledger tarea a tarea: `.superpowers/sdd/progress.md`.

## Siguiente acción

1. Ejecutar bloque C por el plan: T17 AnimatedMetric → T18 TiltCard →
   T19 ApiRequestPlayer → T20 HeroCanvas (subagentes sonnet + review por tarea).
2. T21 cierre: gate + builds duales + export servido, verificación viva (Playwright),
   design review + qa-a11y-perf, review final (modelo top), roadmap/STATUS,
   merge FF a main + push. Notas acumuladas para T21 en el ledger (deriva spec
   120/150 ms de Tabs, tooltip del ojo pre-existente, Minors por tarea).

## Pendientes del usuario (no bloqueantes)

- Dominio definitivo + `NEXT_PUBLIC_SITE_URL` (el build avisa si falta).
- Publicar `@nicobehm/media-kit` en npm (0.5.0 lista en la rama al cerrar F3.6).
- Upgrade Node 22 (retirar pins de `docs/decisions/2026-07-10-dependency-pins.md`).

## Fuentes de verdad

- Plan F3.6 (en curso): [docs/superpowers/plans/2026-07-17-phase-3.6-showcase-mediakit.md](docs/superpowers/plans/2026-07-17-phase-3.6-showcase-mediakit.md)
- Spec F3.6: [docs/superpowers/specs/2026-07-16-phase-3.6-showcase-mediakit-design.md](docs/superpowers/specs/2026-07-16-phase-3.6-showcase-mediakit-design.md)
- Roadmap: [docs/superpowers/plans/2026-07-10-portfolio-roadmap.md](docs/superpowers/plans/2026-07-10-portfolio-roadmap.md) · Spec producto: [docs/superpowers/specs/2026-07-10-portfolio-design.md](docs/superpowers/specs/2026-07-10-portfolio-design.md)
- Ledger SDD (tarea a tarea): `.superpowers/sdd/progress.md`

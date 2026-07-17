# STATUS — nicobehm portfolio

> Actualizado: 2026-07-17 · por /checkpoint (F3.6 bloques A+B+C+D hechos; solo queda T21)

## Ahora

**F3.6 (Showcase UX v2 + media-kit 0.5) CASI CERRADA** en rama
`feature/phase-3.6-showcase-mediakit` (sin pushear, working tree limpio, HEAD `6e5244a`).
**Hechas T1-T20 + bloque D (T22-T27) + fix pre-T21 (T28)** — cada una con review aprobada:
- **Bloques A+B (T1-T16):** media-kit 0.5.0 + showcase UX v2 (ver ledger).
- **Bloque C (T17-T20):** `AnimatedMetric`, `TiltCard`, `ApiRequestPlayer` (+sección
  `api-player`), `HeroCanvas` (fix HiDPI verificado en navegador a DPR 1 y 2).
- **Bloque D (T22-T27, feedback Nico sección A):** BUG onion arreglado (CSS calc:
  `%/100` → `%/100%`), BUG spotlight arreglado (`@property` radius animable, tracking
  1:1), footer al fondo (`min-h-dvh` flex), cursor/hover en Tabs + auditoría A2 de
  cursores, demo scrub con hint + facade lazy (mp4 ya no se descarga sin interacción),
  imágenes ya lazy. A6 (galería ampliada) DIFERIDA a F3.7.
- **T28:** console error `FORMATTING_ERROR`/key cruda del índice resuelto (`t.raw`).
Gate verde: media-kit 182 tests · web 320 · lint/typecheck. **Solo queda T21 (cierre).**

## Hecho

- ✅ Fases 0–3.5 (ver roadmap) · media-kit 0.2.0→0.4.0 en fases previas.
- ✅ F3.6 bloques A, B, C y D + enmiendas de plan (`3ce2400`: T22-T27; i18n
  `sections.apiPlayer.*`). Ledger tarea a tarea: `.superpowers/sdd/progress.md`.

## Siguiente acción

1. **T21 cierre de fase** (checklist en el plan, sección "Task 21"): gate + build
   paquete + builds duales export/node + export servido; verificación en vivo
   (Playwright) incl. fixes del bloque D; design review + qa-a11y-perf; code review
   final de rama (modelo top, `superpowers:requesting-code-review`); roadmap/STATUS;
   merge FF a main + push. Notas acumuladas para T21 al final del ledger.
2. Tras el merge: **F3.7** (feedback secciones B-E + galería A6) con brainstorm + plan
   nuevos junto al usuario — NO empezar en automático.

## Pendientes del usuario (no bloqueantes)

- Dominio definitivo + `NEXT_PUBLIC_SITE_URL` (el build avisa si falta).
- Publicar `@nicobehm/media-kit` en npm (0.5.0 lista al cerrar F3.6).
- Upgrade Node 22 (retirar pins de `docs/decisions/2026-07-10-dependency-pins.md`).

## Fuentes de verdad

- Plan F3.6 (T21 + bloque D): [docs/superpowers/plans/2026-07-17-phase-3.6-showcase-mediakit.md](docs/superpowers/plans/2026-07-17-phase-3.6-showcase-mediakit.md)
- Feedback Nico (A hecho; B-E → F3.7): [docs/superpowers/plans/2026-07-17-feedback-nico-ux-content.md](docs/superpowers/plans/2026-07-17-feedback-nico-ux-content.md)
- Spec F3.6: [docs/superpowers/specs/2026-07-16-phase-3.6-showcase-mediakit-design.md](docs/superpowers/specs/2026-07-16-phase-3.6-showcase-mediakit-design.md)
- Roadmap: [docs/superpowers/plans/2026-07-10-portfolio-roadmap.md](docs/superpowers/plans/2026-07-10-portfolio-roadmap.md) · Ledger SDD: `.superpowers/sdd/progress.md`

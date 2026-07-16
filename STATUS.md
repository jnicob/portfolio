# STATUS — nicobehm portfolio

> Actualizado: 2026-07-17 · por /checkpoint (F3.6 en curso)

## Ahora

**F3.6 (Showcase UX v2 + media-kit 0.5) EN EJECUCIÓN** en rama
`feature/phase-3.6-showcase-mediakit` con subagent-driven-development.
**Hechas T1-T5 de 21** (commits `c64fd51..9ac7089`, cada una con review aprobada):
fix foco fullscreen (el space-pan ya funciona tras ⤢), re-clamp del pan en
resize/fullscreenchange, tooltips con delay en todos los controles, `compareMode`
completo (wipe/onion/blink/side-by-side + passthrough en `expand`).
Gate verde: media-kit 151 tests · web 228 · lint/typecheck.
**Siguiente tarea: T6 (SpotlightReveal)** — luego T7-T9 cierran el bloque A.

## Hecho

- ✅ Fases 0–3.5 (ver roadmap). F3.5: 14 proyectos, +1.000 PRs global, Flows API
  integrado, skills ampliadas, home reordenada, skin picker con selección/hover.
- ✅ Métricas plataforma (25+/40+ verificadas), entrada dev-hub renombrada, favicon `nb`.
- ✅ F3.6: spec propia + plan de 21 tareas + T1-T5 (bloque A parcial).

## Siguiente acción

1. Continuar F3.6 por el plan: T6 SpotlightReveal → T7 FilterGallery → T8
   VideoScrubPreview → T9 release 0.5.0 (fin bloque A; checkpoint si contexto grande).
2. Bloque B (T10-T16): T10 assets la hace el ORQUESTADOR con Magnific MCP
   (paisaje ≤200 kB + clip ≤1.5 MB); OJO T15: montar la demo de modos con
   `key={mode}` (blink inicializa su estado al montar — nota en ledger).
3. Bloque C (T17-T20) → T21 cierre (gate, verificación viva, design review +
   qa-a11y-perf, review final, roadmap/STATUS, merge FF + push).

## Pendientes del usuario (no bloqueantes)

- Dominio definitivo + `NEXT_PUBLIC_SITE_URL` (el build avisa si falta).
- Publicar `@nicobehm/media-kit` en npm (0.5.0 quedará lista al cerrar F3.6).
- Upgrade Node 22 (retirar pins de `docs/decisions/2026-07-10-dependency-pins.md`).

## Fuentes de verdad

- Plan F3.6 (en curso): [docs/superpowers/plans/2026-07-17-phase-3.6-showcase-mediakit.md](docs/superpowers/plans/2026-07-17-phase-3.6-showcase-mediakit.md)
- Spec F3.6: [docs/superpowers/specs/2026-07-16-phase-3.6-showcase-mediakit-design.md](docs/superpowers/specs/2026-07-16-phase-3.6-showcase-mediakit-design.md)
- Roadmap: [docs/superpowers/plans/2026-07-10-portfolio-roadmap.md](docs/superpowers/plans/2026-07-10-portfolio-roadmap.md) · Spec producto: [docs/superpowers/specs/2026-07-10-portfolio-design.md](docs/superpowers/specs/2026-07-10-portfolio-design.md)
- Ledger SDD (tarea a tarea): `.superpowers/sdd/progress.md`

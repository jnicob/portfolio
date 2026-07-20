# STATUS — nicobehm portfolio

> Actualizado: 2026-07-20 · por /checkpoint (F3.8 con spec+plan aprobados, sin empezar)

## Ahora

**F3.8 (Showcase avanzado + detalle de proyectos) PLANIFICADA, sin empezar.**
Brainstorm cerrado → spec (`2b103f0`) + plan de 15 tareas TDD (`0469e87`). En `main`,
working tree limpio, rama feature aún NO creada (la crea la Task 1).

Alcance F3.8 (feedback sección G):

- **G1 — bug tema+idioma** (systematic-debugging): al cambiar idioma tras togglear el
  tema, el tema se revierte. Hipótesis a confirmar: `<html data-theme="dark">` estático
  de `[locale]/layout.tsx` se re-aplica en el remount por locale y `AppearanceInit` no
  restaura por su caché one-shot.
- **G2 — selector de layouts** en la galería IA: grid (actual) + masonry + justified.
  Motor JS de columnas balanceadas con **orden DOM = orden de datos** en `FilterGallery`
  (media-kit **0.6.0 → 0.7.0**, aditivo); máx 4-5 **columnas** responsive. CSS
  multi-column descartado con evidencia (análisis clean-room de pikaso/fc_freepik_web).
- **G3 — API player**: selector de endpoint (imagen/vídeo/audio/error) reutilizando
  assets de la galería; cero layout shift; code viewer/params → F4.
- **G4/G5 — detalles**: MDX es/en clean-room para «Panel de desarrollador de la API»
  (con landings públicas) y «Backoffice de contenido Freepik/Flaticon» (5 subproyectos).
- **Backlog F3.7 (5 de 6)**: onPause sync audio tile, preview dims player, regex
  protocolo-relativo, STACK_BREAKPOINT a module scope, barrel hover-video.

## Hecho

- ✅ Fases 0–3.7 (ver roadmap) · media-kit 0.6.0 lista para npm.
- ✅ F3.8: spec + plan aprobados y commiteados (brainstorm 2026-07-19/20).
- ✅ Ledger tarea a tarea: `.superpowers/sdd/progress.md`.

## Siguiente acción

1. **Ejecutar F3.8** con `superpowers:subagent-driven-development` sobre el plan
   [docs/superpowers/plans/2026-07-20-phase-3.8-advanced-showcase-project-details.md](docs/superpowers/plans/2026-07-20-phase-3.8-advanced-showcase-project-details.md),
   rama `feature/phase-3.8-advanced-showcase-project-details`, TDD tarea a tarea.
   Empezar por Task 1 (crear rama + repro sistemática de G1). Gate por tarea:
   `pnpm run lint && pnpm run typecheck && pnpm run test`.
2. F4 arrastra: First Load JS >2× presupuesto (palanca real del perf) + Escape anidado
   del skin filter (único ítem del backlog F3.7 que NO entra en F3.8).

## Pendientes del usuario (no bloqueantes)

- Dominio definitivo + `NEXT_PUBLIC_SITE_URL` (el build avisa si falta).
- Publicar `@nicobehm/media-kit` 0.6.0 en npm.
- Activar el mensaje de disponibilidad cuando toque (ya visible tras F3.7 — decidir
  momento del deploy).
- Upgrade Node 22 (retirar pins de `docs/decisions/2026-07-10-dependency-pins.md`).

## Fuentes de verdad

- Plan F3.7 (cerrado): [docs/superpowers/plans/2026-07-18-phase-3.7-showcase-ux-content.md](docs/superpowers/plans/2026-07-18-phase-3.7-showcase-ux-content.md) — incluye el **inventario transversal de features + punteros**
- Spec F3.7: [docs/superpowers/specs/2026-07-18-phase-3.7-showcase-ux-content-design.md](docs/superpowers/specs/2026-07-18-phase-3.7-showcase-ux-content-design.md)
- Feedback Nico (A-F hechos; **G → F3.8**): [docs/superpowers/plans/2026-07-17-feedback-nico-ux-content.md](docs/superpowers/plans/2026-07-17-feedback-nico-ux-content.md)
- Roadmap: [docs/superpowers/plans/2026-07-10-portfolio-roadmap.md](docs/superpowers/plans/2026-07-10-portfolio-roadmap.md) · Ledger SDD: `.superpowers/sdd/progress.md`

# STATUS — nicobehm portfolio

> Actualizado: 2026-07-20 · por /checkpoint (F3.8 en curso vía Codex, Bloques 1-2 revisados)

## Ahora

**F3.8 (Showcase avanzado + detalle de proyectos) EN CURSO.** Ejecutada por **Codex CLI**
(interactivo) con **review por bloques por Claude** (design + code) + git/checkpoint. Rama
`feature/phase-3.8-advanced-showcase-project-details` pusheada a origin; **sin merge a main**
(se difiere al cierre de fase). HEAD `82dd2c0`, working tree limpio.

- **Bloque 1 (T1-7)** ✅ revisado: fix G1 (bug tema+idioma) + motor masonry/justified
  (media-kit **0.7.0**) + selector de layouts + skill `masonry-layouts`.
- **Bloque 2 (fixes Review 1 + T8-13)** ✅ revisado: unificación selector, reflow, densidad;
  API player con 4 ejemplos + previews/fullscreen; detalles G4/G5; backlog mecánico.
- Code reviews: 0 Critical / 0 Important. Design reviews: fix-first.

## Hecho

- ✅ Fases 0–3.7 (ver roadmap) · media-kit 0.6.0 en npm-ready (0.7.0 en la feature branch).
- ✅ F3.8 Bloques 1-2 (T1-13 + fixes Review 1): commits hasta `82dd2c0`, pusheados a origin.
- ✅ Veredictos de review por bloque en el ledger `.superpowers/sdd/progress.md`.

## Siguiente acción

1. **Bloque 3 (mañana, vía Codex) — Fase A:** arreglar los 3 Majors de UI del Review 2
   (badge error → `danger`; viñetas de `prose-portfolio`; salto de reflow en `grid`; detalle
   en el ledger «F3.8 REVIEW 2»). Luego **T14-15** del plan
   [docs/superpowers/plans/2026-07-20-phase-3.8-advanced-showcase-project-details.md](docs/superpowers/plans/2026-07-20-phase-3.8-advanced-showcase-project-details.md):
   inventario transversal + cierre. Gate por tarea: `pnpm run lint && pnpm run typecheck && pnpm run test`.
2. **Review final por Claude** (design-reviewer + qa-a11y-perf + code-reviewer) sobre la rama
   completa → **merge FF a main** + cierre (roadmap ✅, feedback G resuelto, STATUS a F4).
3. F4 arrastra: First Load JS >2× presupuesto (palanca real del perf) + Escape anidado del
   skin filter (único ítem del backlog F3.7 fuera de F3.8).

## Pendientes del usuario (no bloqueantes)

- Dominio definitivo + `NEXT_PUBLIC_SITE_URL` (el build avisa si falta).
- Publicar `@nicobehm/media-kit` en npm.
- Momento del deploy del badge de disponibilidad (visible desde F3.7).
- Upgrade Node 22 (retirar pins de `docs/decisions/2026-07-10-dependency-pins.md`).
- ¿Subir el skill `masonry-layouts` a ai-config? (recomendado; no propagado aún).

## Fuentes de verdad

- Plan F3.8: [docs/superpowers/plans/2026-07-20-phase-3.8-advanced-showcase-project-details.md](docs/superpowers/plans/2026-07-20-phase-3.8-advanced-showcase-project-details.md)
- Spec F3.8 (§0 log del brainstorm): [docs/superpowers/specs/2026-07-19-phase-3.8-advanced-showcase-project-details-design.md](docs/superpowers/specs/2026-07-19-phase-3.8-advanced-showcase-project-details-design.md)
- Feedback Nico (A-F hechos; **G → F3.8**): [docs/superpowers/plans/2026-07-17-feedback-nico-ux-content.md](docs/superpowers/plans/2026-07-17-feedback-nico-ux-content.md)
- Roadmap: [docs/superpowers/plans/2026-07-10-portfolio-roadmap.md](docs/superpowers/plans/2026-07-10-portfolio-roadmap.md) · Ledger SDD: `.superpowers/sdd/progress.md`

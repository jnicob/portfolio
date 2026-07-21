# STATUS — nicobehm portfolio

> Actualizado: 2026-07-21 · F3.8 cerrada por Codex, pendiente review final y merge

## Ahora

**F3.8 (Showcase avanzado + detalle de proyectos) CERRADA POR CODEX.**
Implementada por **Codex CLI** con review por bloques por Claude. Rama
`feature/phase-3.8-advanced-showcase-project-details`; **sin merge a main**.

- **Bloque 1 (T1-7)** ✅ revisado: fix G1 (bug tema+idioma) + motor masonry/justified
  (media-kit **0.7.0**) + selector de layouts + skill `masonry-layouts`.
- **Bloque 2 (fixes Review 1 + T8-13)** ✅ revisado: unificación selector, reflow, densidad;
  API player con 4 ejemplos + previews/fullscreen; detalles G4/G5; backlog mecánico.
- **Bloque 3 (Fase A + T14-15)** ✅: fixes del Review 2, inventario, gates, builds,
  verificación en vivo y cierre documental.
- Code reviews: 0 Critical / 0 Important. Design reviews: fix-first.
- Review final de rama + merge: pendientes y reservados para Claude Code.

## Hecho

- ✅ Fases 0–3.8 implementadas (ver roadmap) · media-kit 0.6.0 en npm-ready (0.7.0 en
  la feature branch).
- ✅ F3.8 T1-15 + fixes de los Reviews 1-2 implementados y verificados en la feature branch.
- ✅ Veredictos de review por bloque en el ledger `.superpowers/sdd/progress.md`.

## Siguiente acción

1. **Review final por Claude** (design-reviewer + qa-a11y-perf + code-reviewer) sobre la rama
   completa → **merge FF a main**. Codex no hace ese review ni el merge.
2. **F4 — Playground**, después del review/merge de F3.8.
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
- Feedback Nico (**A-G resuelto**): [docs/superpowers/plans/2026-07-17-feedback-nico-ux-content.md](docs/superpowers/plans/2026-07-17-feedback-nico-ux-content.md)
- Roadmap: [docs/superpowers/plans/2026-07-10-portfolio-roadmap.md](docs/superpowers/plans/2026-07-10-portfolio-roadmap.md) · Ledger SDD: `.superpowers/sdd/progress.md`

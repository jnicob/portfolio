# STATUS — nicobehm portfolio

> Actualizado: 2026-07-13 · por /checkpoint

## Ahora

Fase 2.5 — media-kit v2 (zoom/pan/pinch, toolbar auto-hide, fit modes,
fullscreen nativo, slider hover). Planificada, **no empezada**.

## Hecho

- ✅ Fase 0 — fundaciones del monorepo (pnpm, Next.js 16, tooling, agent config).
- ✅ Fase 1 — design system (tokens semánticos, dark/light, acento violeta).
- ✅ Fase 2 — `@nicobehm/media-kit` v0.1.0 (CompareSlider + MediaLightbox, 0 deps)
  + demo en /showcase. Merge FF `ac82e8a..c774005`, en `github.com:jnicob/portfolio`.

## Siguiente acción

1. `git checkout main && git pull`
2. Crear rama `feature/phase-2.5-media-kit-v2`
3. Ejecutar el plan tarea-por-tarea (superpowers:subagent-driven-development
   recomendado, o executing-plans):
   `docs/superpowers/plans/2026-07-13-phase-2.5-media-kit-v2.md`
4. Gate por tarea: `pnpm run lint && pnpm run typecheck && pnpm run test`
5. Task 10 = cierre estándar (design review + code review + roadmap + merge FF).

## Pendientes del usuario (no bloqueantes)

- Export PDF de LinkedIn (experiencia previa + formación).
- Dominio definitivo.
- Decisión: publicar `@nicobehm/media-kit` en npm.

## Fuentes de verdad

- Roadmap: [docs/superpowers/plans/2026-07-10-portfolio-roadmap.md](docs/superpowers/plans/2026-07-10-portfolio-roadmap.md)
- Spec vigente (F2.5): [docs/superpowers/specs/2026-07-13-media-kit-v2-design.md](docs/superpowers/specs/2026-07-13-media-kit-v2-design.md)
- Plan vigente (F2.5): [docs/superpowers/plans/2026-07-13-phase-2.5-media-kit-v2.md](docs/superpowers/plans/2026-07-13-phase-2.5-media-kit-v2.md)

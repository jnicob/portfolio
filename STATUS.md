# STATUS — nicobehm portfolio

> Actualizado: 2026-07-14 · por /checkpoint

## Ahora

Fase 2.5 — media-kit v2 **completa y mergeada a main**. Sin fase en curso;
lista para planificar la Fase 3 (contenido + páginas).

## Hecho

- ✅ Fase 0 — fundaciones del monorepo (pnpm, Next.js 16, tooling, agent config).
- ✅ Fase 1 — design system (tokens semánticos, dark/light, acento violeta).
- ✅ Fase 2 — `@nicobehm/media-kit` v0.1.0 (CompareSlider + MediaLightbox, 0 deps)
  - demo en /showcase. Merge FF `ac82e8a..c774005`, en `github.com:jnicob/portfolio`.
- ✅ Infra de estado — STATUS.md + /checkpoint v2 (`3c0b781..69f9757`) y setup portable
  `github.com:jnicob/ai-config` (privado: AGENTS.md global, memorias curadas, install.sh).
- ✅ Fase 2.5 — media-kit **v0.2.0**: zoom/pan/pinch, toolbar auto-hide + fit modes,
  fullscreen nativo, slider `mode="hover"`. Cierre con design review + code review (Opus)
  - verificación visual en vivo (Playwright); todos los Critical/Important resueltos
    (aprobado "todo el design review": cerrar persistente arriba-derecha, aria-live fuera de
    `inert`, glifo de fit, marco del slider). Merge FF `da042c6..24f79b2`.

## Siguiente acción

1. `git checkout main && git pull` (ya en `24f79b2`, sincronizado con origin).
2. Planificar la Fase 3 (contenido + páginas: Zod, datos CV, MDX case studies, i18n, SEO):
   `superpowers:brainstorming` → `superpowers:writing-plans`, con roadmap + spec como entrada.
3. Ejecutar con `superpowers:subagent-driven-development`, TDD estricto, alcance cerrado al plan.
4. Gate por tarea: `pnpm run lint && pnpm run typecheck && pnpm run test`.
5. Cierre estándar (design review + code review + roadmap + merge FF).

## Pendientes del usuario (no bloqueantes)

- Export PDF de LinkedIn (experiencia previa + formación) — necesario para Fase 3 (CV).
- Dominio definitivo.
- Decisión: publicar `@nicobehm/media-kit` (0.2.0) en npm.
- Backlog diferido F2.5 (a v3): galería multi-imagen/prev-next; chevrons SVG del grip;
  foto bitmap real en la demo; exponer `canPan` live para las flechas.

## Fuentes de verdad

- Roadmap: [docs/superpowers/plans/2026-07-10-portfolio-roadmap.md](docs/superpowers/plans/2026-07-10-portfolio-roadmap.md)
- Spec producto: [docs/superpowers/specs/2026-07-10-portfolio-design.md](docs/superpowers/specs/2026-07-10-portfolio-design.md)
- Spec/plan F2.5: [docs/superpowers/specs/2026-07-13-media-kit-v2-design.md](docs/superpowers/specs/2026-07-13-media-kit-v2-design.md) · [docs/superpowers/plans/2026-07-13-phase-2.5-media-kit-v2.md](docs/superpowers/plans/2026-07-13-phase-2.5-media-kit-v2.md)

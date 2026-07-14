# STATUS — nicobehm portfolio

> Actualizado: 2026-07-14 · por /checkpoint

## Ahora

Fase 2.6 — media-kit v2.1 + showcase polish. **Spec aprobado, plan NO escrito, sin empezar.**
Fase 2.5 (media-kit v2) completa y mergeada a main.

## Hecho

- ✅ Fase 0 — fundaciones del monorepo (pnpm, Next.js 16, tooling, agent config).
- ✅ Fase 1 — design system (tokens semánticos, dark/light, acento violeta).
- ✅ Fase 2 — `@nicobehm/media-kit` v0.1.0 (CompareSlider + MediaLightbox, 0 deps)
  - demo en /showcase. Merge FF `ac82e8a..c774005`, en `github.com:jnicob/portfolio`.
- ✅ Infra de estado — STATUS.md + /checkpoint v2 (`3c0b781..69f9757`) y setup portable
  `github.com:jnicob/ai-config` (privado: AGENTS.md global, memorias curadas, install.sh).
- ✅ Fase 2.5 — media-kit **v0.2.0**: zoom/pan/pinch, toolbar auto-hide + fit modes,
  fullscreen nativo, slider `mode="hover"`. Cierre con design + code review (Opus) +
  verificación visual en vivo; cerrar persistente arriba-derecha, aria-live fuera de `inert`,
  glifo de fit, marco del slider. Merge FF `da042c6..24f79b2`.
- ✅ Spec F2.6 aprobado (`fab7c14`) — falta escribir el plan.

## Siguiente acción

1. `git checkout main && git pull`; crear rama `feature/phase-2.6-media-kit-v2.1`.
2. Escribir el plan con `superpowers:writing-plans` desde el spec F2.6 →
   `docs/superpowers/plans/2026-07-14-phase-2.6-media-kit-v2.1.md`.
3. Ejecutar con `superpowers:subagent-driven-development`, TDD estricto, alcance cerrado al plan.
   (B4 genera un retrato con Magnific → optimizar → `apps/web/public/demo/`.)
4. Gate por tarea: `pnpm run lint && pnpm run typecheck && pnpm run test`.
5. Cierre estándar (grep colores + design review + code review + verificación en vivo +
   roadmap + merge FF). media-kit → `0.3.0`.

## Pendientes del usuario (no bloqueantes)

- **CV:** PDFs (es/en) en `apps/web/content/cv/` **sin trackear** — contienen PII (teléfono,
  email). Decidir antes de commitear: `.gitignore` / redactar / commitear. Mejora de contenido
  del CV → al construir la página en Fase 3.
- Dominio definitivo · Decisión: publicar `@nicobehm/media-kit` en npm.
- Backlog v3: galería multi-imagen/prev-next; chevrons SVG del grip; `canPan` live para flechas;
  zoom+compare combinados.
- Fase 3: selector de estilos (fijable por URL, para compartir el CV) + selector auto-filtrable
  del showcase reutilizable como base; i18n es/en; contenido/página de CV.

## Fuentes de verdad

- Roadmap: [docs/superpowers/plans/2026-07-10-portfolio-roadmap.md](docs/superpowers/plans/2026-07-10-portfolio-roadmap.md)
- Spec producto: [docs/superpowers/specs/2026-07-10-portfolio-design.md](docs/superpowers/specs/2026-07-10-portfolio-design.md)
- Spec vigente (F2.6): [docs/superpowers/specs/2026-07-14-media-kit-v2.1-showcase-design.md](docs/superpowers/specs/2026-07-14-media-kit-v2.1-showcase-design.md)
- F2.5 (referencia): [docs/superpowers/specs/2026-07-13-media-kit-v2-design.md](docs/superpowers/specs/2026-07-13-media-kit-v2-design.md)

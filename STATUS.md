# STATUS — nicobehm portfolio

> Actualizado: 2026-07-14 · por /checkpoint

## Ahora

**Fase 2.6 COMPLETA y mergeada a main.** Siguiente fase: F3 (contenido + páginas) — sin spec ni plan aún.

## Hecho

- ✅ Fase 0 — fundaciones · Fase 1 — design system · Fase 2 — media-kit v0.1.0 · Fase 2.5 — media-kit v0.2.0 (ver roadmap).
- ✅ Infra de estado — STATUS.md + /checkpoint v2 + setup portable `github.com:jnicob/ai-config`.
- ✅ **Fase 2.6 — media-kit v0.3.0 + showcase polish** (17 commits, merge FF `fa00854..c8c46f8`, pusheado):
  - B1 pan con `Espacio` (cursor grab/grabbing) · B2 help box de teclado (`?`, Escape con precedencia) ·
    B3 toggle ojo/ojo-tachado SVG + tooltips CSS · B4 demo retrato IA color/B-N (68 kB webp) con
    fullscreen nativo del slider · C1 Tabs sin desmontar (`hidden`) · C2 showcase (índice lateral,
    intros, estados vacío/error/disabled, `:active`).
  - Skill nuevo `skills/code-conventions/` (TS + React + estilo + tests, genérico) + routing en AGENTS.md.
  - Cierre completo: gate verde, grep colores limpio, builds duales, verificación Playwright en vivo
    (ambos temas + teclado completo), design review (Opus) y code review final — bloqueantes resueltos
    (`d61d75f`, `a4c5c10`). Ledger detallado: `.superpowers/sdd/progress.md`.

## Siguiente acción

1. Brainstorm de Fase 3 con `superpowers:brainstorming` (contenido + páginas: Zod, datos CV, MDX case
   studies, i18n es/en, SEO) — incluye el selector de estilos por URL y el selector auto-filtrable del
   showcase (diferidos de F2.6). Entrada: roadmap + spec de producto.
2. Spec aprobado → plan con `superpowers:writing-plans` → ejecutar con subagent-driven-development.
3. Antes de F3: decidir el tratamiento del PII de los CVs (bloquea la página de CV).

## Pendientes del usuario (no bloqueantes)

- **CV:** PDFs (es/en) en `apps/web/content/cv/` **sin trackear** — PII (teléfono, email). Decidir:
  `.gitignore` / redactar / commitear.
- Dominio definitivo · Decisión: publicar `@nicobehm/media-kit` en npm (0.3.0 lista).
- Backlog v2.2/v3 del paquete (anotado en ledger F2.6): iconos toolbar unificados en SVG, Tabs
  grid-stack (cero shift real), precedencia de capas en click de overlay, foco condicional al cerrar
  ayuda, tests blur-release/Tab-cycle, EmptyState/ErrorState reutilizable, scrim del botón del retrato.

## Fuentes de verdad

- Roadmap: [docs/superpowers/plans/2026-07-10-portfolio-roadmap.md](docs/superpowers/plans/2026-07-10-portfolio-roadmap.md)
- Spec producto: [docs/superpowers/specs/2026-07-10-portfolio-design.md](docs/superpowers/specs/2026-07-10-portfolio-design.md)
- F2.6 (hecha): spec [docs/superpowers/specs/2026-07-14-media-kit-v2.1-showcase-design.md](docs/superpowers/specs/2026-07-14-media-kit-v2.1-showcase-design.md) · plan [docs/superpowers/plans/2026-07-14-phase-2.6-media-kit-v2.1.md](docs/superpowers/plans/2026-07-14-phase-2.6-media-kit-v2.1.md)

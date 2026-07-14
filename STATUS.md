# STATUS — nicobehm portfolio

> Actualizado: 2026-07-15 · por /checkpoint

## Ahora

**Fase 3 con spec escrita y commiteada** (`2026-07-15-phase-3-content-pages-theming-design.md`,
commits `f39d6af..55d0cf3`): 3 bloques — A contenido+páginas+i18n+SEO · B theming v2 (4 skins,
3 vistas CV, URL) · C media-kit v2.2 (0.4.0) + ejemplos showcase. **Falta: usuario re-revisa la
spec (bloque C añadido tras su primera aprobación) → escribir plan → ejecutar.**

## Hecho

- ✅ Fases 0–2.6 (ver roadmap): fundaciones · design system · media-kit 0.1→0.3.0 · showcase.
- ✅ Brainstorm F3 completo (2026-07-15): decisiones en la spec §1 — PII fuera del repo
  (`.gitignore` para `apps/web/content/cv/`, contacto solo LinkedIn/GitHub), 4 skins vía
  `data-skin`, 3 vistas de CV, query params + localStorage, compare-lightbox (no zoom inline).
- ✅ Bloque C especificado con paridad clean-room vs Playground `fc_freepik_web`/landings
  (tabla C5 de la spec); resuelve el botón "Ampliar con zoom" (se elimina, C1 lo absorbe).

## Siguiente acción

1. Usuario re-revisa la spec F3 (bloque C nuevo); ajustar si pide cambios.
2. Plan con `superpowers:writing-plans` → `docs/superpowers/plans/2026-07-15-phase-3-*.md`
   (orden sugerido A → C → B; rama `feature/phase-3-content-theming`).
3. Ejecutar con `superpowers:subagent-driven-development` (TDD, commit por tarea, gate
   `pnpm run lint && pnpm run typecheck && pnpm run test` por tarea).

## Pendientes del usuario (no bloqueantes)

- Re-revisión de la spec F3 (bloqueante solo para arrancar el plan).
- Dominio definitivo · publicar `@nicobehm/media-kit` en npm (0.3.0 lista).
- `apps/web/content/cv/` sigue sin trackear a propósito (PII); F3 lo mete en `.gitignore`.

## Fuentes de verdad

- Roadmap: [docs/superpowers/plans/2026-07-10-portfolio-roadmap.md](docs/superpowers/plans/2026-07-10-portfolio-roadmap.md)
- Spec producto: [docs/superpowers/specs/2026-07-10-portfolio-design.md](docs/superpowers/specs/2026-07-10-portfolio-design.md)
- Spec F3 (activa): [docs/superpowers/specs/2026-07-15-phase-3-content-pages-theming-design.md](docs/superpowers/specs/2026-07-15-phase-3-content-pages-theming-design.md)
- Ledger SDD: `.superpowers/sdd/progress.md`

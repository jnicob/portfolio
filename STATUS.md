# STATUS — nicobehm portfolio

> Actualizado: 2026-07-23 · F3.9 (skin Editorial NYT + puntero full-bleed) integrada en main

## Ahora

**F3.9 (Skin Editorial «NYT» + puntero full-bleed) COMPLETA e integrada en main**
(merge FF `d194a64..e868402`, main y feature branch pusheados a `github.com:jnicob/portfolio`).
Implementada con subagent-driven development (6 tareas TDD, review por tarea en el ledger).

- **T1** ✅ paleta NYT (B/N + azul, radios mínimos) en tokens de `globals.css`; test AA verde.
- **T2** ✅ `HomeBackground` en dos capas: canvas del puntero full-bleed + contenido `max-w-5xl`
  (hook `data-home-content`).
- **T3** ✅ parcial `apps/web/src/app/skins/editorial.css` + test de invariantes
  (scoping a `[data-skin='editorial']`, cero hex, hooks vivos) + masthead NYT en la home.
- **T4** ✅ CV a dos columnas tipo diario (`columns: 2` en ≥lg con hairline central; CSS-only).
- **T5** ✅ detalle de proyecto como artículo NYT (kicker, titular, bajada itálica,
  byline de métricas entre hairlines, drop cap).
- **T6** ✅ gate final: lint 0 errores, typecheck OK, 418 web + 242 media-kit tests,
  builds static + Node con 25 rutas, home scripts gzip 274,6 KiB (no crece vs 275,5 de F3.8);
  verificación en vivo Playwright (editorial × dark/light en home/CV/detalle, otros 3 skins
  sin cambios, canvas full-bleed hasta los bordes).
- **Reviews de cierre** ✅: design review (Opus) SHIP — su único Major (Badge `rounded-full`
  hardcodeado) arreglado tokenizando `--radius-badge` (solo editorial lo pone a 0) y verificado
  en navegador; code review final (Fable) «Ready to merge: Yes» — fixes minor aplicados
  (invariantes de color ampliados, hooks vivos sin `.test.tsx`, selectores endurecidos,
  meta-row del hero centrado en móvil) y spec enmendada con 3 divergencias adjudicadas
  (drop cap, regla doble, entradilla serif).

## Hecho

- ✅ Fases 0–3.9 implementadas (ver roadmap) · media-kit 0.7.0 integrada en main.
- ✅ F3.9 T1-T6 con review Approved por tarea; veredictos en `.superpowers/sdd/progress.md`.
- ✅ Follow-up visual posterior a F3.8 integrado en main y verificado.

## Siguiente acción

1. **F4 — Playground** (siguiente fase del roadmap): brainstorm + spec + plan (just-in-time).
2. F4 arrastra: First Load JS >2× presupuesto (palanca real del perf, a enforcar en Phase 6) +
   Escape anidado del skin filter (único ítem del backlog F3.7 fuera de F3.8).
3. Follow-ups menores de F3.8 (no bloqueantes): endurecer badge de estado a `/^[45]/`,
   limpiar `w-full` redundante en Select, declarar borde del chip activo.
4. Backlog F3.9 (no bloqueante): byline del artículo con 2º dato, margen residual de la
   columna 1 del CV, dueño único del ritmo hairline+gap.

## Pendientes del usuario (no bloqueantes)

- Dominio definitivo + `NEXT_PUBLIC_SITE_URL` (el build avisa si falta).
- Publicar `@nicobehm/media-kit` en npm.
- Momento del deploy del badge de disponibilidad (visible desde F3.7).
- Upgrade Node 22 (retirar pins de `docs/decisions/2026-07-10-dependency-pins.md`).
- ¿Subir el skill `masonry-layouts` a ai-config? (recomendado; no propagado aún).

## Fuentes de verdad

- Plan F3.9: [docs/superpowers/plans/2026-07-23-phase-3.9-editorial-nyt-fullbleed.md](docs/superpowers/plans/2026-07-23-phase-3.9-editorial-nyt-fullbleed.md)
- Spec F3.9: [docs/superpowers/specs/2026-07-23-phase-3.9-editorial-nyt-fullbleed-design.md](docs/superpowers/specs/2026-07-23-phase-3.9-editorial-nyt-fullbleed-design.md)
- Roadmap: [docs/superpowers/plans/2026-07-10-portfolio-roadmap.md](docs/superpowers/plans/2026-07-10-portfolio-roadmap.md) · Ledger SDD: `.superpowers/sdd/progress.md`

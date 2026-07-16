# Portfolio — Roadmap de implementación (plan maestro)

> **For agentic workers:** Este es el índice de planes. Cada fase tiene (o tendrá) su plan detallado en `docs/superpowers/plans/`. Ejecuta las fases EN ORDEN. El plan de cada fase se escribe justo antes de ejecutarla (skill writing-plans), usando este roadmap + el spec como entrada. No saltes fases ni ejecutes este archivo directamente.

**Spec:** `docs/superpowers/specs/2026-07-10-portfolio-design.md` (leer SIEMPRE antes de escribir o ejecutar un plan de fase).

**Goal:** Portfolio profesional bilingüe (es/en) con playground de IA, paquete npm `@nicobehm/media-kit`, runtime dual estático/Node, config de agentes agnóstica y CI/CD para 3 targets.

## Global Constraints (aplican a TODAS las fases)

- Next.js 16 (App Router) · TypeScript `strict: true` · Tailwind CSS v4 · pnpm workspaces.
- Colores SOLO vía tokens semánticos (CSS vars + `data-theme`). Prohibido color hardcodeado en componentes.
- Prohibido cualquier dependencia privada/interna de empresa. Solo OSS público o código propio.
- Por defecto `output: 'export'`; modo Node opcional vía `NEXT_OUTPUT_MODE=node` sin reescribir componentes.
- Nunca secretos en bundle estático ni en el repo.
- ESLint + Prettier + typecheck + tests en verde en cada commit. TDD para todo código con lógica.
- WCAG AA en ambos temas. Lighthouse > 90.
- Commits convencionales (`feat:`, `fix:`, `docs:`, `chore:`, `test:`) y frecuentes.

## Fases

| #   | Fase                                                                             | Plan                                     | Estado    | Depende de                          |
| --- | -------------------------------------------------------------------------------- | ---------------------------------------- | --------- | ----------------------------------- |
| 0   | Fundaciones (monorepo, tooling, CI, config agentes)                              | `2026-07-10-phase-0-foundations.md`      | ✅ hecha  | —                                   |
| 1   | Design system (tokens, theming, primitivas UI, showcase)                         | `2026-07-10-phase-1-design-system.md`    | ✅ hecha  | 0                                   |
| 2   | `@nicobehm/media-kit` (CompareSlider, MediaLightbox)                             | `2026-07-10-phase-2-media-kit.md`        | ✅ hecha  | 0 (1 solo para la demo en showcase) |
| 2.5 | media-kit v2 (zoom/pan, controles, fit modes, slider hover)                      | `2026-07-13-phase-2.5-media-kit-v2.md`   | ✅ hecha  | 2                                   |
| 2.6 | media-kit v2.1 (espacio-pan, help, ojo/tooltips, demo retrato) + showcase polish | `2026-07-14-phase-2.6-media-kit-v2.1.md` | ✅ hecha  | 2.5                                 |
| 3   | Contenido + páginas + theming v2 + media-kit v2.2 (Zod, CV, MDX, i18n, SEO, skins) | `2026-07-15-phase-3-content-theming.md`  | ✅ hecha  | 1                                   |
| 3.5 | Contenido v2 — feedback usuario 2026-07-16 (proyectos Backoffice + LinkedIn, skills ampliadas, home reordenada, métrica +1.000 PRs, fixes UI header/showcase) | just-in-time (spec §2.1 del spec maestro) | pendiente | 3                                   |
| 4   | Playground (adaptadores mock/pollinations/proxy, UI, estados)                    | just-in-time                             | pendiente | 1, 2, 3, 3.5 (contenido estable)    |
| 5   | Runtime dual + deploys (3 targets, workflows, proxy PHP)                         | just-in-time                             | pendiente | 0–4                                 |
| 6   | QA final (e2e, visual, axe, Lighthouse, README final)                            | just-in-time                             | pendiente | todas                               |

## Interfaces entre fases (contratos)

- **F0 → resto:** workspace `web` (`apps/web`) y raíz con scripts `pnpm run lint|format|typecheck|test|build`; helper `resolveOutputMode(env: Record<string, string | undefined>): 'export' | 'node'` en `apps/web/src/lib/output-mode.ts`; config agentes en raíz (`AGENTS.md`, `skills/`, `agents/`, `scripts/setup-agents.sh`).
- **F1 → F2/F3/F4:** tokens CSS `--color-*`, `--radius-*`, `--font-*` vía `@theme inline` en `apps/web/src/app/globals.css`, con valores por tema bajo `:root[data-theme='dark' | 'light']` (spacing: escala estándar de Tailwind, sin tokens propios — AMENDED 2026-07-10, YAGNI); primitivas en `apps/web/src/components/ui/` (Button, Card, Field, Input, Select, Tabs, Badge, Skeleton) con variantes cva; página `/showcase` (F3 la mueve bajo `/[locale]/`).
- **F2 → F4:** `@nicobehm/media-kit` exporta `CompareSlider` y `MediaLightbox` (props documentadas en su README); el playground los consume como workspace dependency.
- **F3 → F4/F6:** rutas `/{es,en}/{'', cv, projects, projects/[slug]}`, layout con header/footer/theme-switcher/locale-switcher; helpers SEO en `apps/web/src/lib/seo.ts`; schemas Zod en `apps/web/src/data/schemas.ts`.
- **F4 → F5:** puerto `GenerationService` (`apps/web/src/features/playground/domain/`) con adaptadores `mock` | `pollinations` | `proxy`; el `proxy` espera `POST /api/ai-proxy` (implementado en F5 modo Node).
- **F5 → F6:** builds reproducibles `NEXT_OUTPUT_MODE=export|node`; workflows `ci.yml`, `deploy-cloudflare.yml`, `deploy-vps.yml`; `scripts/deploy-shared-hosting.sh`.

## Cierre de cada fase (obligatorio)

1. Todos los checks en verde (`pnpm run lint && pnpm run typecheck && pnpm run test && pnpm run build`).
2. Code review (superpowers:requesting-code-review) + lentes `agents/` cuando aplique (design-reviewer desde F1, qa-a11y-perf desde F4).
3. verification-before-completion: evidencia de que el entregable de la fase funciona.
4. Actualizar la columna Estado de este roadmap y escribir el plan de la fase siguiente.

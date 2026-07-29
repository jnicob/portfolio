# STATUS — nicobehm portfolio

> Actualizado: 2026-07-29 · deuda técnica saldada e integrada en main (rama `fix/tech-debt`)

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

1. **F4 — ai-playground fase A COMPLETADA y publicada (2026-07-29)**: repo público
   `github.com/jnicob/ai-playground` con CI verde — monorepo pnpm (core + api Hono/Workers +
   web Vite/React 19), walking skeleton mock end-to-end (43 tests), MIT, README. Ejecutada
   con SDD (12 tasks, review por task + review final). Exportados a ai-config: agentes
   design-reviewer y qa-a11y-perf generalizados + skill nueva `nico-vitest` + extensiones a
   nico-security/testing/typescript/verification. Próximo paso: plan de fase B just-in-time
   (API task-based + conectores pollinations/google imagen + panel de keys); referencia de
   paridad de features en `../playground-parity-inventory.md` (privado, fuera de repos).
   En el portfolio F4 queda como integración ligera (case study + CTA cuando haya URL
   desplegada); F5 pierde el proxy (roadmap AMENDED).
2. Deuda técnica saldada en la rama `fix/tech-debt` → integrada en main (2026-07-29):
   - First Load JS de la home: 274,6 → **211,4 KiB gzip** (−63,2; zod fuera del bundle
     compartido y de la home vía `data/constants.ts`). OJO: la ruta `/cv` sigue
     embarcando zod en su chunk (~64,7 KiB; `cv-content.tsx` importa datos que hacen
     `schema.parse()` en module scope) — palanca para Phase 6 junto al resto: sin el
     polyfill `noModule` (38,6 KiB que los navegadores modernos no descargan) quedan
     172,8 KiB; el presupuesto de 130 KiB sigue excedido por el suelo del framework
     (react-dom 70,9 + router 47,8).
   - Escape anidado del skin filter (backlog F3.7) arreglado con test de integración.
   - Follow-ups F3.8: badge `/^[45]/`, `w-full` muerto del Select del endpoint,
     border-color declarado del chip activo (media-kit).
   - F3.9 «dueño único del ritmo hairline+gap» hecho (editorial.css + invariante).
3. Backlog F3.9 restante (no bloqueante): byline del artículo con 2º dato — necesita una
   métrica REAL del usuario (no se inventan cifras); margen residual de la columna 1 del
   CV — won't fix, adjudicado «artefacto típico de columns, no forzar» en el design review.

## Pendientes del usuario (no bloqueantes)

- Actualizar en LinkedIn la intro (About) y el CV completo para alinearlos con la
  intro nueva del portfolio (`profile.ts`, 2026-07-29: foco en rol de desarrollador,
  15+ años, EE. UU. y Latinoamérica, sin liderazgo/mentoría). Apoyo: `/audit`.
- Dominio definitivo + `NEXT_PUBLIC_SITE_URL` (el build avisa si falta).
- ~~Publicar `@nicobehm/media-kit` en npm~~ ✅ publicado (0.7.0 verificado en npm 2026-07-24).
- Momento del deploy del badge de disponibilidad (visible desde F3.7).
- Upgrade Node 22: ya corre localmente (v22.23.1, ai-playground lo exige) — queda evaluar
  retirar los pins de `docs/decisions/2026-07-10-dependency-pins.md`.
- ¿Subir el skill `masonry-layouts` a ai-config? (recomendado; no propagado aún).

## Fuentes de verdad

- Plan F3.9: [docs/superpowers/plans/2026-07-23-phase-3.9-editorial-nyt-fullbleed.md](docs/superpowers/plans/2026-07-23-phase-3.9-editorial-nyt-fullbleed.md)
- Spec F3.9: [docs/superpowers/specs/2026-07-23-phase-3.9-editorial-nyt-fullbleed-design.md](docs/superpowers/specs/2026-07-23-phase-3.9-editorial-nyt-fullbleed-design.md)
- Roadmap: [docs/superpowers/plans/2026-07-10-portfolio-roadmap.md](docs/superpowers/plans/2026-07-10-portfolio-roadmap.md) · Ledger SDD: `.superpowers/sdd/progress.md`

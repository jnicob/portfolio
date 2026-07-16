# STATUS — nicobehm portfolio

> Actualizado: 2026-07-16 · cierre de F3.5

## Ahora

**Fase 3.5 (Contenido v2) COMPLETA y mergeada a main**: 14 proyectos (Backoffice,
Playground de la API, dev-hub, historial LinkedIn) con flag `caseStudy` y enlaces
condicionales, Flows API integrado en el case study de plataforma, métrica "+1.000 PRs
(GitHub + Bitbucket)" solo global, alcance de API ampliado (IA + stock + estado), 16
skills, home reordenada (Skills → destacados + card de navegación full-width), skin
picker marca la skin actual con hover/teclado unificados, cursor pointer en switchers,
backlog F3 cerrado (z.url, site-url único, warn de build, dedupe contacto). Design
review + review final aplicados (affordances →/↗, prose links, skills compacta,
aria-label nav-card, test de paridad es/en).
**Siguiente fase: F3.6 (Showcase UX v2 + media-kit 0.5) — spec cerrada en §2.1, falta plan.**

## Hecho

- ✅ Fases 0–3 (ver roadmap) · media-kit 0.4.0 · 4 skins AA · CV 3 vistas.
- ✅ F3.5: ver arriba. Gate final: 40 archivos/228 tests web + 130 media-kit, builds
  duales export/node, verificación en vivo Playwright sobre el export.
- ✅ Exploración clean-room de repos Freepik (notas en `apps/web/content/cv/`, gitignored).

## Siguiente acción

1. Plan F3.6 con `superpowers:writing-plans` desde spec maestro §2.1 (Showcase UX v2 +
   media-kit 0.5: SpotlightReveal, modos CompareSlider, FilterGallery, VideoScrubPreview,
   ApiRequestPlayer, TiltCard/GlowCard, AnimatedMetric, hero canvas; bug mouse-follow
   fullscreen, tooltips con delay, nueva colorización 2 primeros ejemplos).
2. Ejecutar con subagent-driven-development (rama `feature/phase-3.6-showcase-mediakit`).
3. Después: brainstorm F4 (playground) → spec → plan.

## Pendientes del usuario (no bloqueantes)

- Confirmar si "dev-hub" es nombre público o renombrar la entrada (review final, Minor).
- Decidir métricas para la card destacada de Plataforma (design review, Polish).
- Favicon del sitio (404 actual, preexistente a F3.5).
- Dominio definitivo + `NEXT_PUBLIC_SITE_URL` (el build ya avisa si falta).
- Publicar `@nicobehm/media-kit` en npm (0.4.0 lista).
- Upgrade Node 22 (retirar pins de `docs/decisions/2026-07-10-dependency-pins.md`).

## Fuentes de verdad

- Roadmap: [docs/superpowers/plans/2026-07-10-portfolio-roadmap.md](docs/superpowers/plans/2026-07-10-portfolio-roadmap.md)
- Spec producto (+§2.1 enmiendas): [docs/superpowers/specs/2026-07-10-portfolio-design.md](docs/superpowers/specs/2026-07-10-portfolio-design.md)
- Plan F3.5 (hecha): [docs/superpowers/plans/2026-07-16-phase-3.5-content-v2.md](docs/superpowers/plans/2026-07-16-phase-3.5-content-v2.md)
- Ledger SDD: `.superpowers/sdd/progress.md`

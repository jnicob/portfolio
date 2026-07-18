# STATUS — nicobehm portfolio

> Actualizado: 2026-07-18 · por /checkpoint (F3.7 cerrada y mergeada; feedback G registrado para F3.8)

## Ahora

**F3.7 (Showcase v3 + UX global + contenido) CERRADA** y mergeada FF a `main` (+push).
41 commits, 25 tareas SDD con review por tarea + review final de rama (Fable)
«Ready to merge: Yes». media-kit **0.6.0** lista para npm (aditiva, cero breaking).

Lo entregado:

- **Galería «Ejemplos generados con IA»**: 16 assets reales (8 imágenes Google NBP +
  Seedream 5 Pro, 5 vídeos Veo 3.1 + Kling 3.0, 3 pistas Lyria con carátula) con doble
  variante display/HD, filtro categoría + búsqueda, hover-autoplay, fullscreen con
  preload HD en hover del botón, audio en lightbox compacto. Todo facade (0 bytes de
  media pre-interacción).
- **API player v2**: split estilo playground (request | Preview/Response), cero layout
  shift medido (310px constantes), preview con fullscreen.
- **Scrub v3**: asset GOP-8 + chip de tiempo + barra gruesa — **GATE design review:
  APROBADA** (se queda en el showcase).
- **media-kit 0.6.0**: fix compare fullscreen (especificidad CSS), side-by-side
  responsive, FilterGallery visibleIds + salida animada, HoverVideo, scrub v3, props
  blink dedicadas, fix pointer-capture sobre children interactivos del lightbox.
- **UX global**: nav activa (aria-current, sin re-navegación en match exacto),
  hamburguesa mobile (disclosure, fix desync ThemeSwitcher vía MutationObserver).
- **Contenido**: intro de carrera + badge disponibilidad (sin fecha), skills C2
  (JS 5★, React/Next 4★, TS 4★, Vue 3★), CV timeline rail (Freepik/Magnific
  **jul 2022 — jul 2026**), case study nuevo «Integración de servicios automatizada a
  través de IA» (clean-room), naming Freepik/Magnific, métricas verificadas contra
  docs públicas (**40+ modelos / 100+ endpoints**, docs.magnific.com), URLs reales.

**Gates**: 605 tests · lint 0 errors · builds duales · verificación en vivo 16/16 ·
axe 0 violations (12 combos) · Lighthouse showcase **mediana 91 = main** (protocolo
host-ocioso) · First Load JS +3.9 kB (features nav; demos en chunks diferidos).

## Hecho

- ✅ Fases 0–3.7 (ver roadmap) · media-kit 0.6.0 lista para npm.
- ✅ Ledger tarea a tarea: `.superpowers/sdd/progress.md`.

## Siguiente acción

1. **F3.8 — feedback G (2026-07-18)**: ver sección G de
   [docs/superpowers/plans/2026-07-17-feedback-nico-ux-content.md](docs/superpowers/plans/2026-07-17-feedback-nico-ux-content.md):
   posible bug tema+idioma, selector de layouts (masonry) en la galería IA con máx 4-5
   filas responsive, API player con más ejemplos (vídeo/audio/error), páginas de detalle
   para «Panel de desarrollador» y «Backoffice de contenido». Empezar con brainstorm
   corto + plan (prompt de continuación entregado en el checkpoint 2026-07-18).
2. F4 arrastra: First Load JS >2× presupuesto (palanca real del perf), backlog del
   review final (onPause sync del audio tile, preview dims del API player, regex
   protocolo-relativo, STACK_BREAKPOINT a module scope, barrel hover-video, Escape
   anidado del skin filter).

## Pendientes del usuario (no bloqueantes)

- Dominio definitivo + `NEXT_PUBLIC_SITE_URL` (el build avisa si falta).
- Publicar `@nicobehm/media-kit` 0.6.0 en npm.
- Activar el mensaje de disponibilidad cuando toque (ya visible tras F3.7 — decidir
  momento del deploy).
- Upgrade Node 22 (retirar pins de `docs/decisions/2026-07-10-dependency-pins.md`).

## Fuentes de verdad

- Plan F3.7 (cerrado): [docs/superpowers/plans/2026-07-18-phase-3.7-showcase-ux-content.md](docs/superpowers/plans/2026-07-18-phase-3.7-showcase-ux-content.md) — incluye el **inventario transversal de features + punteros**
- Spec F3.7: [docs/superpowers/specs/2026-07-18-phase-3.7-showcase-ux-content-design.md](docs/superpowers/specs/2026-07-18-phase-3.7-showcase-ux-content-design.md)
- Feedback Nico (A-F hechos; **G → F3.8**): [docs/superpowers/plans/2026-07-17-feedback-nico-ux-content.md](docs/superpowers/plans/2026-07-17-feedback-nico-ux-content.md)
- Roadmap: [docs/superpowers/plans/2026-07-10-portfolio-roadmap.md](docs/superpowers/plans/2026-07-10-portfolio-roadmap.md) · Ledger SDD: `.superpowers/sdd/progress.md`

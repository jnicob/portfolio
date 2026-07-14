# @nicobehm/media-kit v2 — zoom, pan, controles y modo hover (spec)

**Fecha:** 2026-07-13 · **Estado:** aprobado · **Versión objetivo del paquete:** `0.2.0`

> **For agentic workers:** Este spec define la Fase 2.5 (media-kit v2). Regla de oro:
> **v2 = v1 + capacidades, cero regresiones.** Los tests v1 existentes no se tocan y deben
> seguir pasando. Todo lo nuevo es opt-in u opcional con defaults que preservan el
> comportamiento v1 (única excepción visual documentada: la toolbar del lightbox se
> renderiza por defecto).

## Contexto y objetivo

La v1 del paquete (Fase 2) entrega `CompareSlider` y `MediaLightbox` accesibles, con 0
dependencias runtime y estilado vía custom properties `--mk-*`. Esta iteración los lleva a
calidad de producto:

- **MediaLightbox:** zoom (rueda, pinch, doble tap, botones, teclado), panning, caja de
  comandos con toggle + auto-hide, modos de ajuste `contain`/`cover`/`actual` y fullscreen
  nativo.
- **CompareSlider:** modo `hover` — el divisor sigue el puntero sin necesidad de click.

Es una **optimización de los componentes actuales, no una simplificación**: toda capacidad
v1 (a11y incluida) se conserva.

## Decisiones cerradas

| Tema                    | Decisión                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gestos de zoom          | Set completo: rueda hacia el cursor, doble click/tap 1x↔2x, pinch táctil, botones −/+, teclado `+`/`−`/`0`                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Controles               | Toggle explícito + auto-hide a los 3 s de inactividad; nunca se ocultan con foco dentro                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Fit modes               | `contain` (default) · `cover` · `actual` (1:1), con ciclo en la toolbar y prop `fit`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Contenido de la toolbar | Toolbar (abajo, centrada): zoom − / indicador % / zoom +, reset, ciclo de fit (glifo `▣`, significado en el aria-label), fullscreen nativo (con detección de soporte). Cerrar `✕` es **persistente arriba a la derecha en ambos modos** (`controls` true/false); el toggle de visibilidad `⋯` va junto a él, arriba a la derecha, solo con `controls`. _(revisado en el design review de cierre F2.5: cerrar vuelve a la esquina superior derecha por convención/descubribilidad; el anuncio aria-live del zoom vive en el root del dialog, fuera de la región inertizable.)_ |
| Slider hover            | Prop `mode: 'drag' \| 'hover'` (default `'drag'`); en táctil cae a drag; teclado idéntico                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Arquitectura            | Hooks headless propios + subcomponentes internos; **0 dependencias runtime nuevas**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Encaje en el plan       | Cerrar Fase 2 primero (merge a `main`); esta v2 es la **Fase 2.5** en rama `feature/phase-2.5-media-kit-v2`                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

## API pública

### CompareSlider

```ts
type CompareSliderProps = {
  // ...props v1 sin cambios...
  /** 'drag' (default, comportamiento v1) | 'hover': el divisor sigue el puntero sin click. */
  mode?: 'drag' | 'hover';
};
```

- La decisión drag/hover es **por evento** según `pointerType`: en `mode="hover"`, ratón →
  el divisor sigue `pointermove` sin click ni capture; touch/pen → camino v1 (pointerdown +
  capture). Sin media queries; correcto en dispositivos híbridos.
- Al salir el ratón del contenedor, el divisor **permanece** donde estaba (no hay reset).
- Teclado y ARIA idénticos en ambos modos.

### MediaLightbox

```ts
type MediaLightboxFit = 'contain' | 'cover' | 'actual';

type MediaLightboxLabels = {
  zoomIn: string;
  zoomOut: string;
  zoomLevel: string; // plantilla para el aria-live, p.ej. 'Zoom {percent}%'
  reset: string;
  fit: string; // plantilla, p.ej. 'Ajuste: {current}. Cambiar a {next}'
  fullscreen: string;
  exitFullscreen: string;
  hideControls: string;
  showControls: string;
  close: string;
};

type MediaLightboxProps = {
  // ...props v1 sin cambios; closeLabel se mantiene y actúa como alias de labels.close...
  /** Modo de ajuste base a zoom 1x. Default 'contain'. */
  fit?: MediaLightboxFit;
  /** Límites del zoom. Default { min: 1, max: 8 }. */
  zoom?: { min?: number; max?: number };
  /** Renderizar la caja de controles. Default true. */
  controls?: boolean;
  /** Visibilidad inicial de los controles. Default true. */
  defaultControlsVisible?: boolean;
  /** ms de inactividad antes del auto-hide. null lo desactiva. Default 3000. */
  autoHideDelay?: number | null;
  /** Textos de los botones (i18n). Cada clave tiene default en inglés. */
  labels?: Partial<MediaLightboxLabels>;
};
```

**Modelo de zoom/pan:**

- El factor de zoom es **relativo al tamaño base que fija `fit`** (1x = ajustado según el
  modo). `actual` = tamaño natural 1:1 a zoom 1x.
- Pan activo **siempre que el contenido desborda el viewport**: con zoom > 1 en cualquier
  fit, y también a 1x en `cover`/`actual` si hay desborde.
- Cambiar de fit **resetea** zoom a 1x y pan a centrado.
- Clamping de pan: el contenido nunca se despega de los bordes (no se ve fondo de más).
- Los hooks son **internos**: `index.ts` solo exporta los 2 componentes y sus tipos.

**Versionado:** `0.1.0 → 0.2.0`. Único cambio visual con defaults: aparece la toolbar.
Se documenta en `CHANGELOG.md` (fichero nuevo).

## Arquitectura

```
packages/media-kit/src/
├── compare-slider/
│   └── compare-slider.tsx        # + lógica de mode (~130 líneas)
├── media-lightbox/
│   ├── media-lightbox.tsx        # orquestación: portal, dialog, trap, teclado (~150)
│   ├── lightbox-controls.tsx     # toolbar presentacional: botones + indicador % (~100)
│   ├── use-zoom-pan.ts           # transform, límites, rueda, pinch, doble tap, pan (~180)
│   ├── use-auto-hide.ts          # timer de inactividad consciente del foco (~60)
│   └── use-fullscreen.ts         # Fullscreen API + prefijo webkit + supported (~50)
└── styles.css                    # + .mk-lightbox__controls y vars --mk-control-*
```

**Responsabilidades:**

- **`useZoomPan(ref, { fit, min, max })`** — dueño único del estado geométrico
  `{ scale, tx, ty }`. Listeners nativos sobre el elemento del ref (necesario para `wheel`
  no-pasivo). Expone comandos (`zoomIn`, `zoomOut`, `reset`, `panBy`) y el estilo
  `transform`. Pinch: matemática de 2 punteros sobre `Map<pointerId, punto>` — la distancia
  escala, el punto medio ancla; pinch y pan conviven en el mismo gesto.
- **`useAutoHide({ delay, disabled })`** — `{ visible, show, hide, toggle }`. Dos estados
  ocultos distintos: _idle-hidden_ (reaparece al mover el ratón) y _user-hidden_ (toggle
  explícito; solo reaparece con el toggle). Nunca oculta con foco dentro (`focus-within`).
- **`useFullscreen(ref)`** — `{ supported, active, toggle }`; `supported: false` donde no
  hay API (iPhone) y el botón no se renderiza.
- **`lightbox-controls.tsx`** — presentacional puro; recibe estado y comandos por props.
  `role="group"` + `aria-label`; sin lógica de gestos.
- **`media-lightbox.tsx`** — compone hooks + controles y conserva todo lo v1 (portal,
  focus trap con fix de elementos no rastreados, scroll lock, Escape, overlay click).

**Flujo de datos:** unidireccional. Gestos → estado en `useZoomPan` → el wrapper del
contenido pinta `transform: translate() scale()` (GPU, sin reflow; `will-change` solo
durante el gesto).

## Interacción y accesibilidad

### Mapa de teclado (handler en el dialog, nunca global)

| Tecla               | Acción                                                            | Condición                               |
| ------------------- | ----------------------------------------------------------------- | --------------------------------------- |
| `Escape`            | Cerrar; si hay fullscreen nativo activo, solo salir de fullscreen | siempre                                 |
| `Tab` / `Shift+Tab` | Ciclar focus trap                                                 | siempre                                 |
| `+` / `=`, `−`      | Zoom in / out (mismo paso que los botones)                        | siempre                                 |
| `0`                 | Reset: zoom 1x + centrado                                         | siempre                                 |
| `←↑→↓`              | Pan                                                               | foco fuera de la toolbar y hay desborde |
| `f`                 | Fullscreen nativo                                                 | si `supported`                          |
| `c`                 | Mostrar/ocultar controles                                         | siempre                                 |

### Garantías WCAG AA (ambos temas)

- Indicador de zoom con `aria-live="polite"`; anuncia el **valor final** del gesto, no cada
  tick de rueda.
- Auto-hide jamás oculta con foco dentro; al ocultar, la toolbar pasa a `inert` +
  `visibility: hidden` (fuera del trap y del árbol de accesibilidad).
- Toggle de controles siempre visible, con `aria-expanded`.
- Botón de fit describe estado y acción en su `aria-label` ("Ajuste: cover. Cambiar a
  tamaño real").
- Focus visible con `--mk-focus-ring` en todos los botones nuevos; targets táctiles ≥ 44px.
- `prefers-reduced-motion`: las transiciones de transform se desactivan (el zoom salta al
  valor final).

### Detalles de gesto

- **Rueda:** zoom multiplicativo (`scale *= 1.1^Δ`) **anclado al cursor** — el punto bajo
  el ratón permanece bajo el ratón.
- **Botones y teclado (`+`/`−`):** paso multiplicativo ×1.5 por pulsación (anclado al
  centro del viewport), clampado a `[min, max]`.
- **Doble click/tap:** 1x→2x ancla en el punto tocado (clampado a `max`); 2x→1x re-centra.
- **Pan por drag:** `setPointerCapture`, cursor `grab`/`grabbing`.
- **Click vs drag en overlay:** umbral de ~4px de movimiento; un pan no cierra el lightbox.

## Testing (TDD)

- **Hooks aislados** vía componente sonda:
  - `useZoomPan`: rueda anclada al cursor, clamp de límites y de bordes, pinch con 2
    punteros sintéticos, doble tap, reset al cambiar fit.
  - `useAutoHide` (fake timers): idle-hidden vs user-hidden, no-hide con foco dentro.
  - `useFullscreen`: API mockeada en jsdom; `supported: false` sin API.
- **Componentes:**
  - CompareSlider: `mode="hover"` sigue `pointermove` de ratón sin click; touch cae a
    drag; teclado intacto; sin `mode` → comportamiento v1 exacto.
  - MediaLightbox: toolbar renderiza/oculta; `inert` al ocultar; `aria-expanded`; % con
    `aria-live`; Escape vs fullscreen; flechas solo panean con foco fuera de la toolbar;
    API v1 sin props nuevas sigue funcionando.
- **Prueba mecánica de cero regresiones:** los ficheros de test v1 no se modifican y pasan.

## Documentación (requisito explícito: buena documentación y ejemplos)

- **README** ampliado por componente: tabla completa de props, **mapa de teclado**, tabla
  de custom properties nuevas (`--mk-control-*`), y sección **Recipes** con ejemplos
  copy-paste:
  1. Lightbox básico (uso v1, sin cambios).
  2. Galería con zoom/pan y fit `cover`.
  3. Lightbox sin toolbar (`controls={false}`) con controles propios.
  4. i18n completo vía `labels` (ejemplo en español).
  5. CompareSlider en `mode="hover"` para grids de antes/después.
  6. Mapeo de design tokens del consumidor a `--mk-*` (el patrón que usa el showcase).
- **JSDoc en cada prop pública** (convención existente del paquete).
- **`CHANGELOG.md`** nuevo con la entrada 0.2.0 y el cambio visual de la toolbar.

## Showcase

La sección media-kit de `/showcase` se amplía:

- Dos CompareSlider lado a lado: `mode="drag"` vs `mode="hover"` (comparación directa).
- Lightbox demo con imagen grande real para que zoom/pan/fit se aprecien.
- Regla de tokens intacta: nada de color hardcodeado fuera de los sitios permitidos.

## Non-goals (fuera de v2)

- Galería multi-imagen / navegación prev-next (candidata a v3).
- Rotación, descarga, compartir.
- Zoom dentro del propio CompareSlider.
- Animación de apertura tipo FLIP ("zoom desde el thumbnail").
- SSR del lightbox abierto (sigue siendo client-only, como v1).

## Proceso

1. Cerrar Fase 2 (checks + design review + roadmap + merge a `main`) según su plan.
2. Añadir la Fase 2.5 al roadmap con este spec como entrada.
3. Escribir el plan de implementación (`superpowers:writing-plans`) en
   `docs/superpowers/plans/2026-07-13-phase-2.5-media-kit-v2.md`.
4. Ejecutar en rama `feature/phase-2.5-media-kit-v2` con TDD y cierre de fase estándar.

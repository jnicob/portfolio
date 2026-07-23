---
name: masonry-layouts
description: Use when building or reviewing gallery layouts — masonry, justified rows, responsive column counts, or any variable-height media grid
---

# Masonry y layouts de galería

## Regla nº 1: CSS multi-column NO es masonry de producto

`columns:`/`column-count` llena columna a columna (column-major): el orden de
lectura/Tab deja de coincidir con el visual (rompe a11y), los ítems saltan de
columna al filtrar y no hay control de posiciones. Los masonry de producción
(patrón validado en galerías a gran escala) usan **JS de columnas balanceadas**.

## El patrón

1. **Motor puro**: `(aspectRatios, containerWidth, columns, gap) → {x,y,width,height}[]`.
   Packing determinista «columna más corta primero». Sin medir el DOM: las
   alturas se derivan de `width/height` CONOCIDOS del asset (exigirlos en los datos).
2. **Orden DOM = orden de datos**: la posición es solo visual (`position:absolute`
   - `left/top`); nunca reordenar el DOM ni repartir en wrappers por columna
     (eso rompe el orden de lectura).
3. **Columnas por ancho de CONTENEDOR** (`ResizeObserver`), no de viewport:
   umbrales explícitos y testeados (aquí: 2 → 3 → 4 → 5, máx. 5).
4. **Justified = mismo motor por filas**: alto objetivo, anchos ∝ aspect ratio,
   la fila escala para llenar el ancho exacto; la última fila no se estira.
5. **Animación**: FLIP con `transform` compone por encima de `left/top` sin
   conflicto. `prefers-reduced-motion` → recolocación instantánea.
6. **SSR/hidratación**: no medir en servidor; aplicar posiciones solo tras la
   primera medición client-side (el HTML prerenderizado queda en el layout CSS
   por defecto).

## En este repo

- Motor: `packages/media-kit/src/filter-gallery/layout-engine.ts` (tests al lado).
- Aplicación: prop `layout` de `FilterGallery` (`filter-gallery.tsx`).
- Consumidor: `apps/web/src/components/showcase/gallery-demo.tsx` (selector).
- Decisión y análisis de referencia: spec F3.8 §2
  (`docs/superpowers/specs/2026-07-19-phase-3.8-advanced-showcase-project-details-design.md`).

## Cuándo NO usar este patrón

- Grid uniforme (celdas iguales) → CSS grid `auto-fill/minmax`, sin JS.
- Miles de ítems → añade virtualización (fuera del alcance de este repo: 16 ítems).

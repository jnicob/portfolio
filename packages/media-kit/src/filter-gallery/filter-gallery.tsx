'use client';

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { prefersReducedMotion } from '../internal/prefers-reduced-motion';

export type FilterGalleryItem = {
  id: string;
  categories: readonly string[];
  node: ReactNode;
};

export type FilterGalleryCategory = { id: string; label: string };

export type FilterGalleryProps = {
  items: readonly FilterGalleryItem[];
  /** Filtro controlado; `null` = todos. Omitir para modo no controlado. */
  filter?: string | null;
  /** Filtro inicial en modo no controlado. Default `null` (todos). */
  defaultFilter?: string | null;
  onFilterChange?: (filter: string | null) => void;
  /** Si se pasa, renderiza la botonera de filtros (siempre incluye "All"). */
  categories?: readonly FilterGalleryCategory[];
  /** Etiqueta del botón "todos". Default `'All'`. */
  allLabel?: string;
  /** Nombre accesible de la botonera de filtros y del grid. */
  label: string;
  /** Duración en ms de la animación FLIP. Default 240. */
  duration?: number;
  className?: string;
};

/**
 * Grid filtrable con recolocación animada vía FLIP manual (First-Last-Invert-Play,
 * WAAPI `element.animate`, sin dependencias ni View Transitions API — ver spec A5).
 * Los items que entran hacen fade+scale desde 0.96; los que salen se retiran de
 * inmediato (animar la salida exigiría render diferido — YAGNI, ver spec). SSR-safe:
 * el primer render no mide ni anima, solo captura posiciones para el próximo cambio
 * de filtro. Respeta `prefers-reduced-motion` (cambio instantáneo, sin animar).
 */
export function FilterGallery({
  items,
  filter,
  defaultFilter = null,
  onFilterChange,
  categories,
  allLabel = 'All',
  label,
  duration = 240,
  className,
}: FilterGalleryProps) {
  const gridRef = useRef<HTMLUListElement>(null);
  const previousRectsRef = useRef<Map<string, DOMRect>>(new Map());
  // Valor inicial calculado directamente desde props (no desde `activeFilter`, que
  // depende del estado declarado más abajo): en el primer render coinciden, así que
  // el layout effect ve `filterChanged = false` y no anima el montaje inicial.
  const previousFilterRef = useRef(filter !== undefined ? filter : defaultFilter);
  const [internalFilter, setInternalFilter] = useState(defaultFilter);

  const activeFilter = filter !== undefined ? filter : internalFilter;
  const visible =
    activeFilter == null ? items : items.filter((item) => item.categories.includes(activeFilter));

  // First (posiciones previas) se capturó en el layout effect del render anterior;
  // aquí solo comparamos con Last (posiciones ya pintadas de este render) cuando el
  // filtro cambió, y volvemos a capturar para el próximo cambio.
  useLayoutEffect(() => {
    const grid = gridRef.current;
    const filterChanged = previousFilterRef.current !== activeFilter;
    previousFilterRef.current = activeFilter;
    if (!grid) return;

    if (filterChanged && !prefersReducedMotion()) {
      for (const el of grid.querySelectorAll<HTMLElement>('[data-fg-id]')) {
        if (typeof el.animate !== 'function') continue;
        const id = el.dataset.fgId;
        const before = id ? previousRectsRef.current.get(id) : undefined;
        if (before) {
          const after = el.getBoundingClientRect();
          const dx = before.left - after.left;
          const dy = before.top - after.top;
          if (dx !== 0 || dy !== 0) {
            el.animate(
              [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }],
              { duration, easing: 'ease-out' },
            );
          }
        } else {
          el.animate(
            [
              { opacity: 0, transform: 'scale(0.96)' },
              { opacity: 1, transform: 'scale(1)' },
            ],
            { duration, easing: 'ease-out' },
          );
        }
      }
    }

    previousRectsRef.current = new Map(
      [...grid.querySelectorAll<HTMLElement>('[data-fg-id]')].map((el) => [
        el.dataset.fgId ?? '',
        el.getBoundingClientRect(),
      ]),
    );
  });

  function select(next: string | null) {
    onFilterChange?.(next);
    if (filter === undefined) setInternalFilter(next);
  }

  return (
    <div className={['mk-filter-gallery', className].filter(Boolean).join(' ')}>
      {categories && (
        <div role="group" aria-label={label} className="mk-filter-gallery__filters">
          <button type="button" aria-pressed={activeFilter == null} onClick={() => select(null)}>
            {allLabel}
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              aria-pressed={activeFilter === category.id}
              onClick={() => select(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>
      )}
      <ul aria-label={label} className="mk-filter-gallery__grid" ref={gridRef}>
        {visible.map((item) => (
          <li key={item.id} data-fg-id={item.id}>
            {item.node}
          </li>
        ))}
      </ul>
    </div>
  );
}

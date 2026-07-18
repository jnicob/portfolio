'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
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
  /** Restricción adicional de visibilidad; se interseca con el filtro de categoría. `undefined` = sin restricción. */
  visibleIds?: readonly string[];
  className?: string;
};

/**
 * Busca el `<li>` de un item por id sin depender de `CSS.escape` (los ids pueden
 * traer caracteres no seguros en un selector CSS).
 */
function findItemElement(grid: HTMLUListElement, id: string): HTMLElement | null {
  for (const el of grid.querySelectorAll<HTMLElement>('[data-fg-id]')) {
    if (el.dataset.fgId === id) return el;
  }
  return null;
}

/**
 * Grid filtrable con recolocación animada vía FLIP manual (First-Last-Invert-Play,
 * WAAPI `element.animate`, sin dependencias ni View Transitions API — ver spec A5).
 * Los items que entran hacen fade+scale desde 0.96. Los que salen (v0.6) se
 * mantienen montados con `data-fg-exiting` + `aria-hidden` + `inert` mientras dura
 * un fade-out (render diferido: el `setState` que los añade a `exitingIds` ocurre
 * dentro del layout effect, que fuerza un re-render síncrono antes del pintado, así
 * que el `<li>` sigue en pantalla el frame en que deja de estar "visible"). Si un
 * id saliente vuelve a ser visible antes de terminar, gana la entrada: se cancela
 * su `Animation` y se saca de `exitingIds`. Sin WAAPI o con `prefers-reduced-motion`
 * el desmontaje es inmediato (nunca quedan ids huérfanos en `exitingIds`). SSR-safe:
 * el primer render no mide ni anima, solo captura posiciones para el próximo cambio
 * de filtro.
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
  visibleIds,
  className,
}: FilterGalleryProps) {
  const gridRef = useRef<HTMLUListElement>(null);
  const previousRectsRef = useRef<Map<string, DOMRect>>(new Map());
  // Valor inicial calculado directamente desde props (no desde `activeFilter`, que
  // depende del estado declarado más abajo): en el primer render coinciden, así que
  // el layout effect ve `filterChanged = false` y no anima el montaje inicial.
  const previousFilterRef = useRef(filter !== undefined ? filter : defaultFilter);
  const previousVisibleIdsRef = useRef(visibleIds ? visibleIds.join('\u0000') : '');
  const [internalFilter, setInternalFilter] = useState(defaultFilter);

  const activeFilter = filter !== undefined ? filter : internalFilter;
  const visible = items.filter(
    (item) =>
      (activeFilter == null || item.categories.includes(activeFilter)) &&
      (visibleIds === undefined || visibleIds.includes(item.id)),
  );
  const visibleIdSet = new Set(visible.map((item) => item.id));

  // Salida animada (v0.6): ids que dejaron de estar en `visible` pero siguen
  // montados mientras dura su fade-out. `previousRenderedIdsRef` guarda los ids
  // visibles del render anterior para detectar altas/bajas dentro del layout
  // effect; `exitAnimationsRef` guarda el handle de `Animation` en curso por id
  // (para poder cancelarlo si el item vuelve a ser visible antes de terminar, o si
  // el componente entero se desmonta con una salida en curso).
  const [exitingIds, setExitingIds] = useState<readonly string[]>([]);
  const previousRenderedIdsRef = useRef<readonly string[]>(visible.map((item) => item.id));
  const exitAnimationsRef = useRef<Map<string, Animation>>(new Map());

  // Cleanup de solo-desmontaje (deps `[]`, no confundir con el layout effect de
  // abajo que corre en cada render): si FilterGallery se desmonta con alguna
  // salida en curso, cancela sus `Animation` (libera el efecto sobre el nodo) y
  // marca `isMountedRef` en false. `dropExiting` respeta ese flag: aunque algún
  // entorno dispare `onfinish` después de `cancel()` (la spec WAAPI no lo hace,
  // pero no todos los polyfills la siguen al pie de la letra), no se llama a
  // `setExitingIds` sobre un componente ya desmontado.
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      for (const anim of exitAnimationsRef.current.values()) anim.cancel();
    };
  }, []);

  // First (posiciones previas) se capturó en el layout effect del render anterior;
  // aquí solo comparamos con Last (posiciones ya pintadas de este render) cuando el
  // filtro o visibleIds cambió, y volvemos a capturar para el próximo cambio.
  useLayoutEffect(() => {
    const grid = gridRef.current;
    const currentVisibleIdsKey = visibleIds ? visibleIds.join('\u0000') : '';
    const filterChanged = previousFilterRef.current !== activeFilter;
    const visibleIdsChanged = previousVisibleIdsRef.current !== currentVisibleIdsKey;
    previousFilterRef.current = activeFilter;
    previousVisibleIdsRef.current = currentVisibleIdsKey;
    if (!grid) return;

    // Detecta bajas (removed) y reentradas (reentered) comparando contra los ids
    // visibles del render anterior. `exitingIds` aquí es el valor de ESTE render
    // (closure); si acabamos de añadir ids nuevos con `setExitingIds`, ese cambio
    // solo será visible en la siguiente pasada del effect — que ocurre síncrona
    // (antes de pintar) porque este `setState` se dispara dentro de un layout
    // effect. Por eso el bucle de "arrancar animación" de más abajo solo actúa
    // sobre `exitingIds` (no sobre `removed`): en la primera pasada el `<li>`
    // saliente todavía no existe en el DOM (el render diferido lo monta en la
    // pasada siguiente).
    const currentIds = visible.map((item) => item.id);
    const removed = previousRenderedIdsRef.current.filter((id) => !visibleIdSet.has(id));
    const reentered = exitingIds.filter((id) => visibleIdSet.has(id));
    previousRenderedIdsRef.current = currentIds;

    if (reentered.length > 0) {
      for (const id of reentered) {
        exitAnimationsRef.current.get(id)?.cancel();
        exitAnimationsRef.current.delete(id);
      }
      setExitingIds((prev) => prev.filter((id) => !reentered.includes(id)));
    }

    if (removed.length > 0 && !prefersReducedMotion()) {
      setExitingIds((prev) => [...prev, ...removed]);
    }

    for (const id of exitingIds) {
      if (reentered.includes(id) || exitAnimationsRef.current.has(id)) continue;
      const el = findItemElement(grid, id);
      if (!el || typeof el.animate !== 'function') {
        dropExiting(id);
        continue;
      }
      const anim = el.animate(
        [
          { opacity: 1, transform: 'scale(1)' },
          { opacity: 0, transform: 'scale(0.96)' },
        ],
        { duration, easing: 'ease-out', fill: 'forwards' },
      );
      if (!anim) {
        dropExiting(id);
        continue;
      }
      exitAnimationsRef.current.set(id, anim);
      anim.onfinish = () => dropExiting(id);
    }

    if ((filterChanged || visibleIdsChanged) && !prefersReducedMotion()) {
      for (const el of grid.querySelectorAll<HTMLElement>('[data-fg-id]')) {
        if (el.hasAttribute('data-fg-exiting') || typeof el.animate !== 'function') continue;
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
      [...grid.querySelectorAll<HTMLElement>('[data-fg-id]')]
        .filter((el) => !el.hasAttribute('data-fg-exiting'))
        .map((el) => [el.dataset.fgId ?? '', el.getBoundingClientRect()]),
    );
  });

  function select(next: string | null) {
    onFilterChange?.(next);
    if (filter === undefined) setInternalFilter(next);
  }

  function dropExiting(id: string) {
    exitAnimationsRef.current.delete(id);
    if (!isMountedRef.current) return;
    setExitingIds((prev) => prev.filter((existing) => existing !== id));
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
        {items
          .filter((item) => visibleIdSet.has(item.id) || exitingIds.includes(item.id))
          .map((item) => {
            const isExiting = !visibleIdSet.has(item.id);
            return (
              <li
                key={item.id}
                data-fg-id={item.id}
                data-fg-exiting={isExiting ? '' : undefined}
                aria-hidden={isExiting ? true : undefined}
                inert={isExiting || undefined}
              >
                {item.node}
              </li>
            );
          })}
      </ul>
    </div>
  );
}

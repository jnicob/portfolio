'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { prefersReducedMotion } from '../internal/prefers-reduced-motion';
import {
  columnCountForWidth,
  columnWidthForWidth,
  computeJustifiedLayout,
  computeMasonryLayout,
  type LayoutBox,
} from './layout-engine';

export type FilterGalleryLayout = 'grid' | 'masonry' | 'justified';

const LAYOUT_GAP = 8;

export type FilterGalleryItem = {
  id: string;
  categories: readonly string[];
  node: ReactNode;
  /** Media width/height; masonry/justified use 1 when omitted. */
  aspectRatio?: number;
};

export type FilterGalleryCategory = { id: string; label: string };

export type FilterGalleryProps = {
  items: readonly FilterGalleryItem[];
  /** Controlled filter; `null` = all. Omit for uncontrolled mode. */
  filter?: string | null;
  /** Initial filter in uncontrolled mode. Default `null` (all). */
  defaultFilter?: string | null;
  onFilterChange?: (filter: string | null) => void;
  /** If provided, renders the filter button bar (always includes "All"). */
  categories?: readonly FilterGalleryCategory[];
  /** Label for the "all" button. Default `'All'`. */
  allLabel?: string;
  /** Accessible name of the filter button bar and the grid. */
  label: string;
  /** FLIP animation duration in ms. Default 240. */
  duration?: number;
  /** Additional visibility constraint; intersects with category filter. `undefined` = no constraint. */
  visibleIds?: readonly string[];
  /** Item layout. Default `grid`. */
  layout?: FilterGalleryLayout;
  /** Fixed height of each tile's chrome that JS layouts add to the media. */
  itemExtraHeight?: number;
  className?: string;
};

/**
 * Finds an item's `<li>` by id without relying on `CSS.escape` (ids may
 * contain characters that are unsafe in a CSS selector).
 */
function findItemElement(grid: HTMLUListElement, id: string): HTMLElement | null {
  for (const el of grid.querySelectorAll<HTMLElement>('[data-fg-id]')) {
    if (el.dataset.fgId === id) return el;
  }
  return null;
}

/**
 * Filterable grid with animated repositioning via manual FLIP (First-Last-Invert-Play,
 * WAAPI `element.animate`, dependency-free without View Transitions API — see spec A5).
 * Entering items perform fade+scale from 0.96. Exiting items (v0.6) are
 * kept mounted with `data-fg-exiting` + `aria-hidden` + `inert` for the duration of
 * a fade-out (deferred render: the `setState` that adds them to `exitingIds` happens
 * inside the layout effect, which forces a synchronous re-render before painting, so
 * the `<li>` remains on screen during the frame it ceases to be "visible"). If an
 * exiting id becomes visible again before finishing, entry wins: its `Animation` is
 * cancelled and it is removed from `exitingIds`. Without WAAPI or with `prefers-reduced-motion`
 * unmounting is immediate (no orphan ids ever remain in `exitingIds`). SSR-safe:
 * initial render does not measure or animate, only captures positions for the next
 * filter change.
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
  layout = 'grid',
  itemExtraHeight = 0,
  className,
}: FilterGalleryProps) {
  const gridRef = useRef<HTMLUListElement>(null);
  const previousRectsRef = useRef<Map<string, DOMRect>>(new Map());
  // Initial value calculated directly from props (not from `activeFilter`, which
  // depends on the state declared below): on the initial render they coincide, so
  // the layout effect sees `filterChanged = false` and does not animate the initial mount.
  const previousFilterRef = useRef(filter !== undefined ? filter : defaultFilter);
  const previousVisibleIdsRef = useRef(visibleIds ? visibleIds.join('\u0000') : '');
  const previousLayoutRef = useRef(layout);
  const previousLayoutBoxesRef = useRef<Map<string, LayoutBox>>(new Map());
  const previousGridRectRef = useRef<DOMRect | null>(null);
  const [internalFilter, setInternalFilter] = useState(defaultFilter);

  const activeFilter = filter !== undefined ? filter : internalFilter;
  const visible = items.filter(
    (item) =>
      (activeFilter == null || item.categories.includes(activeFilter)) &&
      (visibleIds === undefined || visibleIds.includes(item.id)),
  );
  const visibleIdSet = new Set(visible.map((item) => item.id));

  // Animated exit (v0.6): ids that ceased to be in `visible` but remain
  // mounted while their fade-out lasts. `previousRenderedIdsRef` stores the
  // visible ids from the previous render to detect additions/removals inside the layout
  // effect; `exitAnimationsRef` stores the ongoing `Animation` handle per id
  // (so it can be cancelled if the item becomes visible again before finishing, or if
  // the entire component unmounts with an exit in progress).
  const [exitingIds, setExitingIds] = useState<readonly string[]>([]);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const previousRenderedIdsRef = useRef<readonly string[]>(visible.map((item) => item.id));
  const exitAnimationsRef = useRef<Map<string, Animation>>(new Map());

  const renderedItems = items.filter(
    (item) => visibleIdSet.has(item.id) || exitingIds.includes(item.id),
  );
  const computed =
    layout !== 'grid' && containerWidth !== null && containerWidth > 0
      ? layout === 'masonry'
        ? computeMasonryLayout({
            aspectRatios: visible.map((item) => item.aspectRatio ?? 1),
            containerWidth,
            columns: columnCountForWidth(containerWidth),
            gap: LAYOUT_GAP,
            extraHeight: itemExtraHeight,
          })
        : computeJustifiedLayout({
            aspectRatios: visible.map((item) => item.aspectRatio ?? 1),
            containerWidth,
            targetRowHeight: columnWidthForWidth(containerWidth, LAYOUT_GAP),
            gap: LAYOUT_GAP,
            extraHeight: itemExtraHeight,
          })
      : null;
  const currentLayoutBoxes = new Map(
    visible.flatMap((item, index) => {
      const box = computed?.boxes[index];
      return box ? [[item.id, box] as const] : [];
    }),
  );
  const gridStyle = computed
    ? { height: computed.totalHeight }
    : layout === 'grid' && containerWidth !== null && containerWidth > 0
      ? {
          gridTemplateColumns: `repeat(${columnCountForWidth(containerWidth)}, minmax(0, 1fr))`,
        }
      : undefined;

  // Unmount-only cleanup (deps `[]`, not to be confused with the layout effect
  // below that runs on every render): if FilterGallery unmounts with any
  // exit in progress, cancels its `Animation` instances (releases the effect on the node) and
  // sets `isMountedRef` to false. `dropExiting` respects that flag: even if some
  // environment fires `onfinish` after `cancel()` (the WAAPI spec does not,
  // but not all polyfills follow it to the letter), `setExitingIds` is not called
  // on an already-unmounted component.
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      for (const anim of exitAnimationsRef.current.values()) anim.cancel();
    };
  }, []);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(([entry]) => {
      if (entry) setContainerWidth(entry.contentRect.width);
    });
    observer.observe(grid);
    return () => observer.disconnect();
  }, [layout]);

  // First (previous positions) was captured in the layout effect of the previous render;
  // here we only compare with Last (already painted positions from this render) when the
  // filter or visibleIds changed, and we recapture for the next change.
  useLayoutEffect(() => {
    const grid = gridRef.current;
    const currentVisibleIdsKey = visibleIds ? visibleIds.join('\u0000') : '';
    const filterChanged = previousFilterRef.current !== activeFilter;
    const visibleIdsChanged = previousVisibleIdsRef.current !== currentVisibleIdsKey;
    const layoutChanged = previousLayoutRef.current !== layout;
    previousFilterRef.current = activeFilter;
    previousVisibleIdsRef.current = currentVisibleIdsKey;
    previousLayoutRef.current = layout;
    if (!grid) return;

    // Detects removals (removed) and re-entries (reentered) by comparing against the
    // visible ids from the previous render. `exitingIds` here is the value from THIS render
    // (closure); if we just added new ids with `setExitingIds`, that change
    // will only be visible on the next pass of the effect — which occurs synchronously
    // (before painting) because this `setState` is triggered inside a layout
    // effect. That is why the "start animation" loop below only acts
    // on `exitingIds` (not on `removed`): on the first pass the exiting `<li>`
    // does not exist in the DOM yet (the deferred render mounts it on the
    // next pass).
    const currentIds = visible.map((item) => item.id);
    const removed = previousRenderedIdsRef.current.filter((id) => !visibleIdSet.has(id));
    const reentered = exitingIds.filter((id) => visibleIdSet.has(id));
    previousRenderedIdsRef.current = currentIds;

    if (layout === 'grid' && previousGridRectRef.current) {
      const gridRect = previousGridRectRef.current;
      for (const id of removed) {
        const itemRect = previousRectsRef.current.get(id);
        if (!itemRect) continue;
        previousLayoutBoxesRef.current.set(id, {
          x: itemRect.left - gridRect.left,
          y: itemRect.top - gridRect.top,
          width: itemRect.width,
          height: itemRect.height,
        });
      }
    }

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

    if ((filterChanged || visibleIdsChanged || layoutChanged) && !prefersReducedMotion()) {
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
    previousGridRectRef.current = grid.getBoundingClientRect();
    previousLayoutBoxesRef.current = new Map([
      ...previousLayoutBoxesRef.current,
      ...currentLayoutBoxes,
    ]);
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
      <ul
        aria-label={label}
        className="mk-filter-gallery__grid"
        data-layout={layout}
        ref={gridRef}
        style={gridStyle}
      >
        {renderedItems.map((item) => {
          const isExiting = !visibleIdSet.has(item.id);
          const box = isExiting
            ? previousLayoutBoxesRef.current.get(item.id)
            : currentLayoutBoxes.get(item.id);
          return (
            <li
              key={item.id}
              data-fg-id={item.id}
              data-fg-exiting={isExiting ? '' : undefined}
              aria-hidden={isExiting ? true : undefined}
              inert={isExiting || undefined}
              style={
                box
                  ? {
                      position: isExiting ? 'absolute' : undefined,
                      left: box.x,
                      top: box.y,
                      width: box.width,
                      height: box.height,
                    }
                  : undefined
              }
            >
              {item.node}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

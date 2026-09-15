'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ShowcaseIndex } from '@/components/showcase/showcase-index';
import type { FilterableItem } from '@/components/ui/filterable-list';

/** Synthetic ID for the "Todas" index entry: does not correspond to any real section. */
const ALL_ID = '__all';

export type ShowcaseSection = { id: string; node: ReactNode };

export type ShowcaseViewLabels = {
  /** aria-label of the `<nav>` that wraps the table of contents. */
  navLabel: string;
  inputLabel: string;
  emptyMessage: string;
  placeholder?: string;
  /** Label for the synthetic entry that restores all sections. */
  all: string;
  /** Contains the literal placeholder `{section}`, replaced with the active section's title. */
  showing: string;
  showingAll: string;
};

export type ShowcaseViewProps = {
  toc: readonly FilterableItem[];
  labels: ShowcaseViewLabels;
  sections: readonly ShowcaseSection[];
  /** Page header (title, intro, actions): rendered before the filtered sections. */
  children?: ReactNode;
};

/**
 * Client container for the showcase (B1): the table of contents stops scrolling to anchors and instead
 * filters which sections are shown. The filter is reflected in `location.hash` for
 * deep-linking, without relying on scroll — an initial hash matching a section
 * starts already filtered.
 */
export function ShowcaseView({ toc, labels, sections, children }: ShowcaseViewProps) {
  const [filter, setFilter] = useState<string | null>(null);

  // Solo al montar: sincroniza el filtro inicial con el deep-link (#id) si existe.
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && toc.some((item) => item.id === hash)) {
      setFilter(hash);
    }
    // Deliberately empty: should only run once on mount, not when `toc` changes.
  }, []);

  // Skips the first execution: on mount, this effect runs in the same commit as
  // el de arriba, ANTES de que su setFilter surta efecto (el filtro inicial sigue siendo
  // `null` in that first step), so it would write the URL without a hash and clear it
  // momentarily on a deep-link — only to then "restore" it when the filter
  // actualice. Sin esta guarda, el hash desaparece y reaparece en cada carga con deep-link.
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    window.history.replaceState(
      null,
      '',
      filter ? `#${filter}` : window.location.pathname + window.location.search,
    );
  }, [filter]);

  const items: FilterableItem[] = [{ id: ALL_ID, label: labels.all }, ...toc];
  const activeLabel = filter ? toc.find((item) => item.id === filter)?.label : undefined;
  const visibleSections = filter ? sections.filter((section) => section.id === filter) : sections;

  return (
    <>
      {/* Visible across all breakpoints (T30/I2): in <lg there is no grid (see `main` in
          page.tsx), so DOM order already places it as a normal block
          above the content, without redesign. In ≥lg, `main` switches to a two-column
          grid and here only the sidebar's sticky behavior is activated. */}
      <nav aria-label={labels.navLabel} className="mb-8 lg:sticky lg:top-12 lg:mb-0">
        <ShowcaseIndex
          items={items}
          inputLabel={labels.inputLabel}
          emptyMessage={labels.emptyMessage}
          placeholder={labels.placeholder}
          selectedId={filter ?? ALL_ID}
          onSelect={(id) => setFilter(id === ALL_ID ? null : id)}
        />
      </nav>
      <div className="flex flex-col gap-14">
        {children}
        <p role="status" className="sr-only">
          {filter && activeLabel
            ? labels.showing.replace('{section}', activeLabel)
            : labels.showingAll}
        </p>
        {visibleSections.map((section) => (
          <div
            key={section.id}
            className="transition-opacity duration-150 motion-reduce:transition-none"
          >
            {section.node}
          </div>
        ))}
      </div>
    </>
  );
}

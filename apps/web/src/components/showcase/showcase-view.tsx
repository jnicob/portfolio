'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ShowcaseIndex } from '@/components/showcase/showcase-index';
import type { FilterableItem } from '@/components/ui/filterable-list';

/** Id sintético de la entrada "Todas" del índice: no corresponde a ninguna sección real. */
const ALL_ID = '__all';

export type ShowcaseSection = { id: string; node: ReactNode };

export type ShowcaseViewLabels = {
  /** aria-label del `<nav>` que envuelve el índice. */
  navLabel: string;
  inputLabel: string;
  emptyMessage: string;
  placeholder?: string;
  /** Etiqueta de la entrada sintética que restaura todas las secciones. */
  all: string;
  /** Contiene el placeholder literal `{section}`, reemplazado por el título de la sección activa. */
  showing: string;
  showingAll: string;
};

export type ShowcaseViewProps = {
  toc: readonly FilterableItem[];
  labels: ShowcaseViewLabels;
  sections: readonly ShowcaseSection[];
  /** Cabecera de la página (título, intro, acciones): se renderiza antes de las secciones filtradas. */
  children?: ReactNode;
};

/**
 * Contenedor cliente del showcase (B1): el índice deja de hacer scroll a anclas y en su
 * lugar filtra qué secciones se muestran. El filtro se refleja en `location.hash` para
 * deep-linking, sin depender de scroll — un hash inicial que coincida con una sección
 * arranca ya filtrado.
 */
export function ShowcaseView({ toc, labels, sections, children }: ShowcaseViewProps) {
  const [filter, setFilter] = useState<string | null>(null);

  // Solo al montar: sincroniza el filtro inicial con el deep-link (#id) si existe.
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && toc.some((item) => item.id === hash)) {
      setFilter(hash);
    }
    // Deliberadamente vacío: solo debe correr una vez al montar, no cuando cambie `toc`.
  }, []);

  // Salta la primera ejecución: en el montaje, este efecto corre en el mismo commit que
  // el de arriba, ANTES de que su setFilter surta efecto (el filtro inicial sigue siendo
  // `null` en ese primer paso), así que escribiría la URL sin hash y lo borraría
  // momentáneamente en un deep-link — para luego "restaurarlo" cuando el filtro se
  // actualice. Sin esta guarda, el hash desaparece y reaparece en cada carga con deep-link.
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    window.history.replaceState(null, '', filter ? `#${filter}` : window.location.pathname);
  }, [filter]);

  const items: FilterableItem[] = [{ id: ALL_ID, label: labels.all }, ...toc];
  const activeLabel = filter ? toc.find((item) => item.id === filter)?.label : undefined;
  const visibleSections = filter ? sections.filter((section) => section.id === filter) : sections;

  return (
    <>
      <nav aria-label={labels.navLabel} className="hidden lg:block">
        <div className="sticky top-12">
          <ShowcaseIndex
            items={items}
            inputLabel={labels.inputLabel}
            emptyMessage={labels.emptyMessage}
            placeholder={labels.placeholder}
            selectedId={filter ?? ALL_ID}
            onSelect={(id) => setFilter(id === ALL_ID ? null : id)}
          />
        </div>
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

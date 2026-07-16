'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { FilterableList, type FilterableItem } from '@/components/ui/filterable-list';
import { applySkin, currentSkin } from '@/lib/appearance';
import { SKINS } from '@/data/schemas';
import type { Skin } from '@/data/schemas';

type SkinItem = FilterableItem & { id: Skin };

/** Keywords de filtro por skin — no traducibles (identifican el "look", no el nombre). */
const SKIN_KEYWORDS: Record<Skin, readonly string[]> = {
  'dev-tool': ['default', 'code'],
  editorial: ['serif', 'cv', 'reading'],
  terminal: ['mono', 'brutalist', 'green'],
  vibrant: ['playful', 'saturated', 'pink'],
};

export type SkinSwitcherLabels = {
  button: string;
  inputLabel: string;
  placeholder?: string;
  emptyMessage: string;
  skinNames: Record<Skin, string>;
};

function findComboboxInput(container: HTMLElement | null): HTMLInputElement | null {
  return container?.querySelector<HTMLInputElement>('[role="combobox"]') ?? null;
}

/** Disclosure en el header: aplica un skin (T20) eligiéndolo de una FilterableList (T22). */
export function SkinSwitcher({ labels }: { labels: SkinSwitcherLabels }) {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [selectedSkin, setSelectedSkin] = useState<Skin | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const items: SkinItem[] = SKINS.map((skin) => ({
    id: skin,
    label: labels.skinNames[skin],
    keywords: SKIN_KEYWORDS[skin],
  }));

  // Foco al abrir: FilterableList no expone ref, así que se busca el combobox montado.
  useEffect(() => {
    if (!open) return;
    findComboboxInput(panelRef.current)?.focus();
  }, [open]);

  // Click fuera del wrapper (botón + panel) cierra el disclosure.
  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  function closeAndFocusButton() {
    setOpen(false);
    buttonRef.current?.focus();
  }

  function handleSelect(item: SkinItem) {
    applySkin(item.id);
    closeAndFocusButton();
  }

  // El combobox ya limpia el filtro con Escape (T22); si ya estaba vacío, esta
  // Escape cierra el panel en su lugar (misma tecla, dos pasos).
  function handlePanelKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Escape') return;
    if (findComboboxInput(panelRef.current)?.value === '') {
      closeAndFocusButton();
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        className="inline-flex h-9 cursor-pointer items-center justify-center rounded-control border border-border px-3 text-sm text-fg transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        onClick={() => {
          // Se lee la skin aplicada de forma síncrona, en el mismo batch que
          // setOpen: FilterableList monta con el selectedId correcto desde su
          // primer render (su activeIndex inicial es un useState perezoso que
          // solo se calcula una vez, al montar).
          setSelectedSkin(currentSkin());
          setOpen((value) => !value);
        }}
      >
        {labels.button}
      </button>
      {open && (
        <div
          id={panelId}
          ref={panelRef}
          onKeyDown={handlePanelKeyDown}
          className="absolute right-0 top-full z-10 mt-2 w-56 rounded-card border border-border bg-surface p-3"
        >
          <FilterableList
            items={items}
            inputLabel={labels.inputLabel}
            placeholder={labels.placeholder}
            emptyMessage={labels.emptyMessage}
            onSelect={handleSelect}
            selectedId={selectedSkin ?? undefined}
            renderItem={(item) => (
              <span className="flex items-center gap-2">
                <span
                  aria-hidden
                  data-skin={item.id}
                  className="skin-swatch inline-block size-3 shrink-0 rounded-full border border-border"
                />
                {item.label}
              </span>
            )}
          />
        </div>
      )}
    </div>
  );
}

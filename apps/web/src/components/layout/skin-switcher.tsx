'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { FilterableList, type FilterableItem } from '@/components/ui/filterable-list';
import { applySkin, currentSkin } from '@/lib/appearance';
import { SKINS } from '@/data/constants';
import type { Skin } from '@/data/constants';

type SkinItem = FilterableItem & { id: Skin };

/** Skin filter keywords — non-translatable (identifies look, not name). */
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

/** Disclosure in the header: applies a skin (T20) selecting it from a FilterableList (T22). */
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

  // Focus on open: FilterableList does not expose a ref, so the mounted combobox is searched for.
  useEffect(() => {
    if (!open) return;
    findComboboxInput(panelRef.current)?.focus();
  }, [open]);

  // Click outside wrapper (button + panel) closes disclosure.
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

  // Cierre por capas, de adentro hacia afuera (misma tecla, tres pasos): Escape
  // with text → the combobox clears the filter (T22); with the filter already empty →
  // this panel is closed. In BOTH cases the keydown is consumed here with
  // stopPropagation: if it continued bubbling up, it would also close a disclosure
  // ancestro (p.ej. el MobileMenu, cuando este switcher vive dentro de su
  // panel) en el mismo golpe de tecla.
  function handlePanelKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Escape') return;
    event.stopPropagation();
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
          // The applied skin is read synchronously, in the same batch as
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

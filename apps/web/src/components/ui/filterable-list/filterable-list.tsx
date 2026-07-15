'use client';

import { useId, useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/cn';

export type FilterableItem = { id: string; label: string; keywords?: readonly string[] };

export type FilterableListProps<T extends FilterableItem> = {
  items: readonly T[];
  /** Label accesible del input (visible u oculto via labelClassName sr-only). */
  inputLabel: string;
  emptyMessage: string;
  onSelect: (item: T) => void;
  placeholder?: string;
  /** Contenido custom del item (swatches…); default: item.label. */
  renderItem?: (item: T, active: boolean) => ReactNode;
  className?: string;
};

function matchesQuery(item: FilterableItem, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  if (item.label.toLowerCase().includes(normalized)) return true;
  return (item.keywords ?? []).some((keyword) => keyword.toLowerCase().includes(normalized));
}

export function FilterableList<T extends FilterableItem>({
  items,
  inputLabel,
  emptyMessage,
  onSelect,
  placeholder,
  renderItem,
  className,
}: FilterableListProps<T>): ReactNode {
  const baseId = useId();
  const listboxId = `${baseId}-listbox`;
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = useMemo(() => items.filter((item) => matchesQuery(item, query)), [items, query]);

  // Clamp derivado en render (no efecto): si el filtro reduce la lista, el
  // índice activo cae dentro de rango sin necesitar sincronizar estado extra.
  const clampedActiveIndex =
    filtered.length === 0 ? -1 : Math.min(activeIndex, filtered.length - 1);
  const activeItem = clampedActiveIndex >= 0 ? filtered[clampedActiveIndex] : undefined;
  const activeOptionId = activeItem ? `${baseId}-option-${activeItem.id}` : undefined;

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (filtered.length === 0) return;
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((clampedActiveIndex + delta + filtered.length) % filtered.length);
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      if (activeItem) onSelect(activeItem);
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      setQuery('');
      setActiveIndex(0);
    }
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Input
        role="combobox"
        aria-expanded="true"
        aria-controls={listboxId}
        aria-activedescendant={activeOptionId}
        aria-autocomplete="list"
        aria-label={inputLabel}
        value={query}
        placeholder={placeholder}
        onChange={(event) => {
          setQuery(event.target.value);
          setActiveIndex(0);
        }}
        onKeyDown={onKeyDown}
      />
      <ul id={listboxId} role="listbox" aria-label={inputLabel} className="flex flex-col gap-1">
        {filtered.map((item, index) => {
          const active = index === clampedActiveIndex;
          return (
            <li
              key={item.id}
              id={`${baseId}-option-${item.id}`}
              role="option"
              aria-selected={active}
              onClick={() => onSelect(item)}
              className={cn(
                'cursor-pointer rounded-control px-3 py-2 text-sm text-fg',
                active && 'bg-surface outline outline-2 outline-ring',
              )}
            >
              {renderItem ? renderItem(item, active) : item.label}
            </li>
          );
        })}
      </ul>
      {filtered.length === 0 && (
        <p role="status" className="text-sm text-fg-muted">
          {emptyMessage}
        </p>
      )}
    </div>
  );
}

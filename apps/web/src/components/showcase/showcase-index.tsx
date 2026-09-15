'use client';

import { FilterableList, type FilterableItem } from '@/components/ui/filterable-list';
import { Select } from '@/components/ui/select';

export type ShowcaseIndexProps = {
  items: readonly FilterableItem[];
  inputLabel: string;
  emptyMessage: string;
  placeholder?: string;
  /** Invocado con el id del item elegido; no toca `location.hash` (lo hace quien filtra, ShowcaseView). */
  onSelect: (id: string) => void;
  /** ID of the currently applied item (marks the active option in the list). */
  selectedId?: string;
};

/** Filterable index of the showcase (T23): selection is delegated via `onSelect` (B1 — filters, does not scroll). */
export function ShowcaseIndex({
  items,
  inputLabel,
  emptyMessage,
  placeholder,
  onSelect,
  selectedId,
}: ShowcaseIndexProps) {
  return (
    <>
      <div className="sm:hidden">
        <Select
          aria-label={inputLabel}
          value={selectedId ?? items[0]?.id ?? ''}
          onChange={(e) => onSelect(e.target.value)}
          options={items.map((item) => ({ value: item.id, label: item.label }))}
        />
      </div>
      <div className="hidden sm:block">
        <FilterableList
          items={items}
          inputLabel={inputLabel}
          emptyMessage={emptyMessage}
          placeholder={placeholder}
          selectedId={selectedId}
          onSelect={(item) => onSelect(item.id)}
        />
      </div>
    </>
  );
}

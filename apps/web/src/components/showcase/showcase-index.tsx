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
  /** Id del item actualmente aplicado (marca la opción activa en la lista). */
  selectedId?: string;
};

/** Índice filtrable del showcase (T23): la selección se delega vía `onSelect` (B1 — filtra, no hace scroll). */
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

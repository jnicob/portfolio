'use client';

import { FilterableList, type FilterableItem } from '@/components/ui/filterable-list';

export type ShowcaseIndexProps = {
  items: readonly FilterableItem[];
  inputLabel: string;
  emptyMessage: string;
};

/** Índice filtrable del showcase (T23): sustituye la lista fija de anclas del TOC. */
export function ShowcaseIndex({ items, inputLabel, emptyMessage }: ShowcaseIndexProps) {
  return (
    <FilterableList
      items={items}
      inputLabel={inputLabel}
      emptyMessage={emptyMessage}
      onSelect={(item) => {
        window.location.hash = item.id;
      }}
    />
  );
}

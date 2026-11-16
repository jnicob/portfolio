'use client';

import {
  createContext,
  useContext,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/cn';

type TabsContextValue = {
  active: string;
  setActive: (value: string) => void;
  baseId: string;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs(component: string): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error(`${component} debe usarse dentro de <Tabs>`);
  return ctx;
}

export function Tabs({ defaultValue, children }: { defaultValue: string; children: ReactNode }) {
  const [active, setActive] = useState(defaultValue);
  const baseId = useId();
  return (
    <TabsContext.Provider value={{ active, setActive, baseId }}>
      {/* Grid root: row 1 auto for `TabList`, row 2 (1fr) shared by
          all `TabPanel`s (same cell, see comment in TabPanel). */}
      <div className="grid grid-rows-[auto_1fr]">{children}</div>
    </TabsContext.Provider>
  );
}

export function TabList({ label, children }: { label: string; children: ReactNode }) {
  const listRef = useRef<HTMLDivElement>(null);

  // Arrow navigation following APG: selection follows focus with wrap.
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const tabs = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [],
    );
    const current = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (current === -1) return;
    event.preventDefault();
    const delta = event.key === 'ArrowRight' ? 1 : -1;
    const next = tabs[(current + delta + tabs.length) % tabs.length];
    next?.focus();
    next?.click();
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className="inline-flex gap-1 rounded-control border border-border bg-surface p-1"
    >
      {children}
    </div>
  );
}

export function Tab({ value, children }: { value: string; children: ReactNode }) {
  const { active, setActive, baseId } = useTabs('Tab');
  const selected = active === value;
  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-selected={selected}
      aria-controls={`${baseId}-panel-${value}`}
      tabIndex={selected ? 0 : -1}
      onClick={() => setActive(value)}
      className={cn(
        // Cursor + hover reuse Button's visual language (T14): active ~ primary variant
        // (bg-accent + hover:bg-accent-hover). Inactive CANNOT copy Button ghost's
        // `hover:bg-surface` as-is: `TabList` already paints its background with
        // `bg-surface`, so that hover would be invisible over itself. Semantic step `border`
        // provides contrast. Explicit `cursor-pointer` because Tailwind v4 no longer sets it by default.
        'cursor-pointer rounded-control px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        selected
          ? 'bg-accent text-accent-fg hover:bg-accent-hover'
          : 'text-fg-muted hover:bg-border hover:text-fg',
      )}
    >
      {children}
    </button>
  );
}

export function TabPanel({ value, children }: { value: string; children: ReactNode }) {
  const { active, baseId } = useTabs('TabPanel');
  const selected = active === value;
  // Both panels stay mounted and share the same grid cell
  // (`col-start-1 row-start-2`, see `Tabs`): the container height becomes
  // that of the tallest panel, so switching tabs does not shift it. The
  // inactive panel uses `invisible` (visibility:hidden) instead of `hidden`
  // (display:none) — retaining its box so the grid keeps measuring it.
  // `aria-hidden` removes it from the accessibility tree and `tabIndex` is omitted
  // (undefined) so it is not focusable. The active panel fades in over 150ms.
  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      aria-hidden={!selected}
      tabIndex={selected ? 0 : undefined}
      className={cn(
        'col-start-1 row-start-2 mt-3 transition-opacity duration-150 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        selected ? 'opacity-100' : 'invisible opacity-0',
      )}
    >
      {children}
    </div>
  );
}
